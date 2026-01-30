"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sendEmailAction } from "@/actions/sendEmail.action";

export async function approveLotAction(lotId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    include: {
      store: { include: { owner: { select: { name: true, email: true } } } },
      items: true,
    },
  });

  if (!lot) return { error: "Lot not found" };
  if (lot.status !== "SCHEDULED") return { error: "Lot is not in SCHEDULED status" };

  await prisma.lot.update({
    where: { id: lotId },
    data: {
      status: "LIVE",
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      adminNotes: null,
    },
  });

  // Email seller
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const lotUrl = `${appUrl}/my-auctions?lotId=${lotId}`;

    await sendEmailAction({
      to: lot.store.owner.email,
      subject: "Lot Approved – Now Live",
      meta: {
        description: `Your lot "${lot.title}" has been approved and is now LIVE. You can view it in your dashboard.`,
        link: lotUrl,
      },
    });
  } catch (emailErr) {
    console.error("Error sending lot approval email:", emailErr);
  }

  revalidatePath("/lots-management");
  revalidatePath("/lots-management/[id]");
  return { error: null };
}

export async function rejectLotAction(lotId: string, adminNotes: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const lot = await prisma.lot.findUnique({
    where: { id: lotId },
    include: {
      store: { include: { owner: { select: { name: true, email: true } } } },
    },
  });

  if (!lot) return { error: "Lot not found" };
  if (lot.status !== "SCHEDULED") return { error: "Lot is not in SCHEDULED status" };
  if (!adminNotes?.trim()) return { error: "Admin notes are required when rejecting" };

  await prisma.lot.update({
    where: { id: lotId },
    data: {
      status: "RESEND",
      adminNotes: adminNotes.trim(),
      reviewedAt: new Date(),
      reviewedById: session.user.id,
    },
  });

  // Email seller with admin notes
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const lotUrl = `${appUrl}/my-auctions/lots/edit?lotId=${lotId}`;

    await sendEmailAction({
      to: lot.store.owner.email,
      subject: "Lot Rejected – Action Required",
      meta: {
        description: `Your lot "${lot.title}" has been rejected and sent back for revision. Admin notes: ${adminNotes.trim()}\n\nPlease review the notes and resubmit your lot.`,
        link: lotUrl,
      },
    });
  } catch (emailErr) {
    console.error("Error sending lot rejection email:", emailErr);
  }

  revalidatePath("/lots-management");
  revalidatePath("/lots-management/[id]");
  return { error: null };
}