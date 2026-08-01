"use server";

import { prisma } from "@/lib/prisma";

export type FeaturedAuction = {
  id: string;
  title: string;
  auctionDisplayId: string | null;
  closesAt: Date;
  storeId: string;
  storeName: string;
  storeLogoUrl: string | null;
};

/**
 * Get upcoming/live auctions for the homepage "Featured Auctions" carousel.
 * Public, no auth. Only includes auctions whose store is ACTIVE.
 */
export async function getFeaturedAuctions(limit = 10): Promise<FeaturedAuction[]> {
  const auctions = await prisma.auction.findMany({
    where: {
      status: { in: ["LIVE", "SCHEDULED"] },
      store: { status: "ACTIVE" },
    },
    orderBy: { endAt: "asc" },
    take: limit,
    select: {
      id: true,
      title: true,
      auctionDisplayId: true,
      endAt: true,
      store: { select: { id: true, name: true, logoUrl: true } },
    },
  });

  return auctions.map((a) => ({
    id: a.id,
    title: a.title,
    auctionDisplayId: a.auctionDisplayId,
    closesAt: a.endAt,
    storeId: a.store.id,
    storeName: a.store.name,
    storeLogoUrl: a.store.logoUrl,
  }));
}
