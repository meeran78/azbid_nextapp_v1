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
 * Lots with extendedCount > 0 are "bidding war" lots (late bids triggered extensions).
 */
export async function getAdminSoftCloseAnalytics(): Promise<SoftCloseAnalytics> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { lotsWithBiddingWars: 0, totalExtensions: 0, topLots: [] };
  }

  const [lotsWithBiddingWars, extensionSum, topLotsRaw] = await Promise.all([
    prisma.lot.count({
      where: { extendedCount: { gt: 0 } },
    }),
    prisma.lot.aggregate({
      where: { extendedCount: { gt: 0 } },
      _sum: { extendedCount: true },
    }),
    prisma.lot.findMany({
      where: { extendedCount: { gt: 0 } },
      orderBy: { extendedCount: "desc" },
      take: TOP_LOTS_LIMIT,
      select: {
        id: true,
        lotDisplayId: true,
        title: true,
        status: true,
        extendedCount: true,
        lastExtendedAt: true,
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
    extendedCount: lot.extendedCount,
    lastExtendedAt: lot.lastExtendedAt,
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

  const where = { storeId: { in: storeIds }, extendedCount: { gt: 0 } };

  const [lotsWithBiddingWars, extensionSum, topLotsRaw] = await Promise.all([
    prisma.lot.count({ where }),
    prisma.lot.aggregate({
      where,
      _sum: { extendedCount: true },
    }),
    prisma.lot.findMany({
      where,
      orderBy: { extendedCount: "desc" },
      take: TOP_LOTS_LIMIT,
      select: {
        id: true,
        lotDisplayId: true,
        title: true,
        status: true,
        extendedCount: true,
        lastExtendedAt: true,
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
    extendedCount: lot.extendedCount,
    lastExtendedAt: lot.lastExtendedAt,
    status: lot.status,
  }));

  return { lotsWithBiddingWars, totalExtensions, topLots };
}
