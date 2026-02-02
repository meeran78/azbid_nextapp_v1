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
};

export async function getPublicStore(
  storeId: string
): Promise<PublicStore | null> {
  const store = await prisma.store.findFirst({
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
        where: { status: { in: ["LIVE", "SCHEDULED"] } },
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
  });

  if (!store) return null;

  const lots = store.lots ?? [];
  const liveItemCount = lots
    .filter((l) => l.status === "LIVE")
    .reduce((sum, l) => sum + (l._count?.items ?? 0), 0);
  const totalItemCount = lots.reduce(
    (sum, l) => sum + (l._count?.items ?? 0),
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
        itemCount: lot._count?.items ?? 0,
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
