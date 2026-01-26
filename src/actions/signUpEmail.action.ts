"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { prisma } from "@/lib/prisma";

export async function signUpEmailAction(formData: FormData) {
  const name = String(formData.get("name"));
  if (!name) return { error: "Please enter your name" };

  const email = String(formData.get("email"));
  if (!email) return { error: "Please enter your email" };

  const password = String(formData.get("password"));
  if (!password) return { error: "Please enter your password" };

  const selRole = String(formData.get("role"));
  if (!selRole) return { error: "Please select an account type" };

  const role = selRole === "ADMIN" ? "ADMIN" : selRole === "SELLER" ? "SELLER" : "BUYER";
  
  try {
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        // Don't include role directly - it will be set in the database hook
        //selRole: role as any, // Type assertion to bypass validation, but hook will handle it
      },
    });

    //After user creation, update the role using Prisma directly
    if (result.user?.id) {
      await prisma.user.update({
        where: { id: result.user.id },
        data: { role },
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