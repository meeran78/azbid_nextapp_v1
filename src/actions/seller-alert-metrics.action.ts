"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type SellerAlertMetrics = {
  lotsPendingAdminApproval: number;
  lotsSentBackResend: number;
  lotsEndingSoon: number;
  buyerPaymentFailures: number;
  disputedTransactions: number;
};

/** Ending soon window: lots closing within this many hours. */
const ENDING_SOON_HOURS = 24;

/**
 * Seller-only. Returns counts for dashboard alert/attention metrics.
 */
export async function getSellerAlertMetrics(
  sellerId: string
): Promise<SellerAlertMetrics> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "SELLER" || session.user.id !== sellerId) {
    redirect("/sign-in");
  }

  const stores = await prisma.store.findMany({
    where: { ownerId: sellerId },
    select: { id: true },
  });
  const storeIds = stores.map((s) => s.id);
  if (storeIds.length === 0) {
    return {
      lotsPendingAdminApproval: 0,
      lotsSentBackResend: 0,
      lotsEndingSoon: 0,
      buyerPaymentFailures: 0,
      disputedTransactions: 0,
    };
  }

  const now = new Date();
  const endingSoonThreshold = new Date(now.getTime() + ENDING_SOON_HOURS * 60 * 60 * 1000);

  const [
    lotsPendingAdminApproval,
    lotsSentBackResend,
    lotsEndingSoon,
    buyerPaymentFailures,
  ] = await Promise.all([
    // Lots in DRAFT not yet reviewed (pending admin approval)
    prisma.lot.count({
      where: {
        storeId: { in: storeIds },
        status: "DRAFT",
        reviewedAt: null,
      },
    }),
    // Lots sent back for resubmission
    prisma.lot.count({
      where: {
        storeId: { in: storeIds },
        status: "RESEND",
      },
    }),
    // Live lots closing within the next ENDING_SOON_HOURS
    prisma.lot.count({
      where: {
        storeId: { in: storeIds },
        status: "LIVE",
        closesAt: { gte: now, lte: endingSoonThreshold },
      },
    }),
    // Invoices (buyer payments) that failed
    prisma.invoice.count({
      where: {
        sellerId,
        status: "FAILED",
      },
    }),
  ]);

  // No Dispute model yet; reserve for future use
  const disputedTransactions = 0;

  return {
    lotsPendingAdminApproval,
    lotsSentBackResend,
    lotsEndingSoon,
    buyerPaymentFailures,
    disputedTransactions,
  };
}
