"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getMinimumNextBid, validateBidAmount } from "@/lib/bid-increment";
import { ensureBuyerHasValidCard } from "@/actions/payment.action";

/**
 * Place a bid on an item. Requires signed-in user with BUYER role.
 *
 * Soft-close extension: if a bid is placed while **positive** time remains until close
 * and that remaining time is within softCloseWindowSec (e.g. last 2 minutes), closesAt
 * is extended by softCloseExtendSec (e.g. 60 seconds). Repeats until softCloseExtendLimit.
 * If closesAt is already past but the lot is still LIVE (cron not run yet), remaining time
 * is 0 — we do **not** extend (avoid treating overtime as "in the soft-close window").
 *
 * Race-condition safety: all validation and writes happen inside a single interactive
 * transaction. An optimistic lock on item.currentPrice ensures that if another bid lands
 * between our read and our write, we detect it and return an error instead of silently
 * overwriting the higher bid.
 */
export async function placeBidAction(
  itemId: string,
  amount: number
): Promise<{ success: true } | { error: string }> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { error: "Please sign in to place a bid." };
  }

  if (session.user.role !== "BUYER") {
    return { error: "Only buyers can place bids." };
  }

  const cardCheck = await ensureBuyerHasValidCard();
  if (!cardCheck.valid) {
    return { error: cardCheck.error };
  }

  if (typeof amount !== "number" || !isFinite(amount) || amount <= 0) {
    return { error: "Invalid bid amount." };
  }

  // Round to 2 decimal places to prevent floating-point storage issues.
  const bidAmount = Math.round(amount * 100) / 100;

  let lotId: string;
  let storeId: string;

  try {
    const txResult = await prisma.$transaction(async (tx) => {
      // Fresh read inside the transaction: fetches current state for validation
      // and includes the top bid to detect self-bidding.
      const item = await tx.item.findUnique({
        where: { id: itemId },
        include: {
          lot: {
            select: {
              id: true,
              status: true,
              closesAt: true,
              extendedCount: true,
              storeId: true,
              auction: {
                select: {
                  status: true,
                  softCloseEnabled: true,
                  softCloseWindowSec: true,
                  softCloseExtendSec: true,
                  softCloseExtendLimit: true,
                },
              },
            },
          },
          bids: {
            orderBy: { amount: "desc" },
            take: 1,
            select: { userId: true },
          },
        },
      });

      if (!item) throw new Error("Item not found.");

      if (item.lot.status !== "LIVE") {
        throw new Error("This item is not available for bidding.");
      }

      const auction = item.lot.auction;
      if (auction && auction.status !== "LIVE") {
        throw new Error("This auction is not currently live.");
      }

      // Prevent the current highest bidder from re-bidding on their own item.
      if (item.bids[0]?.userId === session.user.id) {
        throw new Error("You are already the highest bidder on this item.");
      }

      if (!item.lot.closesAt) {
        throw new Error("Lot close time is not set.");
      }

      const currentPrice = Number(item.currentPrice ?? item.startPrice ?? 0);
      const validation = validateBidAmount(bidAmount, currentPrice);
      if (!validation.valid) throw new Error(validation.error);

      const minBid = getMinimumNextBid(currentPrice);
      if (bidAmount < minBid) {
        throw new Error(
          `Minimum bid is $${minBid.toFixed(2)}. Bids must follow the required increment.`
        );
      }

      // Optimistic lock: updateMany only matches if currentPrice hasn't changed since we
      // read it above. 0 rows updated means a concurrent bid came in first.
      const updated = await tx.item.updateMany({
        where: { id: itemId, currentPrice: item.currentPrice },
        data: { currentPrice: bidAmount },
      });
      if (updated.count === 0) {
        throw new Error(
          "Another bid was placed just now. Please refresh and try again."
        );
      }

      await tx.bid.create({
        data: { itemId, userId: session.user.id, amount: bidAmount },
      });

      // Soft-close extension
      const now = new Date();
      const remainingSeconds = Math.max(
        0,
        (item.lot.closesAt.getTime() - now.getTime()) / 1000
      );
      const softCloseEnabled = auction?.softCloseEnabled ?? true;
      const softCloseWindowSec = auction?.softCloseWindowSec ?? 120;
      const softCloseExtendSec = auction?.softCloseExtendSec ?? 60;
      const softCloseExtendLimit = auction?.softCloseExtendLimit ?? 10;

      const shouldExtend =
        softCloseEnabled &&
        softCloseExtendSec > 0 &&
        remainingSeconds > 0 &&
        remainingSeconds <= softCloseWindowSec &&
        item.lot.extendedCount < softCloseExtendLimit;

      if (shouldExtend) {
        await tx.lot.update({
          where: { id: item.lot.id },
          data: {
            closesAt: new Date(item.lot.closesAt.getTime() + softCloseExtendSec * 1000),
            extendedCount: { increment: 1 },
            lastExtendedAt: now,
          },
        });
      }

      return { lotId: item.lot.id, storeId: item.lot.storeId };
    });

    lotId = txResult.lotId;
    storeId = txResult.storeId;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to place bid." };
  }

  revalidatePath(`/lots/${lotId}`);
  revalidatePath(`/stores/${storeId}`);
  return { success: true };
}
