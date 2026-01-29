"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createStoreAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();

  const status = String(formData.get("status") || "ACTIVE") as "ACTIVE" | "SUSPENDED";

  // Validation
  if (!name) {
    return { error: "Store name is required" };
  }

  if (name.length < 2) {
    return { error: "Store name must be at least 2 characters" };
  }

  if (name.length > 100) {
    return { error: "Store name must be less than 100 characters" };
  }

  if (description && description.length > 500) {
    return { error: "Description must be less than 500 characters" };
  }

  // if (isNaN(commissionPct) || commissionPct < 0 || commissionPct > 100) {
  //   return { error: "Commission percentage must be between 0 and 100" };
  // }

  if (logoUrl && !isValidUrl(logoUrl)) {
    return { error: "Please enter a valid logo URL" };
  }

  try {
    const store = await prisma.store.create({
      data: {
        name,
        description: description || null,
        logoUrl: logoUrl || null,        
        status,
        ownerId: session.user.id,
      },
    });

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