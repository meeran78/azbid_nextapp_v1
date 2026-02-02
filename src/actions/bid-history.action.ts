"use server";

import { prisma } from "@/lib/prisma";

/**
 * Format buyer display: "FirstName" + random-ish number (deterministic from userId for consistency)
 */
function formatBuyerDisplay(name: string, userId: string): string {
  const firstName = name?.trim().split(/\s+/)[0] || "Buyer";
  const hash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const num = 1000 + (Math.abs(hash) % 9000);
  return `${firstName}#${num}`;
}

export type BidHistoryEntry = {
  id: string;
  buyerDisplay: string;
  bidDate: Date;
  amount: number;
};

export async function getBidHistoryAction(
  itemId: string
): Promise<BidHistoryEntry[] | { error: string }> {
  const bids = await prisma.bid.findMany({
    where: { itemId },
    include: { bidder: { select: { name: true, id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return bids.map((b) => ({
    id: b.id,
    buyerDisplay: formatBuyerDisplay(b.bidder.name, b.bidder.id),
    bidDate: b.createdAt,
    amount: b.amount,
  }));
}
