"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendEmailAction } from "@/actions/sendEmail.action";
import { deleteLotItemImagesAction } from "@/actions/delete-lot.action";

export async function createStoreAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();

  // Validation
  if (!name) return { error: "Store name is required" };
  if (name.length < 2) return { error: "Store name must be at least 2 characters" };
  if (name.length > 100) return { error: "Store name must be less than 100 characters" };
  if (description && description.length > 500) return { error: "Description must be less than 500 characters" };
  if (logoUrl && !isValidUrl(logoUrl)) return { error: "Please enter a valid logo URL" };

  try {
    const store = await prisma.store.create({
      data: {
        name,
        description: description || null,
        logoUrl: logoUrl || null,
        status: "PENDING",  // Always PENDING on creation
        ownerId: session.user.id,
      },
    });

    // Send email to admins
    try {
      const adminUsers = await prisma.user.findMany({
        where: { role: "ADMIN", emailVerified: true },
        select: { email: true },
      });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const approvalUrl = `${appUrl}/admin-dashboard/stores`;

      for (const admin of adminUsers) {
        await sendEmailAction({
          to: admin.email,
          subject: "New Store Pending Approval",
          meta: {
            description: `A new store "${store.name}" has been created by ${session.user.name} and is pending your approval. Please review and approve it in the admin dashboard.`,
            link: approvalUrl,
          },
        });
      }
    } catch (emailErr) {
      console.error("Error sending store approval email:", emailErr);
    }

    revalidatePath("/sellers-dashboard");
    return { error: null, store };
  } catch (err: any) {
    console.error("Error creating store:", err);
    return { error: "Failed to create store. Please try again." };
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function updateStoreAction(storeId: string, formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  const existing = await prisma.store.findFirst({
    where: { id: storeId, ownerId: session.user.id },
  });
  if (!existing) {
    return { error: "Store not found or you do not own this store." };
  }

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();

  if (!name) return { error: "Store name is required" };
  if (name.length < 2) return { error: "Store name must be at least 2 characters" };
  if (name.length > 100) return { error: "Store name must be less than 100 characters" };
  if (description && description.length > 500) return { error: "Description must be less than 500 characters" };
  if (logoUrl && !isValidUrl(logoUrl)) return { error: "Please enter a valid logo URL" };

  const oldLogoUrl = existing.logoUrl;

  try {
    const store = await prisma.store.update({
      where: { id: storeId },
      data: {
        name,
        description: description || null,
        logoUrl: logoUrl || null,
      },
    });

    if (oldLogoUrl && oldLogoUrl !== logoUrl && oldLogoUrl.includes("cloudinary.com")) {
      await deleteLotItemImagesAction([oldLogoUrl]);
    }

    revalidatePath("/my-auctions");
    return { error: null, store };
  } catch (err: any) {
    console.error("Error updating store:", err);
    return { error: "Failed to update store. Please try again." };
  }
}