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

  const acceptedTerms = String(formData.get("acceptedTerms")).toLowerCase() === "true";
  if (!acceptedTerms) return { error: "You must accept the terms and conditions" };

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
   if (result.user?.id) {
  const updateData: Record<string, unknown> = { 
    role,
    acceptedTerms: true,
  };

      if (role === "SELLER") {
        const companyName = String(formData.get("companyName") ?? "").trim() || null;
        const companyDescription = String(formData.get("companyDescription") ?? "").trim() || null;
        const companyLocationDescription = String(formData.get("companyLocationDescription") ?? "").trim() || null;
        const addressLine1 = String(formData.get("addressLine1") ?? "").trim() || null;
        const addressLine2 = String(formData.get("addressLine2") ?? "").trim() || null;
        const city = String(formData.get("city") ?? "").trim() || null;
        const state = String(formData.get("state") ?? "").trim() || null;
        const zipcode = String(formData.get("zipcode") ?? "").trim() || null;
        const country = String(formData.get("country") ?? "").trim() || null;
        const businessPhone = String(formData.get("businessPhone") ?? "").trim() || null;
        const displayLocation = city && state ? `${city}, ${state}` : null;

        Object.assign(updateData, {
          companyName,
          companyDescription,
          companyLocationDescription,
          addressLine1,
          addressLine2,
          city,
          state,
          zipcode,
          country,
          businessPhone,
          displayLocation,
        });
      }
      await prisma.user.update({
        where: { id: result.user.id },
        data: updateData,
      });
      // //After user creation, update the role using Prisma directly
      // if (result.user?.id) {
      //   await prisma.user.update({
      //     where: { id: result.user.id },
      //     data: { updateData },
      //   });
      // }

      
    }return { error: null };
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