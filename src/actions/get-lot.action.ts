"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getLotAction(lotId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  try {
    // Find the lot and verify ownership
    const lot = await prisma.lot.findUnique({
      where: { id: lotId },
      include: {
        store: {
          select: {
            ownerId: true,
            name: true,
          },
        },
        auction: {
          select: {
            id: true,
            title: true,
          },
        },
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!lot) {
      return { error: "Lot not found", lot: null };
    }

    // Verify ownership
    if (lot.store.ownerId !== session.user.id) {
      return { error: "Access denied: You don't own this lot", lot: null };
    }

    // Only allow editing drafts
    if (lot.status !== "DRAFT") {
      return { error: "Cannot edit: Only draft lots can be edited", lot: null };
    }

    return { error: null, lot };
  } catch (err: any) {
    console.error("Error fetching lot:", err);
    return { 
      error: err.message || "Failed to fetch lot. Please try again.",
      lot: null,
    };
  }
}