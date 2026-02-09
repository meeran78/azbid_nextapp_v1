"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type AdminDashboardKPIs = {
  activeUsers: number;
  totalStores: number;
  activeStores: number;
  activeAuctions: number;
  closedAuctions: number;
  activeLots: number;
  closedLots: number;
  totalGMV: number;
};

export type AdminRiskMetrics = {
  failedPayments: number;
  suspendedStores: number;
  failedInvoices: number;
  pendingStores: number;
  recentFailedPaymentReasons: { orderId: string; reason: string | null }[];
};

export type CompetitiveAuctionRow = {
  auctionId: string;
  auctionDisplayId: string | null;
  title: string;
  storeName: string;
  bidCount: number;
  lotCount: number;
  extendedLotsCount: number;
};

export type TimeSeriesPoint = {
  date: string; // YYYY-MM-DD
  revenue: number;
  bids: number;
};

const DEFAULT_DAYS = 30;

/**
 * Admin-only. Returns KPI counts: active users, stores, auctions (active/closed), lots (active/closed), total GMV.
 */
export async function getAdminDashboardKPIs(): Promise<AdminDashboardKPIs | null> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;

  const [
    activeUsers,
    totalStores,
    activeStores,
    activeAuctions,
    closedAuctions,
    activeLots,
    closedLots,
    gmvResult,
  ] = await Promise.all([
    prisma.user.count({ where: { banned: { not: true } } }),
    prisma.store.count(),
    prisma.store.count({ where: { status: "ACTIVE" } }),
    prisma.auction.count({ where: { status: "LIVE" } }),
    prisma.auction.count({ where: { status: "COMPLETED" } }),
    prisma.lot.count({
      where: { status: { in: ["LIVE", "SCHEDULED"] } },
    }),
    prisma.lot.count({
      where: { status: { in: ["SOLD", "UNSOLD"] } },
    }),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { invoiceTotal: true },
    }),
  ]);

  return {
    activeUsers,
    totalStores,
    activeStores,
    activeAuctions,
    closedAuctions,
    activeLots,
    closedLots,
    totalGMV: gmvResult._sum.invoiceTotal ?? 0,
  };
}

/**
 * Admin-only. Risk indicators: failed payments, suspended stores, failed invoices, pending stores.
 */
export async function getAdminRiskMetrics(): Promise<AdminRiskMetrics | null> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;

  const [
    failedPayments,
    suspendedStores,
    failedInvoices,
    pendingStores,
    recentFailedPayments,
  ] = await Promise.all([
    prisma.payment.count({ where: { status: "FAILED" } }),
    prisma.store.count({ where: { status: "SUSPENDED" } }),
    prisma.invoice.count({ where: { status: "FAILED" } }),
    prisma.store.count({ where: { status: "PENDING" } }),
    prisma.payment.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { orderId: true, failureReason: true },
    }),
  ]);

  return {
    failedPayments,
    suspendedStores,
    failedInvoices,
    pendingStores,
    recentFailedPaymentReasons: recentFailedPayments.map((p) => ({
      orderId: p.orderId,
      reason: p.failureReason,
    })),
  };
}

/**
 * Admin-only. Most competitive auctions by total bid count (and optionally by lots with extensions).
 */
export async function getMostCompetitiveAuctions(
  limit: number = 10
): Promise<CompetitiveAuctionRow[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "ADMIN") return [];

  const auctions = await prisma.auction.findMany({
    where: { status: { in: ["LIVE", "COMPLETED"] } },
    select: {
      id: true,
      auctionDisplayId: true,
      title: true,
      store: { select: { name: true } },
      lots: {
        select: {
          id: true,
          extendedCount: true,
          items: {
            select: { _count: { select: { bids: true } } },
          },
        },
      },
    },
  });

  const rows: CompetitiveAuctionRow[] = auctions.map((a) => {
    const lotCount = a.lots.length;
    const bidCount = a.lots.reduce(
      (sum, lot) =>
        sum + lot.items.reduce((s, it) => s + it._count.bids, 0),
      0
    );
    const extendedLotsCount = a.lots.filter((l) => l.extendedCount > 0).length;
    return {
      auctionId: a.id,
      auctionDisplayId: a.auctionDisplayId,
      title: a.title,
      storeName: a.store.name,
      bidCount,
      lotCount,
      extendedLotsCount,
    };
  });

  rows.sort((a, b) => b.bidCount - a.bidCount);
  return rows.slice(0, limit);
}

/**
 * Admin-only. Time series: revenue and bids per day for the last `days` days.
 */
export async function getAdminTimeSeries(
  days: number = DEFAULT_DAYS
): Promise<TimeSeriesPoint[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "ADMIN") return [];

  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);

  const [paidInvoices, bids] = await Promise.all([
    prisma.invoice.findMany({
      where: {
        status: "PAID",
        paidAt: { gte: start, lte: end },
      },
      select: { paidAt: true, invoiceTotal: true },
    }),
    prisma.bid.findMany({
      where: { createdAt: { gte: start, lte: end } },
      select: { createdAt: true },
    }),
  ]);

  const dateKey = (d: Date) => d.toISOString().slice(0, 10);
  const revenueByDay: Record<string, number> = {};
  const bidsByDay: Record<string, number> = {};

  for (let i = 0; i <= days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = dateKey(d);
    revenueByDay[key] = 0;
    bidsByDay[key] = 0;
  }

  for (const inv of paidInvoices) {
    if (inv.paidAt) {
      const key = dateKey(inv.paidAt);
      if (key in revenueByDay) revenueByDay[key] += inv.invoiceTotal;
    }
  }
  for (const bid of bids) {
    const key = dateKey(bid.createdAt);
    if (key in bidsByDay) bidsByDay[key] += 1;
  }

  const points: TimeSeriesPoint[] = Object.keys(revenueByDay)
    .sort()
    .map((date) => ({
      date,
      revenue: Math.round(revenueByDay[date] * 100) / 100,
      bids: bidsByDay[date] ?? 0,
    }));

  return points;
}
