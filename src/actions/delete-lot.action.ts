"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function deleteLotAction(lotId: string) {
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
          },
        },
        items: {
          select: {
            id: true,
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