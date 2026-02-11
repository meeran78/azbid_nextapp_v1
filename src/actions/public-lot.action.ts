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
  createdAt: Date;
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
  /** Total item count (for pagination). Only set when items are paginated. */
  totalItemCount?: number;
};

const DEFAULT_LOT_ITEMS_PER_PAGE = 2;

/**
 * Get a lot by ID for public viewing. Only returns lots with status LIVE.
 * Optionally paginate items with itemPage and itemPerPage.
 * Returns null if not found or not publicly viewable.
 */
export async function getPublicLot(
  lotId: string,
  itemPage = 1,
  itemPerPage = DEFAULT_LOT_ITEMS_PER_PAGE
): Promise<PublicLot | null> {
  const itemSkip = (Math.max(1, itemPage) - 1) * Math.max(1, Math.min(24, itemPerPage));
  const itemTake = Math.max(1, Math.min(24, itemPerPage));

  const [lot, totalItems] = await Promise.all([
    prisma.lot.findUnique({
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
          select: {
            id: true,
            title: true,
            description: true,
            condition: true,
            imageUrls: true,
            startPrice: true,
            reservePrice: true,
            currentPrice: true,
            retailPrice: true,
            createdAt: true,
            category: { select: { name: true } },
            _count: { select: { bids: true } },
          },
          orderBy: { createdAt: "asc" },
          skip: itemSkip,
          take: itemTake,
        },
      },
    }),
    prisma.item.count({ where: { lotId } }),
  ]);

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
      createdAt: item.createdAt,
      category: item.category,
      _count: item._count,
    })),
    totalItemCount: totalItems,
  };
}
