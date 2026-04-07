"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitAppointmentRequestAction(formData: FormData) {
  const requesterName = String(formData.get("requesterName") ?? "").trim();
  const requesterEmail = String(formData.get("requesterEmail") ?? "")
    .trim()
    .toLowerCase();
  const requesterPhone = String(formData.get("requesterPhone") ?? "").trim() || null;
  const appointmentDateRaw = String(formData.get("appointmentDate") ?? "").trim();
  const appointmentType = String(formData.get("appointmentType") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!requesterName || !requesterEmail || !appointmentDateRaw || !appointmentType) {
    return { error: "Please complete all required fields." };
  }

  const appointmentDate = new Date(appointmentDateRaw);
  if (Number.isNaN(appointmentDate.getTime())) {
    return { error: "Please select a valid appointment date and time." };
  }

  if (appointmentDate.getTime() < Date.now()) {
    return { error: "Appointment date must be in the future." };
  }

  if (!["IN_PERSON", "VIRTUAL", "PHONE"].includes(appointmentType)) {
    return { error: "Please select a valid appointment type." };
  }

  await prisma.appointmentRequest.create({
    data: {
      requesterName,
      requesterEmail,
      requesterPhone,
      appointmentDate,
      appointmentType: appointmentType as "IN_PERSON" | "VIRTUAL" | "PHONE",
      notes,
    },
  });

  revalidatePath("/admin-dashboard");
  return { error: null };
}

export async function approveAppointmentRequestAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session || session.user.role !== "ADMIN") redirect("/sign-in");

  const requestId = String(formData.get("requestId") ?? "").trim();
  if (!requestId) return { error: "Appointment request is required." };

  await prisma.appointmentRequest.update({
    where: { id: requestId },
    data: {
      status: "APPROVED",
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      adminNotes: null,
    },
  });

  revalidatePath("/admin-dashboard");
  return { error: null };
}

export async function rejectAppointmentRequestAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session || session.user.role !== "ADMIN") redirect("/sign-in");

  const requestId = String(formData.get("requestId") ?? "").trim();
  const adminNotes = String(formData.get("adminNotes") ?? "").trim() || null;
  if (!requestId) return { error: "Appointment request is required." };

  await prisma.appointmentRequest.update({
    where: { id: requestId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: session.user.id,
      adminNotes,
    },
  });

  revalidatePath("/admin-dashboard");
  return { error: null };
}

export async function getPendingAppointmentRequestCountAction() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session || session.user.role !== "ADMIN") return { count: 0 };

  const count = await prisma.appointmentRequest.count({
    where: { status: "PENDING" },
  });

  return { count };
}
