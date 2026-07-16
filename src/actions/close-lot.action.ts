"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { triggerPaymentFlow, chargeInvoiceWithStoredPayment } from "./payment.action";
import { sendEmailAction } from "@/actions/sendEmail.action";

/**
 * Parse buyer's premium from auction (e.g. "12%" or "12" -> 12)
 */
function parseBuyerPremiumPct(buyersPremium: string | null): number {
  if (!buyersPremium) return 0;
  const match = buyersPremium.match(/^(\d+(?:\.\d+)?)\s*%?$/);
  return match ? parseFloat(match[1]) : 0;
}

/**
 * Generate unique invoice display ID (e.g. INV-2024-a1b2c3d4)
 */
function generateInvoiceDisplayId(): string {
  const year = new Date().getFullYear();
  const suffix = crypto.randomUUID().slice(0, 8);
  return `INV-${year}-${suffix}`;
}

export type CloseLotResult =
  | { success: true; lotStatus: "SOLD" | "UNSOLD"; ordersCreated: number }
  | { error: string };

/**
 * Close a lot. Call when lot.closesAt has passed (e.g. from a cron or job).
 *
 * Flow:
 * 1. LOT CLOSE        – Atomically mark lot SOLD or UNSOLD (optimistic lock: only if still LIVE)
 * 2. Determine winner – Set winningBidId/winningBidAmount on each item (highest bid wins)
 * 3. Create Order     – One order per buyer for their won items in this lot
 * 4. Generate Invoice  – One invoice per order (with InvoiceItems via createMany)
 * 5. Charge stored payment method – Attempt to charge buyer's saved card (Stripe); else leave PENDING
 * 6. Notify buyer + seller – Email buyers ("You won – pay / payment received") and seller ("Lot sold")
 *
 * Concurrent-run safe: the lot.updateMany with `status: "LIVE"` condition is an atomic
 * optimistic lock — if two cron invocations race, the second returns 0 rows updated and
 * exits the transaction early without creating duplicate orders/invoices.
 */
export async function closeLot(lotId: string): Promise<CloseLotResult> {
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    include: {
      items: { select: { id: true, title: true } },
      store: {
        select: {
          id: true,
          ownerId: true,
          name: true,
          owner: { select: { email: true, name: true } },
        },
      },
      auction: { select: { buyersPremium: true } },
    },
  });

  if (!lot) {
    return { error: "Lot not found." };
  }

  if (lot.status !== "LIVE") {
    return { error: `Lot is not LIVE (status: ${lot.status}).` };
  }

  const sellerId = lot.store.ownerId;
  const buyerPremiumPct = parseBuyerPremiumPct(lot.auction?.buyersPremium ?? null);

  // Set inside the transaction once the fresh winner read resolves it; read by the final
  // return below. Safe to mutate from the transaction closure — this is plain in-process JS,
  // not shared across concurrent requests.
  let resolvedLotStatus: "SOLD" | "UNSOLD" = "UNSOLD";

  // Declared inside and returned from the transaction so it is only populated when the
  // transaction commits. If the transaction rolls back, we never attempt payment or emails
  // against invoice IDs that don't exist in the database.
  const createdInvoices = await prisma.$transaction(async (tx) => {
    const invoices: Array<{
      invoiceId: string;
      buyerId: string;
      itemTitles: string[];
      total: number;
    }> = [];

    // Re-read winning bids *inside* the transaction, immediately before the atomic status
    // flip below. A bid can legally land right up until the lot's status actually changes
    // to non-LIVE (placeBidAction checks status fresh in its own transaction) — reading bids
    // here, as late as possible, instead of before the transaction started, keeps the window
    // in which a just-placed bid could be missed as small as the optimistic lock itself,
    // rather than spanning the entire pre-transaction query + computation.
    const itemsWithBids = await tx.item.findMany({
      where: { lotId },
      select: {
        id: true,
        // Primary: highest amount wins. Secondary: earliest bid at that amount wins (first in time).
        bids: { orderBy: [{ amount: "desc" }, { createdAt: "asc" }], take: 1 },
      },
    });

    const wonItems: Array<{
      itemId: string;
      winningBidId: string;
      winningBidAmount: number;
      buyerId: string;
    }> = [];
    for (const item of itemsWithBids) {
      const winningBid = item.bids[0];
      if (winningBid) {
        wonItems.push({
          itemId: item.id,
          winningBidId: winningBid.id,
          winningBidAmount: Number(winningBid.amount), // Prisma returns Decimal; convert explicitly
          buyerId: winningBid.userId,
        });
      }
    }

    const lotStatus: "SOLD" | "UNSOLD" = wonItems.length > 0 ? "SOLD" : "UNSOLD";
    resolvedLotStatus = lotStatus;

    // 1. Atomically mark lot SOLD/UNSOLD — only succeeds if status is still LIVE.
    //    If a concurrent cron run already closed it, count === 0 and we bail out.
    const updatedLot = await tx.lot.updateMany({
      where: { id: lotId, status: "LIVE" },
      data: { status: lotStatus },
    });
    if (updatedLot.count === 0) return; // another process already closed this lot

    if (wonItems.length === 0) return;

    // 2. Set winningBidId + winningBidAmount on each won item
    for (const w of wonItems) {
      await tx.item.update({
        where: { id: w.itemId },
        data: {
          winningBidId: w.winningBidId,
          winningBidAmount: w.winningBidAmount,
        },
      });
    }

    // 3. Create Order + 4. Generate Invoice per buyer
    const wonByBuyer = new Map<
      string,
      Array<{
        itemId: string;
        winningBidId: string;
        winningBidAmount: number;
        itemTitle: string;
      }>
    >();
    for (const w of wonItems) {
      const item = lot.items.find((i) => i.id === w.itemId);
      const list = wonByBuyer.get(w.buyerId) ?? [];
      list.push({
        itemId: w.itemId,
        winningBidId: w.winningBidId,
        winningBidAmount: w.winningBidAmount,
        itemTitle: item?.title ?? "Item",
      });
      wonByBuyer.set(w.buyerId, list);
    }

    for (const [buyerId, items] of wonByBuyer) {
      let orderSubtotal = 0;
      let orderBuyerPremium = 0;
      let orderTax = 0;
      let orderTotal = 0;
      let winningBidAmountSum = 0;

      const orderItemsData = items.map((it) => {
        const buyerPremium = it.winningBidAmount * (buyerPremiumPct / 100);
        const subtotal = it.winningBidAmount;
        const tax = 0; // TODO: apply tax if applicable
        const total = subtotal + buyerPremium + tax;
        orderSubtotal += subtotal;
        orderBuyerPremium += buyerPremium;
        orderTax += tax;
        orderTotal += total;
        winningBidAmountSum += it.winningBidAmount;
        return { ...it, subtotal, buyerPremium, tax, total };
      });

      const order = await tx.order.create({
        data: {
          buyerId,
          lotId,
          subtotal: orderSubtotal,
          buyerPremium: orderBuyerPremium,
          tax: orderTax,
          total: orderTotal,
          status: "PENDING",
        },
      });

      // Use createMany to avoid N+1 queries for order items and invoice items.
      await tx.orderItem.createMany({
        data: orderItemsData.map((oi) => ({
          orderId: order.id,
          itemId: oi.itemId,
          subtotal: oi.subtotal,
          buyerPremium: oi.buyerPremium,
          tax: oi.tax,
          total: oi.total,
        })),
      });

      const invoice = await tx.invoice.create({
        data: {
          invoiceDisplayId: generateInvoiceDisplayId(),
          orderId: order.id,
          buyerId,
          sellerId,
          lotId,
          winningBidAmount: winningBidAmountSum,
          buyerPremiumPct,
          tax: orderTax,
          invoiceTotal: orderTotal,
          status: "PENDING",
        },
      });

      await tx.invoiceItem.createMany({
        data: orderItemsData.map((oi) => ({
          invoiceId: invoice.id,
          itemId: oi.itemId,
        })),
      });

      invoices.push({
        invoiceId: invoice.id,
        buyerId,
        itemTitles: items.map((i) => i.itemTitle),
        total: orderTotal,
      });
    }

    return invoices;
  });

  // Transaction may return undefined if it exited early (concurrent close already ran).
  if (!createdInvoices || createdInvoices.length === 0) {
    return { success: true, lotStatus: resolvedLotStatus, ordersCreated: 0 };
  }

  // 5. Trigger payment flow then auto-charge stored payment method for each invoice
  const STRIPE_MIN_AMOUNT = 0.5;
  const autoChargedInvoiceIds = new Set<string>();
  for (const inv of createdInvoices) {
    if (inv.total < STRIPE_MIN_AMOUNT) {
      console.warn(
        `Invoice ${inv.invoiceId} total $${inv.total.toFixed(2)} below Stripe minimum ($${STRIPE_MIN_AMOUNT}); buyer must contact support.`
      );
      continue;
    }
    try {
      await triggerPaymentFlow(inv.invoiceId);
      const charge = await chargeInvoiceWithStoredPayment(inv.invoiceId);
      if (charge.charged) {
        autoChargedInvoiceIds.add(inv.invoiceId);
      } else if (charge.reason) {
        console.warn(`Invoice ${inv.invoiceId} not auto-charged: ${charge.reason}`);
      }
    } catch (err) {
      console.error(`Error triggering payment for invoice ${inv.invoiceId}:`, err);
    }
  }

  // 6. Notify buyer(s) and seller
  if (createdInvoices.length > 0) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const buyerIds = [...new Set(createdInvoices.map((i) => i.buyerId))];
    const buyers = await prisma.user.findMany({
      where: { id: { in: buyerIds } },
      select: { id: true, email: true, name: true },
    });

    for (const buyer of buyers) {
      const inv = createdInvoices.find((i) => i.buyerId === buyer.id);
      if (!inv) continue;
      const totalAmount = inv.total;
      const itemsList = inv.itemTitles.map((t) => `• ${t}`).join("\n");
      const wasCharged = autoChargedInvoiceIds.has(inv.invoiceId);

      try {
        await sendEmailAction({
          to: buyer.email,
          subject: wasCharged
            ? "You Won! – Payment Received"
            : "You Won! – Payment Required",
          meta: {
            description: wasCharged
              ? `Congratulations! You won item(s) from lot "${lot.title}".\n\n${itemsList}\n\nTotal: $${totalAmount.toFixed(2)}\n\nWe've charged your saved payment method. Your order is confirmed.`
              : `Congratulations! You won item(s) from lot "${lot.title}".\n\n${itemsList}\n\nTotal: $${totalAmount.toFixed(2)}\n\nPlease complete payment to finalize your purchase.`,
            link: `${appUrl}/buyers-dashboard/orders`,
          },
        });
      } catch (emailErr) {
        console.error(`Error sending buyer email to ${buyer.email}:`, emailErr);
      }
    }

    const seller = lot.store.owner;
    if (seller?.email) {
      const soldSummary = createdInvoices
        .map((inv) => {
          const paid = autoChargedInvoiceIds.has(inv.invoiceId)
            ? " (paid)"
            : " (payment pending)";
          return `• ${inv.itemTitles.join(", ")} – $${inv.total.toFixed(2)}${paid}`;
        })
        .join("\n");

      try {
        await sendEmailAction({
          to: seller.email,
          subject: "Lot Sold – Items Sold",
          meta: {
            description: `Your lot "${lot.title}" from store "${lot.store.name}" has sold.\n\nSold items:\n${soldSummary}\n\nBuyers have been notified.`,
            link: `${appUrl}/my-auctions`,
          },
        });
      } catch (emailErr) {
        console.error("Error sending seller email:", emailErr);
      }
    }
  }

  revalidatePath(`/lots/${lotId}`);
  revalidatePath(`/stores/${lot.store.id}`);
  revalidatePath(`/buyers-dashboard`);
  revalidatePath(`/buyers-dashboard/bids`);
  return { success: true, lotStatus: resolvedLotStatus, ordersCreated: createdInvoices.length };
}
