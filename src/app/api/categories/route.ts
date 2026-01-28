import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get session from request headers
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Allow unauthenticated access to active categories (for public use)
    // Or require authentication for sellers/admins
    const where: any = {
      status: "ACTIVE", // Only return active categories
    };

    // If authenticated and admin, allow seeing all categories
    if (session && session.user.role === "ADMIN") {
      delete where.status; // Remove status filter for admins
    }

    const categories = await prisma.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        status: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}