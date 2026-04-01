"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function setStoreDisplayInHeroAction(
  storeId: string,
  displayInHero: boolean
) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { id: true, status: true },
  });
  if (!store) {
    return { error: "Store not found" as const };
  }
  if (store.status !== "ACTIVE") {
    return {
      error: "Only ACTIVE stores can be shown on the hero. Approve the store first.",
    };
  }

  await prisma.store.update({
    where: { id: storeId },
    data: { displayInHero },
  });

  revalidatePath("/");
  revalidatePath("/stores-management");
  return { error: null as const };
}
