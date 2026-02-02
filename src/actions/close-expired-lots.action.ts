"use server";

import { prisma } from "@/lib/prisma";
import { closeLot } from "./close-lot.action";

export type CloseExpiredLotsResult = {
  closed: number;
  errors: Array<{ lotId: string; error: string }>;
};

/**
 * Find LIVE lots where closesAt has passed and close them.
 * Call this from a cron job (e.g. every minute) to auto-close lots as part of soft close.
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
