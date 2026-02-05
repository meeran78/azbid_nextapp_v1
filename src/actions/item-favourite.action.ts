"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Toggle item favourite for the current user.
 * Requires signed-in user. Returns { favourited: boolean } or { error: string }.
 */
export async function toggleItemFavouriteAction(
  itemId: string
): Promise<{ favourited: boolean } | { error: string }> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { error: "Please sign in to favourite items." };
  }

  const existing = await prisma.itemFavourite.findFirst({
    where: {
      userId: session.user.id,
      itemId,
    },
  });

  if (existing) {
    await prisma.itemFavourite.delete({
      where: { id: existing.id },
    });
    revalidatePath("/");
    revalidatePath("/stores/[storeId]");
    revalidatePath("/lots/[lotId]");
    return { favourited: false };
  }

  await prisma.itemFavourite.create({
    data: {
      userId: session.user.id,
      itemId,
    },
  });
  revalidatePath("/");
  revalidatePath("/stores/[storeId]");
  revalidatePath("/lots/[lotId]");
  revalidatePath("/buyers-dashboard");
  return { favourited: true };
}

/**
 * Get item IDs that the current user has favourited.
 */
export async function getUserFavouriteItemIds(): Promise<string[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) return [];

  const favourites = await prisma.itemFavourite.findMany({
    where: { userId: session.user.id },
    select: { itemId: true },
  });
  return favourites.map((f) => f.itemId);
}

export type BuyerFavouriteItem = {
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

export async function getBuyerFavouriteItems(): Promise<BuyerFavouriteItem[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) return [];

  const favourites = await prisma.itemFavourite.findMany({
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

  return favourites.map((f) => ({
    id: f.item.id,
    title: f.item.title,
    imageUrls: f.item.imageUrls,
    startPrice: f.item.startPrice,
    currentPrice: f.item.currentPrice,
    lotId: f.item.lot.id,
    lotTitle: f.item.lot.title,
    lotStatus: f.item.lot.status,
    storeId: f.item.lot.store.id,
    storeName: f.item.lot.store.name,
  }));
}
