"use server";

import { prisma } from "@/lib/prisma";

export type LandingStoreLot = {
  id: string;
  title: string;
  description: string | null;
  lotDisplayId: string | null;
  closesAt: Date;
  status: string;
  auctionEndAt: Date | null;
  firstItemImage: string | null;
};

export type LandingStore = {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  averageRating: number | null;
  ratingsCount: number | null;
  responseRate: number | null;
  itemCount: number;
  activeAuctionsCount: number;
  owner: {
    name: string;
    displayLocation: string | null;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    zipcode: string | null;
    businessPhone: string | null;
  };
  lots: LandingStoreLot[];
  auctionCloseDate: Date | null;
};

/**
 * Get active stores with their LIVE/SCHEDULED lots for the landing page.
 * Public - no auth required. Returns all ACTIVE stores.
 */
export async function getActiveStoresWithLots(): Promise<LandingStore[]> {
  const stores = await prisma.store.findMany({
    where: { status: "ACTIVE" },
    include: {
      owner: {
        select: {
          name: true,
          displayLocation: true,
          addressLine1: true,
          city: true,
          state: true,
          zipcode: true,
          businessPhone: true,
        },
      },
      lots: {
        where: { status: { in: ["LIVE", "SCHEDULED"] } },
        include: {
          auction: { select: { endAt: true } },
          items: {
            take: 1,
            orderBy: { createdAt: "asc" },
            select: { imageUrls: true },
          },
          _count: { select: { items: true } },
        },
        orderBy: { closesAt: "asc" },
      },
      auctions: {
        where: { status: { in: ["LIVE", "SCHEDULED"] } },
        select: { id: true },
      },
      _count: { select: { lots: true } },
    },
    orderBy: { name: "asc" },
  });

  return stores.map((store) => {
    const lots: LandingStoreLot[] = store.lots.map((lot) => {
      const firstItem = lot.items[0];
      const firstItemImage =
        firstItem?.imageUrls?.length > 0 ? firstItem.imageUrls[0] : null;
      return {
        id: lot.id,
        title: lot.title,
        description: lot.description,
        lotDisplayId: lot.lotDisplayId,
        closesAt: lot.closesAt,
        status: lot.status,
        auctionEndAt: lot.auction?.endAt ?? null,
        firstItemImage,
      };
    });

    const itemCount = store.lots.reduce(
      (sum, lot) => sum + (lot._count?.items ?? 0),
      0
    );
    const auctionCloseDate =
      lots.length > 0
        ? lots.reduce<Date>((acc, lot) => {
            const end = lot.auctionEndAt ?? lot.closesAt;
            return end > acc ? end : acc;
          }, lots[0].auctionEndAt ?? lots[0].closesAt)
        : null;

    return {
      id: store.id,
      name: store.name,
      description: store.description,
      logoUrl: store.logoUrl,
      averageRating: store.averageRating,
      ratingsCount: store.ratingsCount,
      responseRate: store.responseRate,
      itemCount,
      activeAuctionsCount: store.auctions?.length ?? 0,
      owner: {
        ...store.owner,
        businessPhone: store.owner.businessPhone ?? null,
      },
      lots,
      auctionCloseDate,
    };
  });
}
