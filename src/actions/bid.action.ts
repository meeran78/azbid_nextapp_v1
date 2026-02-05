"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getMinimumNextBid, validateBidAmount } from "@/lib/bid-increment";

/**
 * Place a bid on an item. Requires signed-in user with BUYER role.
 * Implements soft-close: extends lot closesAt when bid placed in final window.
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

  if (typeof amount !== "number" || amount <= 0) {
    return { error: "Invalid bid amount." };
  }

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      lot: {
        select: {
          id: true,
          status: true,
          closesAt: true,
          extendedCount: true,
          auctionId: true,
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
    },
  });

  if (!item) {
    return { error: "Item not found." };
  }

  // 1. Validate auction + lot status (LIVE)
  if (item.lot.status !== "LIVE") {
    return { error: "This item is not available for bidding." };
  }

  const auction = item.lot.auction;
  if (auction && auction.status !== "LIVE") {
    return { error: "This auction is not currently live." };
  }

  // 2. Validate bid amount: must be > current price and aligned with minimum increment (non-negotiable)
  const currentPrice = Number(item.currentPrice ?? item.startPrice ?? 0);
  const validation = validateBidAmount(amount, currentPrice);
  if (!validation.valid) {
    return { error: validation.error };
  }
  const minBid = getMinimumNextBid(currentPrice);
  if (amount < minBid) {
    return {
      error: `Minimum bid is $${minBid.toFixed(2)}. Bids must follow the required increment.`,
    };
  }

  // 4. Check time remaining for soft-close
  const now = new Date();
  const remainingSeconds = Math.max(
    0,
    (item.lot.closesAt.getTime() - now.getTime()) / 1000
  );

  const softCloseEnabled =
    auction?.softCloseEnabled ?? false;
  const softCloseWindowSec = auction?.softCloseWindowSec ?? 120;
  const softCloseExtendSec = auction?.softCloseExtendSec ?? 60;
  const softCloseExtendLimit = auction?.softCloseExtendLimit ?? 10;

  const shouldExtend =
    softCloseEnabled &&
    remainingSeconds <= softCloseWindowSec &&
    item.lot.extendedCount < softCloseExtendLimit;

  const newClosesAt = shouldExtend
    ? new Date(item.lot.closesAt.getTime() + softCloseExtendSec * 1000)
    : item.lot.closesAt;

  // 3. Save bid + 5. Extend lot (if applicable) + 6. Update item currentPrice (transaction)
  const operations: Parameters<typeof prisma.$transaction>[0] = [
    prisma.bid.create({
      data: {
        itemId,
        userId: session.user.id,
        amount,
      },
    }),
    prisma.item.update({
      where: { id: itemId },
      data: { currentPrice: amount },
    }),
  ];

  if (shouldExtend) {
    operations.push(
      prisma.lot.update({
        where: { id: item.lot.id },
        data: {
          closesAt: newClosesAt,
          extendedCount: { increment: 1 },
          lastExtendedAt: now,
        },
      })
    );
  }

  await prisma.$transaction(operations);

  revalidatePath(`/lots/${item.lot.id}`);
  return { success: true };
}
