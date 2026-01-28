"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { deleteFromCloudinary } from "@/lib/cloudinary";

/**
 * Extract public_id from Cloudinary URL
 * Handles URLs like:
 * - https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
 * - https://res.cloudinary.com/{cloud}/image/upload/{public_id}.{ext}
 */
function extractPublicIdFromCloudinaryUrl(url: string): string | null {
  try {
    // Check if it's a Cloudinary URL
    if (!url.includes("cloudinary.com")) {
      return null;
    }

    // Extract the path after /upload/
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) {
      return null;
    }

    // Get everything after /upload/
    const afterUpload = url.substring(uploadIndex + "/upload/".length);

    // Remove version prefix if present (v1234567890/)
    const versionPattern = /^v\d+\//;
    const withoutVersion = afterUpload.replace(versionPattern, "");

    // Remove file extension
    const publicId = withoutVersion.split(".")[0];

    return publicId || null;
  } catch (error) {
    console.error("Error extracting public_id from URL:", error);
    return null;
  }
}

/**
 * Delete images from Cloudinary
 * @param imageUrls - Array of image URLs
 */
async function deleteImagesFromCloudinary(imageUrls: string[]): Promise<void> {
  if (!imageUrls || imageUrls.length === 0) {
    return;
  }

  // Delete all images in parallel (with error handling)
  const deletePromises = imageUrls.map(async (url) => {
    const publicId = extractPublicIdFromCloudinaryUrl(url);
    if (publicId) {
      try {
        await deleteFromCloudinary(publicId, "image");
      } catch (error) {
        // Log but don't fail - continue deleting other images
        console.error(`Failed to delete image ${publicId} from Cloudinary:`, error);
      }
    }
  });

  await Promise.allSettled(deletePromises);
}

export async function deleteLotAction(lotId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  try {
    // Find the lot and verify ownership
    // Include items with imageUrls to delete images from Cloudinary
    const lot = await prisma.lot.findUnique({
      where: { id: lotId },
      include: {
        store: {
          select: {
            ownerId: true,
          },
        },
        items: {
          select: {
            id: true,
            imageUrls: true, // Include imageUrls to delete from Cloudinary
          },
        },
      },
    });

    if (!lot) {
      return { error: "Lot not found" };
    }

    // Verify ownership
    if (lot.store.ownerId !== session.user.id) {
      return { error: "Access denied: You don't own this lot" };
    }

    // Only allow deleting drafts
    if (lot.status !== "DRAFT") {
      return { error: "Cannot delete: Only draft lots can be deleted" };
    }

    // Collect all image URLs from all items before deletion
    const allImageUrls: string[] = [];
    lot.items.forEach((item) => {
      if (item.imageUrls && Array.isArray(item.imageUrls)) {
        allImageUrls.push(...item.imageUrls);
      }
    });

    // Get all item IDs for this lot
    const itemIds = lot.items.map((item) => item.id);

    // Delete in correct order to handle foreign key constraints
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Delete bids for all items in this lot
      if (itemIds.length > 0) {
        await tx.bid.deleteMany({
          where: {
            itemId: {
              in: itemIds,
            },
          },
        });

        // 2. Delete orders (and their related invoices/payments will cascade if configured)
        // First, get order IDs to delete related records
        const orders = await tx.order.findMany({
          where: {
            itemId: {
              in: itemIds,
            },
          },
          select: {
            id: true,
          },
        });

        const orderIds = orders.map((order) => order.id);

        // Delete invoices and payments for these orders
        if (orderIds.length > 0) {
          await tx.invoice.deleteMany({
            where: {
              orderId: {
                in: orderIds,
              },
            },
          });

          await tx.payment.deleteMany({
            where: {
              orderId: {
                in: orderIds,
              },
            },
          });
        }

        // Delete orders
        await tx.order.deleteMany({
          where: {
            itemId: {
              in: itemIds,
            },
          },
        });

        // 3. Delete items
        await tx.item.deleteMany({
          where: {
            lotId: lotId,
          },
        });
      }

      // 4. Finally, delete the lot
      await tx.lot.delete({
        where: { id: lotId },
      });
    });

    // Delete images from Cloudinary after successful database deletion
    // Do this outside the transaction to avoid blocking database operations
    if (allImageUrls.length > 0) {
      await deleteImagesFromCloudinary(allImageUrls);
    }

    revalidatePath("/my-auctions");
    revalidatePath("/sellers-dashboard");
    return { error: null, success: true };
  } catch (err: any) {
    console.error("Error deleting lot:", err);
    return {
      error: err.message || "Failed to delete lot. Please try again.",
    };
  }
}