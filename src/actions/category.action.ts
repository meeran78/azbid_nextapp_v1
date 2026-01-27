"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteFromCloudinary } from "@/lib/cloudinary";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Get all categories
export async function getCategories() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    redirect("/sign-in");
  }

  // Only admins can manage categories, but sellers can view active ones
  const where: any = {};
  if (session.user.role !== "ADMIN") {
    where.status = "ACTIVE";
  }

  const categories = await prisma.category.findMany({
    where,
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories.map((cat) => ({
    ...cat,
    itemCount: cat._count.items,
  }));
}

// Get single category
export async function getCategory(id: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    redirect("/sign-in");
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (!category) {
    return null;
  }

  return {
    ...category,
    itemCount: category._count.items,
  };
}

// Create category (Admin only)
export async function createCategoryAction(data: CategoryInput) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const validatedData = categorySchema.parse(data);

  const category = await prisma.category.create({
    data: {
      name: validatedData.name,
      description: validatedData.description || null,
      imageUrl: validatedData.imageUrl || null,
      status: validatedData.status,
    },
  });

  revalidatePath("/admin/categories");
  return { success: true, category };
}



// Delete category (Admin only)
export async function deleteCategoryAction(id: string) {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
  
    if (!session || session.user.role !== "ADMIN") {
      redirect("/sign-in");
    }
  
    // Check if category has items
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            items: true,
          },
        },
      },
    });
  
    if (!category) {
      return { error: "Category not found" };
    }
  
    if (category._count.items > 0) {
      return { error: "Cannot delete category with existing items" };
    }
  
    // Delete image from Cloudinary if it exists
    if (category.imageUrl && category.imageUrl.includes("cloudinary")) {
      try {
        const urlParts = category.imageUrl.split("/");
        const publicIdWithExt = urlParts.slice(-2).join("/").split(".")[0];
        const publicId = publicIdWithExt;
  
        await deleteFromCloudinary(publicId, "image");
      } catch (error) {
        console.error("Failed to delete image from Cloudinary:", error);
        // Continue with deletion even if image deletion fails
      }
    }
  
    await prisma.category.delete({
      where: { id },
    });
  
    revalidatePath("/admin-dashboard/categories");
    return { success: true };
  }

// Update category (Admin only)
export async function updateCategoryAction(id: string, data: CategoryInput) {
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
  
    if (!session || session.user.role !== "ADMIN") {
      redirect("/sign-in");
    }
  
    // Get existing category to check for old image
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: { imageUrl: true },
    });
  
    const validatedData = categorySchema.parse(data);
  
    // If updating image and old image exists, delete it from Cloudinary
    if (
      existingCategory?.imageUrl &&
      validatedData.imageUrl !== existingCategory.imageUrl &&
      existingCategory.imageUrl.includes("cloudinary")
    ) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = existingCategory.imageUrl.split("/");
        const publicIdWithExt = urlParts.slice(-2).join("/").split(".")[0];
        const publicId = publicIdWithExt;
  
        await deleteFromCloudinary(publicId, "image");
      } catch (error) {
        console.error("Failed to delete old image from Cloudinary:", error);
        // Continue with update even if deletion fails
      }
    }
  
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        imageUrl: validatedData.imageUrl || null,
        status: validatedData.status,
      },
    });
  
    revalidatePath("/admin-dashboard/categories");
    return { success: true, category };
  }
