"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { notifyBuyersLotNowLive } from "@/actions/lot-live-notification.action";

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
      lots: { select: { id: true, title: true, lotDisplayId: true } },
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
      lots: {
        include: {
          items: {
            include: {
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { title: "asc" },
      },
    },
  });

  if (!auction) return null;

  const lotCount = auction.lots.length;
  return {
    ...auction,
    _count: { lots: lotCount },
  };
}

// Get lots by store for admin (for associating lots to auction)
// - Create: only lots with auctionId: null (available)
// - Edit: lots with auctionId: null OR auctionId: forAuctionId (available + already in this auction)
export async function getLotsByStoreForAdmin(
  storeId: string,
  options?: { forAuctionId?: string }
) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const where =
    options?.forAuctionId != null
      ? {
          storeId,
          OR: [
            { auctionId: null },
            { auctionId: options.forAuctionId },
          ],
        }
      : { storeId, auctionId: null };

  const lots = await prisma.lot.findMany({
    where,
    select: {
      id: true,
      title: true,
      lotDisplayId: true,
      status: true,
      _count: { select: { items: true } },
    },
    orderBy: { title: "asc" },
  });

  return lots;
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
// Optionally associate selected lots by updating their auctionId
export async function createAuctionAction(
  data: AuctionInput,
  lotIds?: string[]
) {
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

  // Associate selected lots to this auction (only available lots - not already in another auction)
  if (lotIds && lotIds.length > 0) {
    await prisma.lot.updateMany({
      where: {
        id: { in: lotIds },
        storeId: validatedData.storeId,
        auctionId: null, // Only associate lots not already in any auction
      },
      data: { auctionId: auction.id },
    });
  }

  revalidatePath("/auctions-management");
  revalidatePath("/lots-management");
  return { success: true, auction };
}

// Update auction (Admin only)
// When auction status changes, cascade to linked lots:
// - LIVE: DRAFT/SCHEDULED lots → LIVE
// - COMPLETED: LIVE lots → UNSOLD (SOLD lots stay SOLD)
// - CANCELLED: SCHEDULED/LIVE lots → DRAFT
// lotIds: optionally update which lots are associated with this auction
export async function updateAuctionAction(
  id: string,
  data: AuctionInput,
  lotIds?: string[]
) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const validatedData = auctionSchema.parse(data);
  const newStatus = validatedData.status as "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELLED";

  const auction = await prisma.auction.update({
    where: { id },
    data: {
      storeId: validatedData.storeId,
      title: validatedData.title,
      description: validatedData.description || null,
      buyersPremium: validatedData.buyersPremium || null,
      status: newStatus,
      startAt: validatedData.startAt,
      endAt: validatedData.endAt,
      softCloseEnabled: validatedData.softCloseEnabled,
      softCloseWindowSec: validatedData.softCloseWindowSec,
      softCloseExtendSec: validatedData.softCloseExtendSec,
      softCloseExtendLimit: validatedData.softCloseExtendLimit,
    },
  });

  // Update lot associations: un-associate lots no longer selected, associate newly selected
  // When lotIds is empty, preserve current associations (avoids nullifying due to form race/not loaded)
  if (lotIds !== undefined && lotIds.length > 0) {
    const selectedSet = new Set(lotIds);
    // Un-associate lots that were linked to this auction but are no longer selected
    await prisma.lot.updateMany({
      where: { auctionId: id, id: { notIn: Array.from(selectedSet) } },
      data: { auctionId: null },
    });
    // Associate selected lots (only those belonging to same store)
    await prisma.lot.updateMany({
      where: {
        id: { in: Array.from(selectedSet) },
        storeId: validatedData.storeId,
      },
      data: { auctionId: id },
    });
  }

  // Cascade lot status based on auction status
  // When auction goes LIVE: all associated lots (DRAFT, SCHEDULED) → LIVE
  // When auction goes SCHEDULED: LIVE lots → SCHEDULED
  // When auction goes DRAFT: LIVE lots → SCHEDULED
  if (newStatus === "LIVE") {
    const lotsGoingLive = await prisma.lot.findMany({
      where: {
        auctionId: id,
        status: { in: ["DRAFT", "SCHEDULED"] },
      },
      select: { id: true },
    });
    await prisma.lot.updateMany({
      where: {
        auctionId: id,
        status: { in: ["DRAFT", "SCHEDULED"] },
      },
      data: { status: "LIVE" },
    });
    for (const lot of lotsGoingLive) {
      try {
        await notifyBuyersLotNowLive(lot.id);
      } catch (err) {
        console.error(`[updateAuctionAction] notifyBuyersLotNowLive(${lot.id}):`, err);
      }
    }
  } else if (newStatus === "SCHEDULED" || newStatus === "DRAFT") {
    await prisma.lot.updateMany({
      where: { auctionId: id, status: "LIVE" },
      data: { status: "SCHEDULED" },
    });
  } else if (newStatus === "COMPLETED") {
    await prisma.lot.updateMany({
      where: { auctionId: id, status: "LIVE" },
      data: { status: "UNSOLD" },
    });
  } else if (newStatus === "CANCELLED") {
    await prisma.lot.updateMany({
      where: { auctionId: id, status: { in: ["SCHEDULED", "LIVE"] } },
      data: { status: "DRAFT" },
    });
  }

  revalidatePath("/auctions-management");
  revalidatePath(`/auctions-management/${id}/edit`);
  revalidatePath("/lots-management");
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

/** Count of auctions that are LIVE or SCHEDULED (for header/banners). */
export async function getLiveScheduledAuctionsCount(): Promise<number> {
  return prisma.auction.count({
    where: { status: { in: ["LIVE", "SCHEDULED"] } },
  });
}
