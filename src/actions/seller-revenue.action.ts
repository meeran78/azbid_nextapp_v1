"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const DEFAULT_COMMISSION_PCT = 10;

export type SellerRevenueMetrics = {
  totalRevenueLifetime: number;   // Sum winningBidAmount, PAID invoices
  revenueLast30Days: number;     // Same, paidAt in last 30 days
  pendingPayoutAmount: number;   // Sum seller share for PENDING invoices
  paidPayoutAmount: number;      // Sum seller share for PAID invoices
  averageSalePrice: number;      // Avg winningBidAmount per PAID invoice
  platformCommissionPaid: number; // Sum commission for PAID invoices
  failedBuyerPaymentsCount: number;
  pendingBuyerPaymentsCount: number;
};

/** Clamp commission to 0–100; treat NaN/invalid as default (aligned with stripe-connect). */
function getCommissionPct(sellerCommissionPct: number | null): number {
  if (sellerCommissionPct != null && Number.isFinite(sellerCommissionPct)) {
    return Math.min(100, Math.max(0, sellerCommissionPct));
  }
  if (typeof process.env.PLATFORM_COMMISSION_PCT === "string") {
    const n = Number.parseFloat(process.env.PLATFORM_COMMISSION_PCT);
    if (Number.isFinite(n)) return Math.min(100, Math.max(0, n));
  }
  return DEFAULT_COMMISSION_PCT;
}

/**
 * Seller-only. Revenue and payout metrics from Invoices (Stripe webhook-confirmed payments).
 * Payout = winningBidAmount * (1 - commissionPct/100). Commission = winningBidAmount * commissionPct/100.
 */
export async function getSellerRevenueMetrics(
  sellerId: string
): Promise<SellerRevenueMetrics | null> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "SELLER" || session.user.id !== sellerId) {
    return null;
  }

  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: { commissionPct: true },
  });
  const commissionPct = getCommissionPct(seller?.commissionPct ?? null);

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const invoices = await prisma.invoice.findMany({
    where: { sellerId },
    select: {
      status: true,
      winningBidAmount: true,
      paidAt: true,
    },
  });

  let totalRevenueLifetime = 0;
  let revenueLast30Days = 0;
  let pendingPayoutAmount = 0;
  let paidPayoutAmount = 0;
  let platformCommissionPaid = 0;
  let paidCount = 0;
  let failedBuyerPaymentsCount = 0;
  let pendingBuyerPaymentsCount = 0;

  for (const inv of invoices) {
    const sellerShare = inv.winningBidAmount * (1 - commissionPct / 100);
    const commission = inv.winningBidAmount * (commissionPct / 100);

    if (inv.status === "PAID") {
      totalRevenueLifetime += inv.winningBidAmount;
      if (inv.paidAt && inv.paidAt >= thirtyDaysAgo) revenueLast30Days += inv.winningBidAmount;
      paidPayoutAmount += sellerShare;
      platformCommissionPaid += commission;
      paidCount += 1;
    } else if (inv.status === "PENDING") {
      pendingPayoutAmount += sellerShare;
      pendingBuyerPaymentsCount += 1;
    } else if (inv.status === "FAILED") {
      failedBuyerPaymentsCount += 1;
    }
  }

  const averageSalePrice = paidCount > 0 ? totalRevenueLifetime / paidCount : 0;

  return {
    totalRevenueLifetime,
    revenueLast30Days,
    pendingPayoutAmount,
    paidPayoutAmount,
    averageSalePrice,
    platformCommissionPaid,
    failedBuyerPaymentsCount,
    pendingBuyerPaymentsCount,
  };
}
