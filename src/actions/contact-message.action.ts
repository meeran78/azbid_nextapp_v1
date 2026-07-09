"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ContactMessageStatus } from "@/generated/prisma/client";

export async function getAdminContactMessages() {
  return prisma.contactMessage.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

export async function updateContactMessageStatusAction({
  id,
  status,
}: {
  id: string;
  status: ContactMessageStatus;
}) {
  await prisma.contactMessage.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/contact-messages");
  return { success: true };
}
