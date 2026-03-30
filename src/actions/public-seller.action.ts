"use server";

import { prisma } from "@/lib/prisma";

export type PublicSeller = {
  id: string;
  name: string;
  image: string | null;
  companyName: string | null;
  displayLocation: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  country: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  businessWebsite: string | null;
  stores: { id: string; name: string }[];
};

/**
 * Get seller by ID for public profile page. Returns null if not found.
 */
export async function getSellerById(sellerId: string): Promise<PublicSeller | null> {
  const user = await prisma.user.findFirst({
    where: { id: sellerId, role: "SELLER" },
    select: {
      id: true,
      name: true,
      image: true,
      companyName: true,
      displayLocation: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      zipcode: true,
      country: true,
      businessPhone: true,
      businessEmail: true,
      businessWebsite: true,
      stores: {
        where: { status: "ACTIVE" },
        select: { id: true, name: true },
      },
    },
  });
  if (!user) return null;
  return user as PublicSeller;
}

export type FeaturedSellerForHero = {
  sellerId: string;
  sellerName: string;
  sellerImageUrl: string | null;
  sellerLocation: string | null;
  storeId: string;
  storeName: string;
};

/**
 * Get featured sellers for hero carousel (active stores with owner info). Max 5.
 */
export async function getFeaturedSellersForHero(
  limit = 5
): Promise<FeaturedSellerForHero[]> {
  const stores = await prisma.store.findMany({
    where: { status: "ACTIVE" },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      owner: {
        select: {
          id: true,
          name: true,
          companyName: true,
          image: true,
          displayLocation: true,
          addressLine1: true,
          city: true,
          state: true,
          zipcode: true,
        },
      },
    },
  });
  return stores.map((s) => {
    const o = s.owner;
    const location =
      o.displayLocation ||
      [o.addressLine1, o.city, o.state, o.zipcode].filter(Boolean).join(", ") ||
      null;
    return {
      sellerId: o.id,
      sellerName: o.companyName || o.name,
      sellerImageUrl: o.image,
      sellerLocation: location || null,
      storeId: s.id,
      storeName: s.name,
    };
  });
}
