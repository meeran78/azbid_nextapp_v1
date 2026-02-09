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
 * Invoked by the cron endpoint GET/POST /api/cron/close-lots (see vercel.json: every minute).
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

  for (const lot of expiredLots) {
    const outcome = await closeLot(lot.id);
    if (outcome.success) {
      result.closed++;
    } else {
      result.errors.push({ lotId: lot.id, error: outcome.error });
    }
  }

  return result;
}
