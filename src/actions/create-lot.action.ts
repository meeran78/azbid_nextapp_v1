"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createLotSchemaForServer } from "@/lib/validations/lot.schema";
import { z } from "zod";

export async function createLotAction(data: {
  title: string;
  description: string;
  storeId: string;
  auctionId?: string | null;
  closesAt: string; // ISO date string
  removalStartAt?: string | null;
  inspectionAt?: string | null;
  startPrice: number;
  reservePrice?: number | null;
  items: Array<{
    title: string;
    category: string;
    condition: string;
    retailPrice?: number | null;
    reservePrice?: number | null;
    description?: string;
    imageUrls: string[];
  }>;
  disclaimerAccepted: boolean;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  // Validate the data
  const validationResult = createLotSchemaForServer.safeParse({
    ...data,
    closesAt: data.closesAt,
    removalStartAt: data.removalStartAt || null,
    inspectionAt: data.inspectionAt || null,
  });

  if (!validationResult.success) {
    console.error("Validation errors:", validationResult.error.issues);
    return {
      error: "Validation failed",
      details: validationResult.error.issues.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    };
  }

  const validatedData = validationResult.data;

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      id: validatedData.storeId,
      ownerId: session.user.id,
    },
  });

  if (!store) {
    return { error: "Store not found or access denied" };
  }

  try {
    // Create the lot with items
    const lot = await prisma.lot.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        storeId: validatedData.storeId,
        auctionId: validatedData.auctionId || null,
        status: "DRAFT",
        startPrice: validatedData.startPrice,
        reservePrice: validatedData.reservePrice || null,
        closesAt: validatedData.closesAt,
        items: {
          create: validatedData.items.map((item) => ({
            title: item.title,
            description: item.description || null,
            condition: item.condition,
            estimatedValue: item.retailPrice || null,
            imageUrls: item.imageUrls || [],
          })),
        },
      },
      include: {
        items: true,
      },
    });

    revalidatePath("/sellers-dashboard");
    return { error: null, lot };
  } catch (err: any) {
    console.error("Error creating lot:", err);
    return { 
      error: err.message || "Failed to create lot. Please try again.",
      details: err,
    };
  }
}