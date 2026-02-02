"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Toggle store favourite for the current user.
 * Requires signed-in user. Returns { favourited: boolean } or { error: string }.
 */
export async function toggleStoreFavouriteAction(
  storeId: string
): Promise<{ favourited: boolean } | { error: string }> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return { error: "Please sign in to favourite stores." };
  }

  const existing = await prisma.storeFavourite.findFirst({
    where: {
      userId: session.user.id,
      storeId,
    },
  });

  if (existing) {
    await prisma.storeFavourite.delete({
      where: { id: existing.id },
    });
    revalidatePath("/");
    revalidatePath(`/stores/${storeId}`);
    return { favourited: false };
  }

  await prisma.storeFavourite.create({
    data: {
      userId: session.user.id,
      storeId,
    },
  });
  revalidatePath("/");
  revalidatePath(`/stores/${storeId}`);
  return { favourited: true };
}

/**
 * Get store IDs that the current user has favourited.
 * Returns empty array if not signed in.
 */
export async function getUserFavouriteStoreIds(): Promise<string[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) return [];

  const favourites = await prisma.storeFavourite.findMany({
    where: { userId: session.user.id },
    select: { storeId: true },
  });
  return favourites.map((f) => f.storeId);
}
