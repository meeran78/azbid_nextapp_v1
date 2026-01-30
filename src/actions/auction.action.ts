"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const auctionSchema = z
  .object({
    storeId: z.string().min(1, "Store is required"),
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(2000).optional().nullable(),
    buyersPremium: z.string().max(1000).optional().nullable(),
    status: z.enum(["DRAFT", "SCHEDULED", "LIVE", "COMPLETED", "CANCELLED"]),
    startAt: z.coerce.date({ message: "Start date is required" }),
    endAt: z.coerce.date({ message: "End date is required" }),
    softCloseEnabled: z.boolean().default(true),
    softCloseWindowSec: z.coerce.number().min(0).default(120),
    softCloseExtendSec: z.coerce.number().min(0).default(60),
    softCloseExtendLimit: z.coerce.number().min(0).default(10),
  })
  .refine((d) => d.endAt > d.startAt, {
    message: "End date must be after start date",
    path: ["endAt"],
  });

// Generate unique auction display ID (FL-YYYY-XXXXXX format)
async function generateUniqueAuctionDisplayId(): Promise<string> {
  let displayId: string = "";
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    displayId = `FL-${year}-${random}`;

    const existing = await prisma.auction.findUnique({
      where: { auctionDisplayId: displayId },
      select: { id: true },
    });

    if (!existing) {
      isUnique = true;
    } else {
      attempts++;
    }
  }

  if (!isUnique) {
    const timestamp = Date.now();
    displayId = `FL-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}`;
  }

  return displayId;
}

export type AuctionInput = z.infer<typeof auctionSchema>;

// Get all auctions (Admin only)
export async function getAuctions() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const auctions = await prisma.auction.findMany({
    include: {
      store: { select: { id: true, name: true } },
      _count: { select: { lots: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return auctions;
}

// Get single auction (Admin only)
export async function getAuction(id: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      store: { select: { id: true, name: true } },
      _count: { select: { lots: true } },
    },
  });

  return auction;
}

// Get stores for admin (for auction form dropdown)
export async function getStoresForAdmin() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const stores = await prisma.store.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return stores;
}

// Create auction (Admin only)
export async function createAuctionAction(data: AuctionInput) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const validatedData = auctionSchema.parse(data);
  const auctionDisplayId = await generateUniqueAuctionDisplayId();

  const auction = await prisma.auction.create({
    data: {
      storeId: validatedData.storeId,
      title: validatedData.title,
      description: validatedData.description || null,
      buyersPremium: validatedData.buyersPremium || null,
      auctionDisplayId,
      status: validatedData.status as "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED",
      startAt: validatedData.startAt,
      endAt: validatedData.endAt,
      softCloseEnabled: validatedData.softCloseEnabled,
      softCloseWindowSec: validatedData.softCloseWindowSec,
      softCloseExtendSec: validatedData.softCloseExtendSec,
      softCloseExtendLimit: validatedData.softCloseExtendLimit,
    },
  });

  revalidatePath("/auctions-management");
  return { success: true, auction };
}

// Update auction (Admin only)
export async function updateAuctionAction(id: string, data: AuctionInput) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const validatedData = auctionSchema.parse(data);

  const auction = await prisma.auction.update({
    where: { id },
    data: {
      storeId: validatedData.storeId,
      title: validatedData.title,
      description: validatedData.description || null,
      buyersPremium: validatedData.buyersPremium || null,
      status: validatedData.status as "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED",
      startAt: validatedData.startAt,
      endAt: validatedData.endAt,
      softCloseEnabled: validatedData.softCloseEnabled,
      softCloseWindowSec: validatedData.softCloseWindowSec,
      softCloseExtendSec: validatedData.softCloseExtendSec,
      softCloseExtendLimit: validatedData.softCloseExtendLimit,
    },
  });

  revalidatePath("/auctions-management");
  revalidatePath(`/auctions-management/${id}/edit`);
  return { success: true, auction };
}

// Delete auction (Admin only)
export async function deleteAuctionAction(id: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const auction = await prisma.auction.findUnique({
    where: { id },
    include: { _count: { select: { lots: true } } },
  });

  if (!auction) {
    return { error: "Auction not found" };
  }

  if (auction._count.lots > 0) {
    return { error: "Cannot delete auction with existing lots. Remove or reassign lots first." };
  }

  await prisma.auction.delete({
    where: { id },
  });

  revalidatePath("/auctions-management");
  return { success: true };
}
