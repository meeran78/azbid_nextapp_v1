"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { faqSchema, type FaqInput } from "@/lib/validations/faq.schema";

export async function getPublicFaqs() {
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return faqs;
}

export async function getAllFaqsForAdmin() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const faqs = await prisma.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return faqs;
}

export async function getFaqsForPublic() {
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return faqs;
}

export async function upsertFaqAction(input: FaqInput) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const data = faqSchema.parse(input);

  if (data.id) {
    // update
    const { id, ...rest } = data;
    await prisma.faq.update({
      where: { id },
      data: rest,
    });
  } else {
    // create
    const { id: _, ...rest } = data;
    await prisma.faq.create({
      data: rest,
    });
  }

  // revalidate any FAQ pages if needed
  // revalidatePath("/admin/help-support");
  // revalidatePath("/help-support");

  return { success: true };
}