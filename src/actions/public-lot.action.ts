"use server";

import { prisma } from "@/lib/prisma";

export type PublicLotItem = {
  id: string;
  title: string;
  description: string | null;
  condition: string | null;
  imageUrls: string[];
  startPrice: number;
  reservePrice: number | null;
  currentPrice: number | null;
  retailPrice: number | null;
  category: { name: string } | null;
  _count?: { bids: number };
};

export type PublicLot = {
  id: string;
  title: string;
  description: string | null;
  lotDisplayId: string | null;
  status: string;
  closesAt: Date;
  store: {
    id: string;
    name: string;
    owner: {
      name: string;
      displayLocation: string | null;
      addressLine1: string | null;
      city: string | null;
      state: string | null;
      zipcode: string | null;
    };
  };
  auction: { id: string; title: string; endAt: Date } | null;
  items: PublicLotItem[];
};

/**
 * Get a lot by ID for public viewing. Only returns lots with status LIVE or SCHEDULED.
 * Returns null if not found or not publicly viewable.
 */
export async function getPublicLot(lotId: string): Promise<PublicLot | null> {
  const lot = await prisma.lot.findUnique({
    where: {
      id: lotId,
      status: { in: ["LIVE"] },
    },
    include: {
      store: {
        include: {
          owner: {
            select: {
              name: true,
              displayLocation: true,
              addressLine1: true,
              city: true,
              state: true,
              zipcode: true,
            },
          },
        },
      },
      auction: { select: { id: true, title: true, endAt: true } },
      items: {
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!lot) return null;

  return {
    id: lot.id,
    title: lot.title,
    description: lot.description,
    lotDisplayId: lot.lotDisplayId,
    status: lot.status,
    closesAt: lot.closesAt,
    store: {
      id: lot.store.id,
      name: lot.store.name,
      owner: lot.store.owner,
    },
    auction: lot.auction,
    items: lot.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      condition: item.condition,
      imageUrls: item.imageUrls,
      startPrice: item.startPrice,
      reservePrice: item.reservePrice,
      currentPrice: item.currentPrice,
      retailPrice: item.retailPrice,
      category: item.category,
      _count: item._count,
    })),
  };
}
