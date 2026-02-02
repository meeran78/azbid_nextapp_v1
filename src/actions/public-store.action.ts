"use server";

import { prisma } from "@/lib/prisma";

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
            select: { imageUrls: true },
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

  const liveItemCount = store.lots
    .filter((l) => l.status === "LIVE")
    .reduce((sum, l) => sum + (l._count?.items ?? 0), 0);
  const totalItemCount = store.lots.reduce(
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
    lots: store.lots.map((lot) => {
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
      };
    }),
  };
}
