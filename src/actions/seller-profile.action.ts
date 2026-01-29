"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const sellerProfileSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(255),
  companyRegistrationNumber: z.string().max(50).optional().nullable(),
  companyDescription: z.string().min(1, "Company description is required").max(2000),
  companyLocationDescription: z.string().min(1, "Company location description is required").max(500),
  companyLogo: z.string().url("Invalid logo URL").optional().nullable(),
  companyBanner: z.string().url("Invalid banner URL").optional().nullable(),
  companySocialMedia: z.string().max(100).optional().nullable(),
  companySocialMediaUrl: z.string().max(500).optional().nullable(),
  companySocialMediaIcon: z.string().max(100).optional().nullable(),
  newsLetterEmailSubscription: z.boolean().optional().nullable(),
  newsLetterSMSSubscription: z.boolean().optional().nullable(),
  addressLine1: z.string().min(1, "Address Line 1 is required").max(255),
  addressLine2: z.string().max(255).optional().nullable(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State/Province is required").max(50),
  zipcode: z.string().min(1, "ZIP/Postal code is required").max(20),
  country: z.string().min(1, "Country is required").max(100).default("United States"),
  businessPhone: z.string().min(1, "Company phone is required").max(50),
  businessEmail: z.string().email("Invalid email address").optional().nullable(),
  businessWebsite: z.string().url("Invalid website URL").optional().nullable(),
  businessDescription: z.string().max(2000).optional().nullable(),
  businessLogo: z.string().max(500).optional().nullable(),
  businessBanner: z.string().max(500).optional().nullable(),
  businessSocialMedia: z.string().max(100).optional().nullable(),
  businessSocialMediaUrl: z.string().max(500).optional().nullable(),
  businessSocialMediaIcon: z.string().max(100).optional().nullable(),

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
      companyName: data.companyName || null,
      companyRegistrationNumber: data.companyRegistrationNumber || null,
      companyDescription: data.companyDescription || null,
      companyLocationDescription: data.companyLocationDescription || null,
      companyLogo: data.companyLogo || null,
      companyBanner: data.companyBanner || null,
      companySocialMedia: data.companySocialMedia || null,
      companySocialMediaUrl: data.companySocialMediaUrl || null,
      companySocialMediaIcon: data.companySocialMediaIcon || null,
      newsLetterEmailSubscription: data.newsLetterEmailSubscription ?? null,
      newsLetterSMSSubscription: data.newsLetterSMSSubscription ?? null,
      addressLine1: data.addressLine1 || null,
      addressLine2: data.addressLine2 || null,
      city: data.city || null,
      state: data.state || null,
      zipcode: data.zipcode || null,
      country: data.country || null,
      businessPhone: data.businessPhone || null,
      displayLocation,
      businessEmail: data.businessEmail || null,
      businessWebsite: data.businessWebsite || null,
      businessDescription: data.businessDescription || null,
    },
  });
  revalidatePath("/seller-profile");
  revalidatePath("/my-auctions");
  return { success: true };
}