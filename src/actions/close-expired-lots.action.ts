"use server";

import { prisma } from "@/lib/prisma";
import { closeLot } from "./close-lot.action";

export type CloseExpiredLotsResult = {
  closed: number;
  errors: Array<{ lotId: string; error: string }>;
};

/**
 * Backend job: find LIVE lots where closesAt has passed and close them.
 *
 * For each expired lot this calls closeLot(), which:
 * - Marks lot SOLD/UNSOLD and sets winning bids on items
 * - Creates Order + Invoice per winning buyer
 * - Auto-charges buyer's saved Stripe payment method (or leaves invoice PENDING)
 * - Sends emails to buyers and seller
 *
 * Lots are closed in parallel (Promise.allSettled) to avoid serialised timeouts on
 * Vercel when many lots expire at once. closeLot() uses an optimistic lock on the
 * lot's status so concurrent cron invocations cannot double-close the same lot.
 *
 * Invoked by the cron endpoint GET/POST /api/cron/close-lots (see
 * .github/workflows/close-lots.yml).
 */
export async function closeExpiredLots(): Promise<CloseExpiredLotsResult> {
  const now = new Date();

  const expiredLots = await prisma.lot.findMany({
    where: {
      status: "LIVE",
      closesAt: { lte: now },
    },
    select: { id: true },
  });

  const result: CloseExpiredLotsResult = { closed: 0, errors: [] };

  if (expiredLots.length === 0) return result;

  const outcomes = await Promise.allSettled(
    expiredLots.map((lot) => closeLot(lot.id))
  );

  for (let i = 0; i < outcomes.length; i++) {
    const outcome = outcomes[i];
    const lotId = expiredLots[i].id;
    if (outcome.status === "rejected") {
      result.errors.push({ lotId, error: String(outcome.reason) });
    } else if ("error" in outcome.value) {
      result.errors.push({ lotId, error: outcome.value.error });
    } else {
      result.closed++;
    }
  }

  return result;
}
