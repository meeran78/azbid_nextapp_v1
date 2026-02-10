"use server";

import { prisma } from "@/lib/prisma";

export type LotStatusFilter = "ALL" | "LIVE" | "SCHEDULED";

export type ActiveLotItem = {
  id: string;
  title: string;
  imageUrls: string[];
  startPrice: number;
  currentPrice: number | null;
  category: { name: string } | null;
};

export type ActiveLot = {
  id: string;
  title: string;
  description: string | null;
  lotDisplayId: string | null;
  status: string;
  closesAt: Date;
  itemCount: number;
  imageUrls: string[];
  storeId: string;
  storeName: string;
  storeLogoUrl: string | null;
  location: string | null;
  auctionDisplayId: string | null;
  items: ActiveLotItem[];
};

/**
 * Get active categories for filter dropdown. Public, no auth.
 */
export async function getActiveCategoriesForFilter(): Promise<{ id: string; name: string }[]> {
  return prisma.category.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

/**
 * Get lots with optional filters. Public - no auth.
 * Only includes lots from ACTIVE stores.
 */
export async function getActiveLotsFiltered(
  lotName?: string | null,
  statusFilter?: LotStatusFilter | null,
  location?: string | null,
  itemTitle?: string | null,
  categoryId?: string | null
): Promise<ActiveLot[]> {
  const hasLotName = lotName?.trim();
  const hasLocation = location?.trim();
  const hasItemTitle = itemTitle?.trim();
  const hasCategory = categoryId?.trim();

  const statuses: ("LIVE" | "SCHEDULED")[] =
    !statusFilter || statusFilter === "ALL"
      ? ["LIVE", "SCHEDULED"]
      : statusFilter === "LIVE"
        ? ["LIVE"]
        : ["SCHEDULED"];

  const storeWhere: { status: "ACTIVE"; owner?: { OR: Array<Record<string, unknown>> } } = {
    status: "ACTIVE",
  };

  if (hasLocation) {
    const loc = hasLocation.trim();
    storeWhere.owner = {
      OR: [
        { city: { contains: loc, mode: "insensitive" } },
        { state: { contains: loc, mode: "insensitive" } },
        { country: { contains: loc, mode: "insensitive" } },
        { displayLocation: { contains: loc, mode: "insensitive" } },
      ],
    };
  }

  const where: Record<string, unknown> = {
    status: { in: statuses },
    store: storeWhere,
  };

  if (hasLotName) {
    const term = hasLotName.trim();
    where.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
    ];
  }

  if (hasItemTitle || hasCategory) {
    const itemConditions: Array<Record<string, unknown>> = [];
    if (hasItemTitle) itemConditions.push({ title: { contains: hasItemTitle.trim(), mode: "insensitive" } });
    if (hasCategory) itemConditions.push({ categoryId: hasCategory });
    where.items = { some: { OR: itemConditions } };
  }

  const lots = await prisma.lot.findMany({
    where,
    include: {
      store: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          owner: {
            select: {
              displayLocation: true,
              city: true,
              state: true,
              country: true,
            },
          },
        },
      },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          imageUrls: true,
          startPrice: true,
          currentPrice: true,
          category: { select: { name: true } },
        },
      },
      auction: { select: { auctionDisplayId: true, buyersPremium: true } },
      _count: { select: { items: true } },
    },
    orderBy: { closesAt: "asc" },
  });

  return lots.map((lot) => {
    const imageUrls = lot.items.flatMap((i) => i.imageUrls ?? []).filter(Boolean);
    const owner = lot.store.owner;
    const location = owner
      ? (owner.displayLocation ?? [owner.city, owner.state, owner.country].filter(Boolean).join(", ")) || null
      : null;

    return {
      id: lot.id,
      title: lot.title,
      description: lot.description,
      lotDisplayId: lot.lotDisplayId,
      status: lot.status,
      closesAt: lot.closesAt,
      inspectionAt: lot.inspectionAt ?? null,
      removalStartAt: lot.removalStartAt ?? null,
      itemCount: lot._count?.items ?? 0,
      imageUrls,
      storeId: lot.store.id,
      storeName: lot.store.name,
      storeLogoUrl: lot.store.logoUrl,
      location,
      auctionDisplayId: lot.auction?.auctionDisplayId ?? null,
      buyersPremium: lot.auction?.buyersPremium ?? null,
      items: lot.items.map((item) => ({
        id: item.id,
        title: item.title,
        imageUrls: item.imageUrls ?? [],
        startPrice: item.startPrice,
        currentPrice: item.currentPrice,
        category: item.category,
      })),
    };
  });
}
