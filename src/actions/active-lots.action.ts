"use server";

import { prisma } from "@/lib/prisma";
import type { PublicStoreLotItem } from "@/actions/public-store.action";
import { reconcileAuctionEndAt } from "@/lib/lot-timing";

export type LotStatusFilter = "ALL" | "LIVE" | "SCHEDULED";

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

export type ActiveStoreCard = {
  id: string;
  name: string;
  logoUrl: string | null;
  bannerImageUrl: string | null;
  location: string | null;
  closesAt: Date | null;
};

/**
 * Get active stores with at least one live/scheduled lot, as cards for the
 * "By Store" browse view. Public, no auth. Each card carries the soonest-closing
 * matching lot's close date and a preview image for its banner.
 */
export async function getActiveStoresForFilter(
  statusFilter?: LotStatusFilter | null
): Promise<ActiveStoreCard[]> {
  const statuses: ("LIVE" | "SCHEDULED")[] =
    !statusFilter || statusFilter === "ALL" ? ["LIVE", "SCHEDULED"] : [statusFilter];

  const stores = await prisma.store.findMany({
    where: {
      status: "ACTIVE",
      lots: { some: { status: { in: statuses }, auctionId: { not: null } } },
    },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      owner: {
        select: { displayLocation: true, city: true, state: true, zipcode: true },
      },
      lots: {
        where: { status: { in: statuses }, auctionId: { not: null } },
        orderBy: { closesAt: "asc" },
        take: 1,
        select: {
          closesAt: true,
          items: {
            take: 1,
            orderBy: { createdAt: "asc" },
            select: { imageUrls: true },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return stores.map((s) => {
    const nearestLot = s.lots[0];
    const owner = s.owner;
    const location =
      owner.displayLocation ||
      (owner.city && owner.state
        ? `${owner.city}, ${owner.state}${owner.zipcode ? " " + owner.zipcode : ""}`
        : owner.city || owner.state || null);
    return {
      id: s.id,
      name: s.name,
      logoUrl: s.logoUrl,
      bannerImageUrl: nearestLot?.items[0]?.imageUrls?.[0] ?? null,
      location,
      closesAt: nearestLot?.closesAt ?? null,
    };
  });
}

export type ActiveItem = PublicStoreLotItem & {
  lotId: string;
  lotStatus: string;
  lotDisplayId: string | null;
  lotClosesAt: Date;
  lotAuctionEndAt: Date;
  storeId: string;
  storeName: string;
  storeLogoUrl: string | null;
};

const DEFAULT_ITEM_PAGE_SIZE = 9;
const MAX_ITEM_PAGE_SIZE = 24;

/**
 * Get individual items (flattened across lots/stores) with optional filters
 * and pagination. Public - no auth. Only includes items whose lot is
 * LIVE/SCHEDULED and whose store is ACTIVE.
 */
export async function getActiveItemsFiltered(
  searchQuery?: string | null,
  statusFilter?: LotStatusFilter | null,
  location?: string | null,
  itemTitle?: string | null,
  storeId?: string | null,
  page = 1,
  pageSize = DEFAULT_ITEM_PAGE_SIZE
): Promise<{ items: ActiveItem[]; totalCount: number }> {
  const hasSearch = searchQuery?.trim();
  const hasLocation = location?.trim();
  const hasItemTitle = itemTitle?.trim();
  const hasStoreId = storeId?.trim();

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

  const lotWhere: Record<string, unknown> = {
    status: { in: statuses },
    auctionId: { not: null },
    store: storeWhere,
  };
  if (hasStoreId) lotWhere.storeId = hasStoreId.trim();
  if (hasSearch) {
    const term = hasSearch.trim();
    lotWhere.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
    ];
  }

  const where: Record<string, unknown> = { lot: lotWhere };
  if (hasItemTitle) where.title = { contains: hasItemTitle.trim(), mode: "insensitive" };

  const take = Math.min(MAX_ITEM_PAGE_SIZE, Math.max(1, pageSize));
  const skip = (Math.max(1, page) - 1) * take;

  const [totalCount, items] = await Promise.all([
    prisma.item.count({ where }),
    prisma.item.findMany({
      where,
      skip,
      take,
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
        lot: {
          select: {
            id: true,
            status: true,
            lotDisplayId: true,
            closesAt: true,
            auction: { select: { endAt: true } },
            store: {
              select: { id: true, name: true, logoUrl: true },
            },
          },
        },
      },
      orderBy: [{ lot: { closesAt: "asc" } }, { createdAt: "asc" }],
    }),
  ]);

  return {
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      condition: item.condition,
      imageUrls: item.imageUrls ?? [],
      startPrice: item.startPrice,
      reservePrice: item.reservePrice,
      currentPrice: item.currentPrice,
      retailPrice: item.retailPrice,
      createdAt: item.createdAt,
      category: item.category,
      bidCount: item._count?.bids ?? 0,
      lotId: item.lot.id,
      lotStatus: item.lot.status,
      lotDisplayId: item.lot.lotDisplayId,
      lotClosesAt: item.lot.closesAt,
      lotAuctionEndAt: reconcileAuctionEndAt(item.lot.closesAt, item.lot.auction?.endAt),
      storeId: item.lot.store.id,
      storeName: item.lot.store.name,
      storeLogoUrl: item.lot.store.logoUrl,
    })),
    totalCount,
  };
}
