"use server";

import { prisma } from "@/lib/prisma";

export type PublicStoreLotItem = {
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

export type PublicStoreLot = {
  id: string;
  title: string;
  description: string | null;
  lotDisplayId: string | null;
  status: string;
  closesAt: Date;
  inspectionAt: Date | null;
  removalStartAt: Date | null;
  itemCount: number;
  imageUrls: string[];
  auctionDisplayId: string | null;
  buyersPremium: string | null;
  items: PublicStoreLotItem[];
};

export type PublicStore = {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  averageRating: number | null;
  ratingsCount: number | null;
  responseRate: number | null;
  liveItemCount: number;
  totalItemCount: number;
  owner: {
    name: string;
    displayLocation: string | null;
    city: string | null;
    state: string | null;
    businessPhone: string | null;
  };
  lots: PublicStoreLot[];
  /** Total count of lots (LIVE + SCHEDULED). When using pagination, lots.length may be less. */
  totalLotCount?: number;
};

const DEFAULT_STORE_LOT_PAGE_SIZE = 6;

export async function getPublicStore(
  storeId: string,
  page = 1,
  pageSize = DEFAULT_STORE_LOT_PAGE_SIZE
): Promise<PublicStore | null> {
  type CountArgs = NonNullable<Parameters<typeof prisma.lot.count>[0]>;
  type LotWhereInput = CountArgs["where"];
  const lotWhere = { storeId, status: { in: ["LIVE", "SCHEDULED"] } } as LotWhereInput;
  const [totalLotCount, lotStats, store] = await Promise.all([
    prisma.lot.count({ where: lotWhere }),
    prisma.lot.findMany({
      where: lotWhere,
      select: { status: true, _count: { select: { items: true } } },
    }),
    prisma.store.findFirst({
      where: { id: storeId, status: "ACTIVE" },
      include: {
        owner: {
          select: {
            name: true,
            displayLocation: true,
            city: true,
            state: true,
            businessPhone: true,
          },
        },
        lots: {
          where: { status: { in: ["LIVE", "SCHEDULED"] as ("LIVE" | "SCHEDULED")[] } },
          skip: (Math.max(1, page) - 1) * Math.max(1, Math.min(24, pageSize)),
          take: Math.max(1, Math.min(24, pageSize)),
          include: {
            items: {
              orderBy: { createdAt: "asc" },
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
            },
            auction: {
              select: { auctionDisplayId: true, buyersPremium: true },
            },
            _count: { select: { items: true } },
          },
          orderBy: { closesAt: "asc" },
        },
      },
    }),
  ]);

  if (!store) return null;

  const lots = store.lots ?? [];
  type LotStatRow = { status: string; _count: { items: number } };
  const liveItemCount = (lotStats as LotStatRow[])
    .filter((l) => l.status === "LIVE")
    .reduce((sum, l) => sum + l._count.items, 0);
  const totalItemCount = (lotStats as unknown as LotStatRow[]).reduce(
    (sum, l) => sum + l._count.items,
    0
  );

  return {
    id: store.id,
    name: store.name,
    description: store.description,
    logoUrl: store.logoUrl,
    averageRating: store.averageRating,
    ratingsCount: store.ratingsCount,
    responseRate: store.responseRate,
    liveItemCount,
    totalItemCount,
    owner: store.owner,
    totalLotCount,
    lots: lots.map((lot) => {
      const imageUrls = lot.items.flatMap((i) => i.imageUrls ?? []).filter(Boolean);
      return {
        id: lot.id,
        title: lot.title,
        description: lot.description,
        lotDisplayId: lot.lotDisplayId,
        status: lot.status,
        closesAt: lot.closesAt,
        inspectionAt: lot.inspectionAt,
        removalStartAt: lot.removalStartAt,
        itemCount: (lot as { _count?: { items: number } })._count?.items ?? 0,
        imageUrls,
        auctionDisplayId: lot.auction?.auctionDisplayId ?? null,
        buyersPremium: lot.auction?.buyersPremium ?? null,
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
          bidCount: item._count?.bids ?? 0,
        })),
      };
    }),
  };
}
