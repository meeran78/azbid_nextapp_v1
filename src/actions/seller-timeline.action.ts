"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type SellerTimelineEventType =
  | "lot_submitted"
  | "lot_reviewed"
  | "auction_live"
  | "soft_close"
  | "auction_closed"
  | "payment_completed"
  | "payout_processed";

export type SellerTimelineEvent = {
  type: SellerTimelineEventType;
  at: Date;
  title: string;
  lotId?: string;
  lotTitle?: string;
  auctionId?: string;
  auctionTitle?: string;
  invoiceId?: string;
  approved?: boolean; // for lot_reviewed
};

const LIMIT = 50;

/**
 * Seller-only. Returns a unified timeline of events for the seller's lots, auctions, and invoices.
 */
export async function getSellerTimelineEvents(
  sellerId: string
): Promise<SellerTimelineEvent[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "SELLER" || session.user.id !== sellerId) {
    return [];
  }

  const stores = await prisma.store.findMany({
    where: { ownerId: sellerId },
    select: { id: true },
  });
  const storeIds = stores.map((s) => s.id);
  if (storeIds.length === 0) return [];

  const events: SellerTimelineEvent[] = [];

  // Lots: submitted (createdAt), reviewed (reviewedAt), soft-close (lastExtendedAt)
  const lots = await prisma.lot.findMany({
    where: { storeId: { in: storeIds } },
    select: {
      id: true,
      title: true,
      createdAt: true,
      reviewedAt: true,
      adminNotes: true,
      status: true,
      lastExtendedAt: true,
    },
  });

  for (const lot of lots) {
    events.push({
      type: "lot_submitted",
      at: lot.createdAt,
      title: "Lot submitted",
      lotId: lot.id,
      lotTitle: lot.title,
    });
    if (lot.reviewedAt) {
      const approved = !lot.adminNotes && lot.status !== "DRAFT";
      events.push({
        type: "lot_reviewed",
        at: lot.reviewedAt,
        title: approved ? "Lot approved" : "Lot rejected",
        lotId: lot.id,
        lotTitle: lot.title,
        approved,
      });
    }
    if (lot.lastExtendedAt) {
      events.push({
        type: "soft_close",
        at: lot.lastExtendedAt,
        title: "Soft-close triggered",
        lotId: lot.id,
        lotTitle: lot.title,
      });
    }
  }

  // Auctions: went live (use startAt for auctions that are/were LIVE)
  const auctions = await prisma.auction.findMany({
    where: { storeId: { in: storeIds }, status: { in: ["LIVE", "COMPLETED"] } },
    select: { id: true, title: true, startAt: true },
  });
  for (const a of auctions) {
    events.push({
      type: "auction_live",
      at: a.startAt,
      title: "Auction went live",
      auctionId: a.id,
      auctionTitle: a.title,
    });
  }

  // Invoices: issued (auction/lot closed), paid (payment completed), payout (same as paid)
  const invoices = await prisma.invoice.findMany({
    where: { sellerId },
    select: {
      id: true,
      invoiceDisplayId: true,
      issuedAt: true,
      paidAt: true,
      status: true,
      lotId: true,
      lot: { select: { title: true } },
    },
  });

  for (const inv of invoices) {
    events.push({
      type: "auction_closed",
      at: inv.issuedAt,
      title: "Auction closed",
      invoiceId: inv.id,
      lotId: inv.lotId,
      lotTitle: inv.lot.title,
    });
    if (inv.paidAt && inv.status === "PAID") {
      events.push({
        type: "payment_completed",
        at: inv.paidAt,
        title: "Buyer payment completed",
        invoiceId: inv.id,
        lotId: inv.lotId,
        lotTitle: inv.lot.title,
      });
      events.push({
        type: "payout_processed",
        at: inv.paidAt,
        title: "Seller payout processed",
        invoiceId: inv.id,
        lotId: inv.lotId,
        lotTitle: inv.lot.title,
      });
    }
  }

  events.sort((a, b) => b.at.getTime() - a.at.getTime());
  return events.slice(0, LIMIT);
}
