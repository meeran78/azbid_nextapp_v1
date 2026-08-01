"use server";

import { prisma } from "@/lib/prisma";
import { closeLot } from "./close-lot.action";

export type CloseExpiredLotsResult = {
  closed: number;
  errors: Array<{ lotId: string; error: string }>;
};

/**
 * Backend job: find LIVE auctions where endAt has passed and close every LIVE lot
 * in them. All lots in an auction share one closing clock (Auction.endAt, extended
 * by soft-close in placeBidAction) — Lot.closesAt is display-only and no longer
 * drives closing.
 *
 * For each expired lot this calls closeLot(), which:
 * - Marks lot SOLD/UNSOLD and sets winning bids on items
 * - Creates Order + Invoice per winning buyer
 * - Auto-charges buyer's saved Stripe payment method (or leaves invoice PENDING)
 * - Sends emails to buyers and seller
 *
 * Lots are closed in parallel (Promise.allSettled) to avoid serialised timeouts on
 * Vercel when many lots expire at once. closeLot() uses an optimistic lock on the
 * lot's status so concurrent cron invocations cannot double-close the same lot; the
 * expired auctions themselves are transitioned to COMPLETED with the same
 * optimistic-lock pattern afterward.
 *
 * Invoked by the cron endpoint GET/POST /api/cron/close-lots (see
 * .github/workflows/close-lots.yml).
 */
export async function closeExpiredLots(): Promise<CloseExpiredLotsResult> {
  const now = new Date();

  const expiredAuctions = await prisma.auction.findMany({
    where: {
      status: "LIVE",
      endAt: { lte: now },
    },
    select: {
      id: true,
      lots: { where: { status: "LIVE" }, select: { id: true } },
    },
  });

  const result: CloseExpiredLotsResult = { closed: 0, errors: [] };

  if (expiredAuctions.length === 0) return result;

  const lotIds = expiredAuctions.flatMap((auction) => auction.lots.map((lot) => lot.id));

  if (lotIds.length > 0) {
    const outcomes = await Promise.allSettled(lotIds.map((lotId) => closeLot(lotId)));

    for (let i = 0; i < outcomes.length; i++) {
      const outcome = outcomes[i];
      const lotId = lotIds[i];
      if (outcome.status === "rejected") {
        result.errors.push({ lotId, error: String(outcome.reason) });
      } else if ("error" in outcome.value) {
        result.errors.push({ lotId, error: outcome.value.error });
      } else {
        result.closed++;
      }
    }
  }

  // Mark each expired auction COMPLETED now that its lots have been processed.
  // Optimistic lock (status: "LIVE") avoids clobbering a concurrent cron run.
  await prisma.auction.updateMany({
    where: {
      id: { in: expiredAuctions.map((auction) => auction.id) },
      status: "LIVE",
    },
    data: { status: "COMPLETED" },
  });

  return result;
}
