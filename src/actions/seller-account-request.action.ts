"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmailAction } from "@/actions/sendEmail.action";

export type SubmitSellerAccountRequestResult =
  | { error: null; requestId: string }
  | {
      error: string;
      code?: "EMAIL_TAKEN" | "REQUEST_EXISTS";
    };

const OPEN_SELLER_REQUEST_STATUSES = [
  "PENDING",
  "CONTRACT_SENT",
  "ACKNOWLEDGED",
  "APPROVED",
] as const;

function normalizeEmailForCompare(value: string) {
  return value.trim().toLowerCase().normalize("NFKC");
}

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(";")
    .map((v) => v.trim())
    .filter(Boolean);
}

async function readPdfAttachment(
  formData: FormData,
  fieldName: string,
  fallbackName: string,
  required = false
) {
  const value = formData.get(fieldName);
  if (!value) {
    if (required) return { error: `${fallbackName} is required.` as string };
    return { error: null as string | null, attachment: null as null | { filename: string; content: Buffer; contentType: string } };
  }
  if (!(value instanceof File)) {
    return { error: `${fallbackName} is invalid.` as string, attachment: null };
  }
  if (value.size === 0) {
    if (required) return { error: `${fallbackName} is required.` as string, attachment: null };
    return { error: null as string | null, attachment: null };
  }
  if (value.type !== "application/pdf") {
    return { error: `${fallbackName} must be a PDF file.` as string, attachment: null };
  }
  if (value.size > 10 * 1024 * 1024) {
    return { error: `${fallbackName} must be smaller than 10MB.` as string, attachment: null };
  }
  const buffer = Buffer.from(await value.arrayBuffer());
  return {
    error: null as string | null,
    attachment: {
      filename: value.name || fallbackName,
      content: buffer,
      contentType: "application/pdf",
    },
  };
}

export async function submitSellerAccountRequestAction(
  formData: FormData
): Promise<SubmitSellerAccountRequestResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmailForCompare(String(formData.get("email") ?? ""));
  const companyName = String(formData.get("companyName") ?? "").trim();
  const companyRegistrationNumber = String(
    formData.get("companyRegistrationNumber") ?? ""
  ).trim();
  const addressLine1 = String(formData.get("addressLine1") ?? "").trim();
  const addressLine2 = String(formData.get("addressLine2") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const zipcode = String(formData.get("zipcode") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  if (!name || !email || !companyName || !companyRegistrationNumber || !addressLine1 || !city || !state || !zipcode || !country) {
    return { error: "Please fill all required fields." };
  }

  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  // Prefer Prisma filters; use tagged $queryRaw (not Prisma.sql) — driver adapter handles the template form reliably.
  let existingUser =
    (await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })) ??
    (await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { id: true },
    }));

  if (!existingUser) {
    const rows = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM users WHERE LOWER(TRIM(email)) = ${email}
    `;
    existingUser = rows[0] ?? null;
  }

  const sessionUserId =
    session?.user?.id != null ? String(session.user.id) : null;
  if (existingUser && String(existingUser.id) !== sessionUserId) {
    return {
      error:
        "This email is already registered to another account. Please use a different email address.",
      code: "EMAIL_TAKEN",
    };
  }

  let duplicateRequest = await prisma.sellerAccountRequest.findFirst({
    where: {
      requesterEmail: { equals: email, mode: "insensitive" },
      status: { in: [...OPEN_SELLER_REQUEST_STATUSES] },
    },
    select: { id: true },
  });

  if (!duplicateRequest) {
    const dupRows = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "SellerAccountRequest"
      WHERE LOWER(TRIM("requesterEmail")) = ${email}
        AND status IN ('PENDING', 'CONTRACT_SENT', 'ACKNOWLEDGED', 'APPROVED')
      LIMIT 1
    `;
    duplicateRequest = dupRows[0] ? { id: dupRows[0].id } : null;
  }

  if (duplicateRequest) {
    return {
      error:
        "A seller account request is already in progress for this email. Please use a different email or contact support.",
      code: "REQUEST_EXISTS",
    };
  }

  const request = await prisma.sellerAccountRequest.create({
    data: {
      userId: session?.user?.id,
      requesterName: name,
      requesterEmail: email,
      companyName,
      companyRegistrationNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      zipcode,
      country,
    },
  });

  const admins = adminEmails();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  if (admins.length > 0) {
    await sendEmailAction({
      to: admins.join(","),
      subject: "New Seller Account Request",
      meta: {
        description: [
          `Requester: ${name} (${email})`,
          `Company: ${companyName}`,
          `Registration: ${companyRegistrationNumber}`,
          `Address: ${[addressLine1, addressLine2, city, state, zipcode, country].filter(Boolean).join(", ")}`,
          `Review request: ${appUrl}/seller-account-requests`,
        ].join("\n"),
        link: `${appUrl}/seller-account-requests`,
      },
    });
  }

  revalidatePath("/seller-account-requests");
  return { error: null, requestId: request.id };
}

export async function sendSellerContractAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session || session.user.role !== "ADMIN") redirect("/sign-in");

  const requestId = String(formData.get("requestId") ?? "");
  const contractDetails = String(formData.get("contractDetails") ?? "").trim();
  if (!requestId || !contractDetails) return { error: "Request and contract details are required." };

  const contractPdf = await readPdfAttachment(formData, "contractPdf", "Contract PDF", true);
  if (contractPdf.error) return { error: contractPdf.error };
  const termsPdf = await readPdfAttachment(formData, "termsPdf", "Terms PDF", false);
  if (termsPdf.error) return { error: termsPdf.error };
  const policyPdf = await readPdfAttachment(formData, "policyPdf", "Policy PDF", false);
  if (policyPdf.error) return { error: policyPdf.error };

  const req = await prisma.sellerAccountRequest.findUnique({ where: { id: requestId } });
  if (!req) return { error: "Request not found." };

  const token = randomUUID();
  await prisma.sellerAccountRequest.update({
    where: { id: requestId },
    data: {
      status: "CONTRACT_SENT",
      contractDetails,
      contractSentAt: new Date(),
      acknowledgementToken: token,
      adminNotes: null,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const ackLink = `${appUrl}/seller-account-request/acknowledge?token=${token}`;
  const attachments: Array<{ filename: string; content: Buffer; contentType?: string }> = [];
  if (contractPdf.attachment) attachments.push(contractPdf.attachment);
  if (termsPdf.attachment) attachments.push(termsPdf.attachment);
  if (policyPdf.attachment) attachments.push(policyPdf.attachment);
  await sendEmailAction({
    to: req.requesterEmail,
    subject: "Seller Contract Details & Acknowledgement Required",
    meta: {
      description: `${contractDetails}\n\nPlease review and acknowledge to continue seller onboarding.`,
      link: ackLink,
    },
    attachments,
  });

  revalidatePath("/seller-account-requests");
  return { error: null };
}

export async function acknowledgeSellerContractAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const acknowledgementName = String(formData.get("acknowledgementName") ?? "").trim();
  const accept = String(formData.get("accept") ?? "") === "true";
  if (!token || !acknowledgementName || !accept) {
    return { error: "You must acknowledge the contract to continue." };
  }

  const req = await prisma.sellerAccountRequest.findUnique({
    where: { acknowledgementToken: token },
  });
  if (!req) return { error: "Invalid acknowledgement link." };

  await prisma.sellerAccountRequest.update({
    where: { id: req.id },
    data: {
      status: "ACKNOWLEDGED",
      acknowledgementName,
      acknowledgedAt: new Date(),
    },
  });

  const admins = adminEmails();
  if (admins.length > 0) {
    await sendEmailAction({
      to: admins.join(","),
      subject: "Seller Contract Acknowledged",
      meta: {
        description: `${req.requesterName} (${req.requesterEmail}) acknowledged the seller contract.`,
        link: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/seller-account-requests`,
      },
    });
  }

  revalidatePath("/seller-account-requests");
  return { error: null };
}

export async function approveSellerAccountRequestAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session || session.user.role !== "ADMIN") redirect("/sign-in");

  const requestId = String(formData.get("requestId") ?? "");
  if (!requestId) return { error: "Request is required." };
  const req = await prisma.sellerAccountRequest.findUnique({ where: { id: requestId } });
  if (!req) return { error: "Request not found." };

  const user = await prisma.user.findUnique({ where: { email: req.requesterEmail } });
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "SELLER",
        companyName: req.companyName,
        companyRegistrationNumber: req.companyRegistrationNumber,
        addressLine1: req.addressLine1,
        addressLine2: req.addressLine2,
        city: req.city,
        state: req.state,
        zipcode: req.zipcode,
        country: req.country,
        displayLocation: `${req.city}, ${req.state}`,
      },
    });
  }

  await prisma.sellerAccountRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", approvedAt: new Date() },
  });

  await sendEmailAction({
    to: req.requesterEmail,
    subject: "Seller Account Approved",
    meta: {
      description:
        "Your seller request has been approved. You can now sign in and access seller features.",
      link: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/sign-in`,
    },
  });

  revalidatePath("/seller-account-requests");
  return { error: null };
}

export async function rejectSellerAccountRequestAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session || session.user.role !== "ADMIN") redirect("/sign-in");

  const requestId = String(formData.get("requestId") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "").trim() || null;
  if (!requestId) return { error: "Request is required." };
  const req = await prisma.sellerAccountRequest.findUnique({ where: { id: requestId } });
  if (!req) return { error: "Request not found." };

  await prisma.sellerAccountRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", rejectedAt: new Date(), adminNotes },
  });

  await sendEmailAction({
    to: req.requesterEmail,
    subject: "Seller Account Request Update",
    meta: {
      description:
        adminNotes ??
        "Your request was not approved at this time. Please contact support for details.",
      link: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/how-to-sell`,
    },
  });

  revalidatePath("/seller-account-requests");
  return { error: null };
}
