"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type SellerSettingsProfile = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  createdAt: Date;
};

export type SellerSettingsData = {
  profile: SellerSettingsProfile;
  acceptedTerms: boolean;
  acceptedTermsAt: Date | null;
};

/**
 * Seller-only. Returns profile and compliance fields for the seller settings page.
 */
export async function getSellerSettingsData(): Promise<SellerSettingsData | null> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      createdAt: true,
      acceptedTerms: true,
      acceptedTermsAt: true,
    },
  });

  if (!user) return null;

  return {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
    },
    acceptedTerms: user.acceptedTerms,
    acceptedTermsAt: user.acceptedTermsAt,
  };
}
