"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function approveStoreAction(storeId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { owner: { select: { name: true, email: true } } },
  });

  if (!store) return { error: "Store not found" };
  if (store.status !== "PENDING") return { error: "Store is not pending approval" };

  await prisma.store.update({
    where: { id: storeId },
    data: {
      status: "ACTIVE",
      approvedAt: new Date(),
      approvedById: session.user.id,
    },
  });

  revalidatePath("/stores-management");
  revalidatePath("/sellers-dashboard");
  return { error: null };
}

export async function getPendingStoreCountAction() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") return { count: 0 };

  const count = await prisma.store.count({
    where: { status: "PENDING" },
  });

  return { count };
}

export async function rejectStoreAction(storeId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return { error: "Store not found" };
  if (store.status !== "PENDING") return { error: "Store is not pending approval" };

  await prisma.store.update({
    where: { id: storeId },
    data: { status: "SUSPENDED" },
  });

  revalidatePath("/stores-management");
  revalidatePath("/sellers-dashboard");
  return { error: null };
}