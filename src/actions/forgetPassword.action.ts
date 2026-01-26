"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

export async function forgetPasswordAction(email: string, redirectTo: string) {
  try {
    const headersList = await headers();
    
    await auth.api.forgetPassword({
      headers: headersList,
      body: {
        email,
        redirectTo,
      },
    });

    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message };
    }
    return { error: "Failed to send reset email" };
  }
}