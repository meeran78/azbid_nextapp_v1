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

export type StoreStatusFilter = "ALL" | "ACTIVE" | "PENDING" | "SUSPENDED";

/**
 * Get stores with optional search, status filter, and location filter.
 * Public - no auth required.
 * When status is ACTIVE (or default), only returns stores that have at least one LIVE lot.
 */
export async function getActiveStoresWithLotsFiltered(
  search?: string | null,
  statusFilter?: StoreStatusFilter | null,
  location?: string | null
): Promise<LandingStore[]> {
  const status = statusFilter && statusFilter !== "ALL" ? statusFilter : undefined;
  const hasSearch = search?.trim();
  const hasLocation = location?.trim();

  const where: {
    status?: "ACTIVE" | "PENDING" | "SUSPENDED";
    lots?: { some: { status: "LIVE" } };
    OR?: Array<
      | { name: { contains: string; mode: "insensitive" } }
      | { description: { contains: string; mode: "insensitive" } | null }
      | { owner: { name: { contains: string; mode: "insensitive" } } }
    >;
    owner?: {
      OR: Array<
        | { city: { contains: string; mode: "insensitive" } | null }
        | { state: { contains: string; mode: "insensitive" } | null }
        | { country: { contains: string; mode: "insensitive" } | null }
        | { displayLocation: { contains: string; mode: "insensitive" } | null }
      >;
    };
  } = {};

  if (status) where.status = status;
  // When showing only ACTIVE stores, require at least one LIVE lot for relevance
  if (status === "ACTIVE" || !statusFilter) where.lots = { some: { status: "LIVE" } };

  if (hasSearch) {
    const term = hasSearch.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
      { owner: { name: { contains: term, mode: "insensitive" } } },
    ];
  }

  if (hasLocation) {
    const loc = hasLocation.trim();
    where.owner = {
      ...(where.owner as object),
      OR: [
        { city: { contains: loc, mode: "insensitive" } },
        { state: { contains: loc, mode: "insensitive" } },
        { country: { contains: loc, mode: "insensitive" } },
        { displayLocation: { contains: loc, mode: "insensitive" } },
      ],
    };
  }

  const stores = await prisma.store.findMany({
    where,
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
        where: { status: { in: ["LIVE"] } },
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
        where: { status: { in: ["LIVE"] } },
        select: { id: true },
      },
      _count: { select: { lots: true } },
    },
    orderBy: { name: "asc" },
  });

  return mapStoresToLanding(stores as StoreWithRelations[]);
}

/**
 * Get active stores with live auctions for the landing page (no filters).
 * Public - no auth required. Returns only ACTIVE stores that have at least one LIVE lot.
 */
export async function getActiveStoresWithLots(): Promise<LandingStore[]> {
  return getActiveStoresWithLotsFiltered(null, "ACTIVE", null);
}

type StoreWithRelations = {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  averageRating: number | null;
  ratingsCount: number | null;
  responseRate: number | null;
  owner: {
    name: string;
    displayLocation: string | null;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    zipcode: string | null;
    businessPhone: string | null;
  };
  lots: Array<{
    id: string;
    title: string;
    description: string | null;
    lotDisplayId: string | null;
    closesAt: Date;
    status: string;
    auction: { endAt: Date | null } | null;
    items: Array<{ imageUrls: string[] }>;
    _count: { items: number };
  }>;
  auctions: Array<{ id: string }>;
};

function mapStoresToLanding(stores: StoreWithRelations[]): LandingStore[] {
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
