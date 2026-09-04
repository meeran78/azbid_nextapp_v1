"use server";

import { prisma } from "@/lib/prisma";

export type UpcomingAuctionHero = {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  storeId: string;
  storeName: string;
  storeLocation: string | null;
  imageUrl: string | null;
};

/**
 * Not-yet-started auctions for the homepage hero: every SCHEDULED auction from an
 * ACTIVE store, soonest start first. Shown even if it has no lots/items yet.
 */
export async function getUpcomingAuctionsForHero(limit = 20): Promise<UpcomingAuctionHero[]> {
  const auctions = await prisma.auction.findMany({
    where: {
      status: "SCHEDULED",
      startAt: { gt: new Date() },
      store: { status: "ACTIVE" },
    },
    orderBy: { startAt: "asc" },
    take: limit,
    select: {
      id: true,
      title: true,
      description: true,
      startAt: true,
      store: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          owner: {
            select: {
              displayLocation: true,
              addressLine1: true,
              city: true,
              state: true,
              zipcode: true,
            },
          },
        },
      },
      lots: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: {
          items: {
            take: 1,
            orderBy: { createdAt: "asc" },
            select: { imageUrls: true },
          },
        },
      },
    },
  });

  return auctions.map((a) => {
    const owner = a.store.owner;
    const location =
      owner.displayLocation ||
      [owner.addressLine1, owner.city, owner.state, owner.zipcode].filter(Boolean).join(", ") ||
      null;
    const itemImage = a.lots[0]?.items[0]?.imageUrls?.[0] ?? null;

    return {
      id: a.id,
      title: a.title,
      description: a.description,
      startAt: a.startAt,
      storeId: a.store.id,
      storeName: a.store.name,
      storeLocation: location,
      imageUrl: itemImage ?? a.store.logoUrl ?? null,
    };
  });
}

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
      status: { in: ["LIVE"] },
      store: { status: "ACTIVE" },
      // Only auctions that have at least one lot with at least one item
      lots: { some: { items: { some: {} } } },
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
