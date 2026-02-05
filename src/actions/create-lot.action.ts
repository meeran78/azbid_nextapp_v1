"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createLotSchemaForServer } from "@/lib/validations/lot.schema";
import { sendEmailAction } from "@/actions/sendEmail.action";

// Generate human-friendly lot display ID
async function generateUniqueLotDisplayId(): Promise<string> {
  let displayId: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    displayId = `LOT-${year}-${random}`;

    // Check if this ID already exists
    const existing = await prisma.lot.findUnique({
      where: { lotDisplayId: displayId },
      select: { id: true },
    });

    if (!existing) {
      isUnique = true;
    } else {
      attempts++;
    }
  }

  if (!isUnique) {
    // Fallback: use timestamp if we can't generate a unique ID
    const timestamp = Date.now();
    displayId = `LOT-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}`;
  }

  return displayId!;
}

export async function createLotAction(data: {
  lotId?: string;
  title: string;
  description: string;
  storeId: string;
  auctionId?: string | null;
  lotDisplayId?: string | null;
  closesAt: string; // ISO date string
  removalStartAt?: string | null;
  inspectionAt?: string | null;
  items: Array<{
    title: string;
    categoryId: string | null;
    condition: string;
    startPrice: number;
    retailPrice?: number | null;
    reservePrice?: number | null;
    description?: string;
    imageUrls: string[];
    videoUrls?: string[];
  }>;
  disclaimerAccepted: boolean;
  isDraft?: boolean; // New parameter for draft saves
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  let validatedData: any;

  // Skip validation for drafts - allow incomplete data
  if (data.isDraft) {
    // Minimal processing for drafts - just ensure basic types
    validatedData = {
      title: data.title || "",
      description: data.description || "",
      storeId: data.storeId,
      auctionId: data.auctionId || null,
      lotDisplayId: data.lotDisplayId || null,
      closesAt: data.closesAt ? new Date(data.closesAt) : new Date(),
      removalStartAt: data.removalStartAt ? new Date(data.removalStartAt) : null,
      inspectionAt: data.inspectionAt ? new Date(data.inspectionAt) : null,
      items: (data.items || []).map((item) => ({
        title: item.title || "",
        categoryId: item.categoryId || null,
        description: item.description || null,
        condition: item.condition || "Used – Good",
        startPrice: item.startPrice || 0,
        retailPrice: item.retailPrice || null,
        reservePrice: item.reservePrice || null,
        imageUrls: item.imageUrls || [],
      })),
    };
  } else {
    // Full validation for publishing
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

    validatedData = validationResult.data;
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      id: validatedData.storeId,
      ownerId: session.user.id,
    },
  });
// After "Verify store ownership" block (~line 126), add:
if (store.status !== "ACTIVE") {
  return { error: "Store must be approved before you can add lots. Please wait for admin approval." };
}

  if (!store) {
    return { error: "Store not found or access denied" };
  }

  try {
    // Determine lot status

    const lotStatus = data.isDraft ? "DRAFT" : "SCHEDULED";

    let lot;

    // If lotId is provided, try to update existing lot
    if (data.lotId) {
      // First check if lot exists (by ID only)
      const existingLot = await prisma.lot.findUnique({
        where: { id: data.lotId },
        include: {
          store: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      // If lot exists, verify ownership and draft status
      if (existingLot) {
        // Check ownership through store relationship
        if (existingLot.store.ownerId !== session.user.id) {
          return { error: "Access denied: You don't own this lot" };
        }

        // Only allow editing drafts
        if (existingLot.status !== "DRAFT" && existingLot.status !== "RESEND") {
          return { error: "Cannot edit: Lot is not in draft status" };
        }

        // Delete all existing items for this lot first, then update with new items (ensures removed items are deleted from DB).
        // Must delete dependents first to satisfy foreign keys: Bids, OrderItems, InvoiceItems; then Items.
        lot = await prisma.$transaction(async (tx) => {
          const itemIds = await tx.item.findMany({
            where: { lotId: data.lotId! },
            select: { id: true },
          }).then((rows) => rows.map((r) => r.id));
          if (itemIds.length > 0) {
            await tx.item.updateMany({
              where: { id: { in: itemIds } },
              data: { winningBidId: null },
            });
            await tx.bid.deleteMany({ where: { itemId: { in: itemIds } } });
            await tx.orderItem.deleteMany({ where: { itemId: { in: itemIds } } });
            await tx.invoiceItem.deleteMany({ where: { itemId: { in: itemIds } } });
            await tx.itemFavourite.deleteMany({ where: { itemId: { in: itemIds } } });
            await tx.itemWatch.deleteMany({ where: { itemId: { in: itemIds } } });
            await tx.item.deleteMany({ where: { lotId: data.lotId! } });
          }
          return tx.lot.update({
            where: { id: data.lotId },
            data: {
              title: validatedData.title,
              description: validatedData.description,
              storeId: validatedData.storeId,
              auctionId: validatedData.auctionId || null,
              status: lotStatus,
            closesAt: validatedData.closesAt,
            inspectionAt: validatedData.inspectionAt || null,
            removalStartAt: validatedData.removalStartAt || null, // Set lotDisplayId when publishing (if not already set)
            lotDisplayId: existingLot.lotDisplayId ?? validatedData.lotDisplayId ?? (await generateUniqueLotDisplayId()),
              items: {
                create: validatedData.items.map((item) => ({
                title: item.title,
                categoryId: item.categoryId || null,
                description: item.description || null,
                condition: item.condition,
                startPrice: item.startPrice,
                retailPrice: item.retailPrice || null,
                reservePrice: item.reservePrice || null,
                imageUrls: item.imageUrls || [],
              })),
            },
            },
          include: {
            items: true,
            store: {
              select: {
                name: true,
              },
            },
          },
        });
        });

        revalidatePath("/my-auctions");
        revalidatePath("/sellers-dashboard");

        // Send email to admins when lot is published (not a draft)
        if (!data.isDraft && lot) {
          try {
            // Get all admin users
            const adminUsers = await prisma.user.findMany({
              where: {
                role: "ADMIN",
                emailVerified: true,
              },
              select: {
                email: true,
              },
            });

            // Send email to each admin
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const adminDashboardUrl = `${appUrl}/admin-dashboard`;

            for (const admin of adminUsers) {
              await sendEmailAction({
                to: admin.email,
                subject: "New Lot Pending Approval",
                meta: {
                  description: `A new lot "${lot.title}" from store "${lot.store.name}" has been submitted and is pending your approval. Please review and approve it in the admin dashboard.`,
                  link: adminDashboardUrl,
                },
              });
            }
          } catch (emailError) {
            // Log email error but don't fail the lot creation
            console.error("Error sending approval email to admins:", emailError);
          }
        }

        return { error: null, lot };
      }
      // If lot doesn't exist, fall through to create new lot
    }

    // Create new lot (either no lotId provided, or lotId doesn't exist)
    lot = await prisma.lot.create({
      data: {
        // lotDisplayId: !data.isDraft ? await generateUniqueLotDisplayId() : null,
        lotDisplayId: validatedData.lotDisplayId ?? (await generateUniqueLotDisplayId()),
        title: validatedData.title,
        description: validatedData.description,
        storeId: validatedData.storeId,
        auctionId: validatedData.auctionId || null,
        // lotDisplayId: validatedData.lotDisplayId || null,
        status: lotStatus,
        closesAt: validatedData.closesAt,
        inspectionAt: validatedData.inspectionAt || null,
        removalStartAt: validatedData.removalStartAt || null,
        items: {
          create: validatedData.items.map((item) => ({
            title: item.title,
            categoryId: item.categoryId || null,
            description: item.description || null,
            condition: item.condition,
            startPrice: item.startPrice,
            retailPrice: item.retailPrice || null,
            reservePrice: item.reservePrice || null,
            imageUrls: item.imageUrls || [],
          })),
        },
      },
      include: {
        items: true,
        store: {
          select: {
            name: true,
          },
        },
      },
    });

    revalidatePath("/my-auctions");
    revalidatePath("/sellers-dashboard");

    // Send email to admins when lot is published (not a draft)
    if (!data.isDraft && lot) {
      try {
        // Get all admin users
        const adminUsers = await prisma.user.findMany({
          where: {
            role: "ADMIN",
            emailVerified: true,
          },
          select: {
            email: true,
          },
        });

        // Send email to each admin
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const adminDashboardUrl = `${appUrl}/admin-dashboard`;

        for (const admin of adminUsers) {
          await sendEmailAction({
            to: admin.email,
            subject: "New Lot Pending Approval",
            meta: {
              description: `A new lot "${lot.title}" from store "${lot.store.name}" has been submitted and is pending your approval. Please review and approve it in the admin dashboard.`,
              link: adminDashboardUrl,
            },
          });
        }
      } catch (emailError) {
        // Log email error but don't fail the lot creation
        console.error("Error sending approval email to admins:", emailError);
      }
    }

    return { error: null, lot };
  } catch (err: any) {
    console.error("Error creating/updating lot:", err);
    return {
      error: err.message || "Failed to save lot. Please try again.",
      details: err,
    };
  }
}