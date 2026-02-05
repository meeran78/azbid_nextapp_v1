"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Toggle item watch for the current user.
 * Requires signed-in user. Returns { watching: boolean } or { error: string }.
 */
export async function toggleItemWatchAction(
  itemId: string
): Promise<{ watching: boolean } | { error: string }> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { error: "Please sign in to watch items." };
  }

  const existing = await prisma.itemWatch.findFirst({
    where: {
      userId: session.user.id,
      itemId,
    },
  });

  if (existing) {
    await prisma.itemWatch.delete({
      where: { id: existing.id },
    });
    revalidatePath("/");
    revalidatePath("/stores/[storeId]");
    revalidatePath("/lots/[lotId]");
    return { watching: false };
  }

  await prisma.itemWatch.create({
    data: {
      userId: session.user.id,
      itemId,
    },
  });
  revalidatePath("/");
  revalidatePath("/stores/[storeId]");
  revalidatePath("/lots/[lotId]");
  revalidatePath("/buyers-dashboard");
  return { watching: true };
}

/**
 * Get item IDs that the current user is watching.
 */
export async function getUserWatchedItemIds(): Promise<string[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) return [];

  const watches = await prisma.itemWatch.findMany({
    where: { userId: session.user.id },
    select: { itemId: true },
  });
  return watches.map((w) => w.itemId);
}

export type BuyerWatchedItem = {
  id: string;
  title: string;
  imageUrls: string[];
  startPrice: number;
  currentPrice: number | null;
  lotId: string;
  lotTitle: string;
  lotStatus: string;
  storeId: string;
  storeName: string;
};

/**
 * Get full list of watched items for the current buyer (for My Watchlist page).
 */
export async function getBuyerWatchedItems(): Promise<BuyerWatchedItem[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) return [];

  const watches = await prisma.itemWatch.findMany({
    where: { userId: session.user.id },
    include: {
      item: {
        select: {
          id: true,
          title: true,
          imageUrls: true,
          startPrice: true,
          currentPrice: true,
          lotId: true,
          lot: {
            select: {
              id: true,
              title: true,
              status: true,
              storeId: true,
              store: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return watches.map((w) => ({
    id: w.item.id,
    title: w.item.title,
    imageUrls: w.item.imageUrls,
    startPrice: w.item.startPrice,
    currentPrice: w.item.currentPrice,
    lotId: w.item.lot.id,
    lotTitle: w.item.lot.title,
    lotStatus: w.item.lot.status,
    storeId: w.item.lot.store.id,
    storeName: w.item.lot.store.name,
  }));
}
