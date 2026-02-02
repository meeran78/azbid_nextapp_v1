"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const BID_INCREMENT = 1; // Minimum bid increment in dollars

/**
 * Place a bid on an item. Requires signed-in user with BUYER role.
 * Item must belong to a LIVE or SCHEDULED lot.
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
      lot: { select: { id: true, status: true } },
    },
  });

  if (!item) {
    return { error: "Item not found." };
  }

  if (!["LIVE", "SCHEDULED"].includes(item.lot.status)) {
    return { error: "This item is not available for bidding." };
  }

  const currentPrice = item.currentPrice ?? item.startPrice;
  const minBid = currentPrice + BID_INCREMENT;

  if (amount < minBid) {
    return {
      error: `Minimum bid is $${minBid.toFixed(2)} (current: $${currentPrice.toFixed(2)} + $${BID_INCREMENT} increment).`,
    };
  }

  await prisma.$transaction([
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
  ]);

  revalidatePath(`/lots/${item.lot.id}`);
  return { success: true };
}
