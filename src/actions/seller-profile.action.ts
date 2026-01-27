"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const sellerProfileSchema = z.object({
  addressLine1: z.string().max(255).optional().nullable(),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  zipcode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  businessPhone: z.string().max(50).optional().nullable(),
});

export type SellerProfileInput = z.infer<typeof sellerProfileSchema>;

export async function updateSellerProfileAction(input: SellerProfileInput) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  const data = sellerProfileSchema.parse(input);

  const displayLocation = [data.city, data.state].filter(Boolean).join(", ") || null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      state: data.state || null,
      zipcode: data.zipcode || null,
      country: data.country || null,
      businessPhone: data.businessPhone || null,
      displayLocation,
    },
  });
  revalidatePath("/seller-profile");
  revalidatePath("/my-auctions");
  return { success: true };
}