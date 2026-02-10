"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type BuyerSettingsProfile = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: string;
  createdAt: Date;
};

export type BuyerNotificationPrefs = {
  notifyOnOutbid: boolean;
  notifyOnWin: boolean;
  notifyOnLotEndingSoon: boolean;
};

export type BuyerSettingsData = {
  profile: BuyerSettingsProfile;
  notificationPrefs: BuyerNotificationPrefs;
  acceptedTerms: boolean;
  acceptedTermsAt: Date | null;
};

/**
 * Buyer-only. Returns profile, notification prefs, and compliance fields for the settings page.
 */
export async function getBuyerSettingsData(): Promise<BuyerSettingsData | null> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "BUYER") {
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
      notifyOnOutbid: true,
      notifyOnWin: true,
      notifyOnLotEndingSoon: true,
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
    notificationPrefs: {
      notifyOnOutbid: user.notifyOnOutbid ?? true,
      notifyOnWin: user.notifyOnWin ?? true,
      notifyOnLotEndingSoon: user.notifyOnLotEndingSoon ?? true,
    },
    acceptedTerms: user.acceptedTerms,
    acceptedTermsAt: user.acceptedTermsAt,
  };
}

/**
 * Buyer-only. Updates bidding notification preferences.
 */
export async function updateBuyerNotificationPrefs(prefs: BuyerNotificationPrefs) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "BUYER") {
    return { error: "Unauthorized" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      notifyOnOutbid: prefs.notifyOnOutbid,
      notifyOnWin: prefs.notifyOnWin,
      notifyOnLotEndingSoon: prefs.notifyOnLotEndingSoon,
    },
  });

  return { success: true };
}
