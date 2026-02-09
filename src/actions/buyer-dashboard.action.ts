"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type BuyerDashboardMetrics = {
  // Bidding performance (Won = highest bidder on CLOSED auction; Lost = participated but not winner)
  winsCount: number;
  lossesCount: number;
  outbidCount: number; // Lost because someone else had higher bid
  winRatePct: number; // wins / (wins + losses) * 100
  // Active bidding exposure
  activeBidsCount: number;
  leadingBidsCount: number;
  // Live auction exposure
  totalActiveLotsParticipating: number;   // distinct LIVE lots with at least one bid
  highestCurrentExposure: number;         // max bid × count (max single bid × active bid count)
  endingSoonCount: number;                // active lots closing in < 10 min
  // Payment (Stripe / webhook-confirmed)
  paymentSuccessCount: number;
  paymentFailureCount: number;
  totalSpent: number;
  recentFailedPayments: { orderId: string; amount: number; reason: string | null }[];
  // Financial & payment metrics (Invoices + Payment records)
  totalSpentLast30Days: number;
  totalSpentLast90Days: number;
  averageWinningBid: number;
  buyerPremiumPaid: number;
  successfulCardTransactions: number; // Payment PAID
  failedCardTransactions: number;    // Payment FAILED
  pendingPaymentsCount: number;      // Invoice PENDING
  // Engagement
  totalBidsPlaced: number;
  watchlistCount: number;
  favoritesCount: number;
  lotsParticipatedCount: number;
};

/**
 * Buyer-only. Aggregated metrics for the buyer dashboard.
 */
export async function getBuyerDashboardMetrics(): Promise<BuyerDashboardMetrics | null> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "BUYER") return null;

  const userId = session.user.id;

  // Won = highest bidder on CLOSED auction (lot SOLD/UNSOLD, user has winning bid on item)
  const winsCount = await prisma.item.count({
    where: {
      winningBidId: { not: null },
      winningBid: { userId },
      lot: { status: { in: ["SOLD", "UNSOLD"] } },
    },
  });

  // Lost = participated but not winner (bid on closed lot, user did not win the item)
  const lostBidsCount = await prisma.bid.count({
    where: {
      userId,
      item: {
        lot: { status: { in: ["SOLD", "UNSOLD"] } },
        OR: [
          { winningBidId: null },
          { winningBid: { userId: { not: userId } } },
        ],
      },
    },
  });

  // Outbid = lost because someone else had a higher bid (item has a winner, not this user)
  const outbidCount = await prisma.bid.count({
    where: {
      userId,
      item: {
        lot: { status: { in: ["SOLD", "UNSOLD"] } },
        winningBidId: { not: null },
        winningBid: { userId: { not: userId } },
      },
    },
  });

  const closedDecisions = winsCount + lostBidsCount;
  const winRatePct = closedDecisions > 0 ? Math.round((winsCount / closedDecisions) * 100) : 0;

  // Active bids: user has bid on item, lot is LIVE, item has no winner yet
  const activeBids = await prisma.bid.findMany({
    where: {
      userId,
      item: {
        winningBidId: null,
        lot: { status: "LIVE" },
      },
    },
    include: {
      item: {
        select: {
          lotId: true,
          currentPrice: true,
          startPrice: true,
          lot: { select: { closesAt: true } },
        },
      },
    },
  });
  const activeBidsCount = activeBids.length;
  const leadingBidsCount = activeBids.filter(
    (b) => (b.item.currentPrice ?? b.item.startPrice) <= b.amount
  ).length;

  // Live auction exposure: distinct lots, highest exposure (max bid × count), ending soon (< 10 min)
  const activeLotIds = new Set(activeBids.map((b) => b.item.lotId));
  const totalActiveLotsParticipating = activeLotIds.size;
  const maxBid = activeBidsCount > 0 ? Math.max(...activeBids.map((b) => b.amount)) : 0;
  const highestCurrentExposure = maxBid * activeBidsCount;
  const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
  const lotClosesAtMap = new Map<string, Date>();
  for (const b of activeBids) {
    const closesAt = b.item.lot.closesAt;
    if (!lotClosesAtMap.has(b.item.lotId)) lotClosesAtMap.set(b.item.lotId, closesAt);
  }
  const endingSoonCount = [...lotClosesAtMap.values()].filter(
    (closesAt) => closesAt <= tenMinutesFromNow
  ).length;

  // Payments: orders for this buyer with payment record
  const payments = await prisma.payment.findMany({
    where: { order: { buyerId: userId } },
    select: {
      status: true,
      orderId: true,
      amount: true,
      failureReason: true,
    },
  });
  const paymentSuccessCount = payments.filter((p) => p.status === "PAID").length;
  const paymentFailureCount = payments.filter((p) => p.status === "FAILED").length;
  const recentFailedPayments = payments
    .filter((p) => p.status === "FAILED")
    .slice(0, 5)
    .map((p) => ({
      orderId: p.orderId,
      amount: p.amount,
      reason: p.failureReason,
    }));

  // Total spent: sum of paid invoice totals for this buyer
  const spentAgg = await prisma.invoice.aggregate({
    where: { buyerId: userId, status: "PAID" },
    _sum: { invoiceTotal: true },
  });
  const totalSpent = spentAgg._sum.invoiceTotal ?? 0;

  // Financial metrics from Invoices (PAID)
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const paidInvoices = await prisma.invoice.findMany({
    where: { buyerId: userId, status: "PAID", paidAt: { not: null } },
    select: {
      invoiceTotal: true,
      winningBidAmount: true,
      buyerPremiumPct: true,
      tax: true,
      paidAt: true,
    },
  });

  let totalSpentLast30Days = 0;
  let totalSpentLast90Days = 0;
  let sumWinningBid = 0;
  let buyerPremiumPaid = 0;
  const paidCount = paidInvoices.length;
  for (const inv of paidInvoices) {
    const paidAt = inv.paidAt!;
    if (paidAt >= thirtyDaysAgo) totalSpentLast30Days += inv.invoiceTotal;
    if (paidAt >= ninetyDaysAgo) totalSpentLast90Days += inv.invoiceTotal;
    sumWinningBid += inv.winningBidAmount;
    buyerPremiumPaid += inv.winningBidAmount * (inv.buyerPremiumPct / 100);
  }
  const averageWinningBid = paidCount > 0 ? sumWinningBid / paidCount : 0;

  const pendingPaymentsCount = await prisma.invoice.count({
    where: { buyerId: userId, status: "PENDING" },
  });

  // Engagement
  const [totalBidsPlaced, watchlistCount, favoritesCount, lotsParticipatedCount] =
    await Promise.all([
      prisma.bid.count({ where: { userId } }),
      prisma.itemWatch.count({ where: { userId } }),
      prisma.itemFavourite.count({ where: { userId } }),
      prisma.bid.findMany({
        where: { userId },
        select: { item: { select: { lotId: true } } },
      }).then((bids) => new Set(bids.map((b) => b.item.lotId)).size),
    ]);

  return {
    winsCount,
    lossesCount: lostBidsCount,
    outbidCount,
    winRatePct,
    activeBidsCount,
    leadingBidsCount,
    totalActiveLotsParticipating,
    highestCurrentExposure,
    endingSoonCount,
    paymentSuccessCount,
    paymentFailureCount,
    totalSpent,
    recentFailedPayments,
    totalSpentLast30Days,
    totalSpentLast90Days,
    averageWinningBid,
    buyerPremiumPaid,
    successfulCardTransactions: paymentSuccessCount,
    failedCardTransactions: paymentFailureCount,
    pendingPaymentsCount,
    totalBidsPlaced,
    watchlistCount,
    favoritesCount,
    lotsParticipatedCount,
  };
}
