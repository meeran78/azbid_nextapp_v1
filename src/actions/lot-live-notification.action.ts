"use server";

import { prisma } from "@/lib/prisma";
import { sendEmailAction } from "@/actions/sendEmail.action";

/**
 * When a lot's status changes from SCHEDULED to LIVE, notify buyers who have
 * favourited or watched any item in that lot. Each buyer receives one email
 * with their list of watched and favourite items from this lot.
 */
export async function notifyBuyersLotNowLive(lotId: string): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const lotUrl = `${appUrl}/lots/${lotId}`;

  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    select: {
      id: true,
      title: true,
      items: { select: { id: true, title: true } },
    },
  });

  if (!lot || lot.items.length === 0) return;

  const itemIds = lot.items.map((i) => i.id);

  const [favourites, watches] = await Promise.all([
    prisma.itemFavourite.findMany({
      where: { itemId: { in: itemIds } },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        item: { select: { id: true, title: true } },
      },
    }),
    prisma.itemWatch.findMany({
      where: { itemId: { in: itemIds } },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        item: { select: { id: true, title: true } },
      },
    }),
  ]);

  const buyerIds = new Set<string>();
  const favouriteByUser = new Map<string, { id: string; title: string }[]>();
  const watchedByUser = new Map<string, { id: string; title: string }[]>();

  for (const f of favourites) {
    if (f.user.role !== "BUYER" || !f.user.email) continue;
    buyerIds.add(f.user.id);
    const list = favouriteByUser.get(f.user.id) ?? [];
    list.push({ id: f.item.id, title: f.item.title });
    favouriteByUser.set(f.user.id, list);
  }
  for (const w of watches) {
    if (w.user.role !== "BUYER" || !w.user.email) continue;
    buyerIds.add(w.user.id);
    const list = watchedByUser.get(w.user.id) ?? [];
    list.push({ id: w.item.id, title: w.item.title });
    watchedByUser.set(w.user.id, list);
  }

  const users = await prisma.user.findMany({
    where: { id: { in: Array.from(buyerIds) }, role: "BUYER" },
    select: { id: true, email: true, name: true },
  });

  for (const user of users) {
    const favs = favouriteByUser.get(user.id) ?? [];
    const watched = watchedByUser.get(user.id) ?? [];
    if (favs.length === 0 && watched.length === 0) continue;

    const lines: string[] = [
      `The lot "${lot.title}" is now LIVE and you can place bids.`,
      "",
    ];
    if (favs.length > 0) {
      lines.push("Your favourite items in this lot:");
      favs.forEach((it) => lines.push(`  • ${it.title}`));
      lines.push("");
    }
    if (watched.length > 0) {
      lines.push("Items on your watchlist in this lot:");
      watched.forEach((it) => lines.push(`  • ${it.title}`));
      lines.push("");
    }
    lines.push("View the lot and place your bids at the link below.");

    try {
      await sendEmailAction({
        to: user.email,
        subject: "Lot now live – your watched & favourite items",
        meta: {
          description: lines.join("\n"),
          link: lotUrl,
        },
      });
    } catch (err) {
      console.error(`[notifyBuyersLotNowLive] Failed to email ${user.email} for lot ${lotId}:`, err);
    }
  }
}
