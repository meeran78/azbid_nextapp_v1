"use server";

import { prisma } from "@/lib/prisma";

export type ShopCategory = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  itemCount: number;
};

/**
 * Get active categories with item count (items in LIVE/SCHEDULED lots only). Public.
 */
export async function getCategoriesForShopCarousel(): Promise<ShopCategory[]> {
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const itemCountByCategory = await prisma.item.groupBy({
    by: ["categoryId"],
    where: {
      categoryId: { not: null },
      lot: {
        status: { in: ["LIVE", "SCHEDULED"] },
        store: { status: "ACTIVE" },
      },
    },
    _count: { id: true },
  });

  const countMap = new Map<string, number>();
  for (const row of itemCountByCategory) {
    if (row.categoryId) countMap.set(row.categoryId, row._count.id);
  }

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    imageUrl: c.imageUrl,
    itemCount: countMap.get(c.id) ?? 0,
  }));
}

export type CategoryItemWithLot = {
  item: {
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
    bidCount: number;
  };
  lotId: string;
  lotStatus: string;
  storeId: string;
};

/**
 * Get items in a category that are in LIVE or SCHEDULED lots. Public.
 * Shape matches PublicStoreLotItem + lotId, lotStatus, storeId for LotItemCard.
 */
export async function getItemsByCategory(
  categoryId: string
): Promise<{ category: { id: string; name: string; description: string | null }; items: CategoryItemWithLot[] } | null> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId, status: "ACTIVE" },
    select: { id: true, name: true, description: true },
  });
  if (!category) return null;

  const items = await prisma.item.findMany({
    where: {
      categoryId,
      lot: {
        status: { in: ["LIVE", "SCHEDULED"] },
        store: { status: "ACTIVE" },
      },
    },
    include: {
      lot: { select: { id: true, status: true, storeId: true } },
      category: { select: { name: true } },
      _count: { select: { bids: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    category: {
      id: category.id,
      name: category.name,
      description: category.description,
    },
    items: items.map((i) => ({
      item: {
        id: i.id,
        title: i.title,
        description: i.description,
        condition: i.condition,
        imageUrls: i.imageUrls,
        startPrice: i.startPrice,
        reservePrice: i.reservePrice,
        currentPrice: i.currentPrice,
        retailPrice: i.retailPrice,
        createdAt: i.createdAt,
        category: i.category,
        bidCount: i._count?.bids ?? 0,
      },
      lotId: i.lot.id,
      lotStatus: i.lot.status,
      storeId: i.lot.storeId,
    })),
  };
}
