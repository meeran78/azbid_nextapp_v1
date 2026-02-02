"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { triggerPaymentFlow } from "./payment.action";
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
 * Close a lot: mark as SOLD/UNSOLD, set winning bids, create orders, generate invoices.
 * Call this when lot.closesAt has passed.
 */
export async function closeLot(lotId: string): Promise<CloseLotResult> {
  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    include: {
      items: {
        include: {
          bids: { orderBy: { amount: "desc" }, take: 1 },
        },
      },
      store: {
        select: {
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

  const wonItems: Array<{
    itemId: string;
    winningBidId: string;
    winningBidAmount: number;
    buyerId: string;
  }> = [];

  for (const item of lot.items) {
    const winningBid = item.bids[0];
    if (winningBid) {
      wonItems.push({
        itemId: item.id,
        winningBidId: winningBid.id,
        winningBidAmount: winningBid.amount,
        buyerId: winningBid.userId,
      });
    }
  }

  const lotStatus: "SOLD" | "UNSOLD" = wonItems.length > 0 ? "SOLD" : "UNSOLD";

  const createdInvoices: Array<{
    invoiceId: string;
    buyerId: string;
    itemTitles: string[];
    total: number;
  }> = [];

  await prisma.$transaction(async (tx) => {
    // 1. Mark lot as SOLD / UNSOLD
    await tx.lot.update({
      where: { id: lotId },
      data: { status: lotStatus },
    });

    if (wonItems.length === 0) return;

    // 2. Set winningBidId + winningBidAmount on each item
    for (const w of wonItems) {
      await tx.item.update({
        where: { id: w.itemId },
        data: {
          winningBidId: w.winningBidId,
          winningBidAmount: w.winningBidAmount,
        },
      });
    }

    // 3. Create Order + 4. Generate Invoice per buyer (one Order + one Invoice for multiple items won)
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

      for (const oi of orderItemsData) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            itemId: oi.itemId,
            subtotal: oi.subtotal,
            buyerPremium: oi.buyerPremium,
            tax: oi.tax,
            total: oi.total,
          },
        });
      }

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

      for (const oi of orderItemsData) {
        await tx.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            itemId: oi.itemId,
          },
        });
      }

      createdInvoices.push({
        invoiceId: invoice.id,
        buyerId,
        itemTitles: items.map((i) => i.itemTitle),
        total: orderTotal,
      });
    }
  });

  // 5. Trigger payment flow for each invoice (create Stripe PaymentIntent)
  for (const inv of createdInvoices) {
    try {
      await triggerPaymentFlow(inv.invoiceId);
    } catch (err) {
      console.error(`Error triggering payment for invoice ${inv.invoiceId}:`, err);
    }
  }

  // 6. Notify buyer(s) and seller
  if (createdInvoices.length > 0) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // One invoice per buyer (with multiple items)
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

      try {
        await sendEmailAction({
          to: buyer.email,
          subject: "You Won! – Payment Required",
          meta: {
            description: `Congratulations! You won item(s) from lot "${lot.title}".\n\n${itemsList}\n\nTotal: $${totalAmount.toFixed(2)}\n\nPlease complete payment to finalize your purchase.`,
            link: `${appUrl}/buyers-dashboard?invoiceId=${inv.invoiceId}`,
          },
        });
      } catch (emailErr) {
        console.error(`Error sending buyer email to ${buyer.email}:`, emailErr);
      }
    }

    // Notify seller
    const seller = lot.store.owner;
    if (seller?.email) {
      const soldSummary = createdInvoices
        .map(
          (inv) =>
            `• ${inv.itemTitles.join(", ")} – $${inv.total.toFixed(2)} (buyer invoice created)`
        )
        .join("\n");

      try {
        await sendEmailAction({
          to: seller.email,
          subject: "Lot Sold – Items Sold",
          meta: {
            description: `Your lot "${lot.title}" from store "${lot.store.name}" has sold.\n\nSold items:\n${soldSummary}\n\nBuyers have been notified to complete payment.`,
            link: `${appUrl}/my-auctions`,
          },
        });
      } catch (emailErr) {
        console.error("Error sending seller email:", emailErr);
      }
    }
  }

  revalidatePath(`/lots/${lotId}`);
  return { success: true, lotStatus, ordersCreated: wonItems.length };
}
