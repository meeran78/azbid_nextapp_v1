"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type SoftCloseLotRow = {
  lotId: string;
  lotDisplayId: string | null;
  title: string;
  storeName: string;
  extendedCount: number;
  lastExtendedAt: Date | null;
  status: string;
};

export type SoftCloseAnalytics = {
  lotsWithBiddingWars: number;
  totalExtensions: number;
  topLots: SoftCloseLotRow[];
};

const TOP_LOTS_LIMIT = 20;

/**
 * Platform-wide soft-close & extension analytics for admin.
 * Lots belonging to an auction with extendedCount > 0 are "bidding war" lots (a
 * late bid on any lot in the auction triggered an extension, shared by every lot
 * in it — extension counts live on Auction, not Lot; summing per auction, not per
 * lot, avoids double-counting a shared extension once per lot).
 */
export async function getAdminSoftCloseAnalytics(): Promise<SoftCloseAnalytics> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { lotsWithBiddingWars: 0, totalExtensions: 0, topLots: [] };
  }

  const [lotsWithBiddingWars, extensionSum, topLotsRaw] = await Promise.all([
    prisma.lot.count({
      where: { auction: { extendedCount: { gt: 0 } } },
    }),
    prisma.auction.aggregate({
      where: { extendedCount: { gt: 0 } },
      _sum: { extendedCount: true },
    }),
    prisma.lot.findMany({
      where: { auction: { extendedCount: { gt: 0 } } },
      orderBy: { auction: { extendedCount: "desc" } },
      take: TOP_LOTS_LIMIT,
      select: {
        id: true,
        lotDisplayId: true,
        title: true,
        status: true,
        auction: { select: { extendedCount: true, lastExtendedAt: true } },
        store: { select: { name: true } },
      },
    }),
  ]);

  const totalExtensions = extensionSum._sum.extendedCount ?? 0;
  const topLots: SoftCloseLotRow[] = topLotsRaw.map((lot) => ({
    lotId: lot.id,
    lotDisplayId: lot.lotDisplayId,
    title: lot.title,
    storeName: lot.store.name,
    extendedCount: lot.auction?.extendedCount ?? 0,
    lastExtendedAt: lot.auction?.lastExtendedAt ?? null,
    status: lot.status,
  }));

  return { lotsWithBiddingWars, totalExtensions, topLots };
}

/**
 * Seller-scoped soft-close & extension analytics.
 * Only lots from stores owned by the given seller.
 */
export async function getSellerSoftCloseAnalytics(
  sellerId: string
): Promise<SoftCloseAnalytics> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "SELLER" || session.user.id !== sellerId) {
    return { lotsWithBiddingWars: 0, totalExtensions: 0, topLots: [] };
  }

  const stores = await prisma.store.findMany({
    where: { ownerId: sellerId },
    select: { id: true },
  });
  const storeIds = stores.map((s) => s.id);
  if (storeIds.length === 0) {
    return { lotsWithBiddingWars: 0, totalExtensions: 0, topLots: [] };
  }

  const lotWhere = { storeId: { in: storeIds }, auction: { extendedCount: { gt: 0 } } };

  const [lotsWithBiddingWars, extensionSum, topLotsRaw] = await Promise.all([
    prisma.lot.count({ where: lotWhere }),
    prisma.auction.aggregate({
      where: { storeId: { in: storeIds }, extendedCount: { gt: 0 } },
      _sum: { extendedCount: true },
    }),
    prisma.lot.findMany({
      where: lotWhere,
      orderBy: { auction: { extendedCount: "desc" } },
      take: TOP_LOTS_LIMIT,
      select: {
        id: true,
        lotDisplayId: true,
        title: true,
        status: true,
        auction: { select: { extendedCount: true, lastExtendedAt: true } },
        store: { select: { name: true } },
      },
    }),
  ]);

  const totalExtensions = extensionSum._sum.extendedCount ?? 0;
  const topLots: SoftCloseLotRow[] = topLotsRaw.map((lot) => ({
    lotId: lot.id,
    lotDisplayId: lot.lotDisplayId,
    title: lot.title,
    storeName: lot.store.name,
    extendedCount: lot.auction?.extendedCount ?? 0,
    lastExtendedAt: lot.auction?.lastExtendedAt ?? null,
    status: lot.status,
  }));

  return { lotsWithBiddingWars, totalExtensions, topLots };
}
