"use server";

import { timingSafeEqual } from "crypto";

import { auth, ErrorCode } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { prisma } from "@/lib/prisma";

function isValidRegistrationKey(provided: string): boolean {
  const expected = process.env.ADMIN_REGISTRATION_KEY;
  if (!expected) return false;

  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) return false;

  return timingSafeEqual(providedBuf, expectedBuf);
}

export async function signUpAdminAction(formData: FormData) {
  const name = String(formData.get("name"));
  if (!name) return { error: "Please enter your name" };

  const email = String(formData.get("email"));
  if (!email) return { error: "Please enter your email" };

  const password = String(formData.get("password"));
  if (!password) return { error: "Please enter your password" };

  const acceptedTerms = String(formData.get("acceptedTerms")).toLowerCase() === "true";
  if (!acceptedTerms) return { error: "You must accept the terms and conditions" };

  const registrationKey = String(formData.get("registrationKey") ?? "");
  if (!registrationKey) return { error: "Please enter the admin registration key" };
  if (!isValidRegistrationKey(registrationKey)) {
    return { error: "Invalid admin registration key" };
  }

  try {
    const result = await auth.api.signUpEmail({
      body: { name, email, password },
    });

    if (result.user?.id) {
      await prisma.user.update({
        where: { id: result.user.id },
        data: { role: "ADMIN", acceptedTerms: true },
      });
    }

    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      const errCode = err.body ? (err.body.code as ErrorCode) : "UNKNOWN";

      switch (errCode) {
        case "USER_ALREADY_EXISTS":
          return { error: "Oops! Something went wrong. Please try again." };
        default:
          return { error: err.message };
      }
    }

    return { error: "Internal Server Error" };
  }
}
