import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LotsManagementClient } from "./lots-management-client";

const PAGE_SIZE = 10;

export default async function AdminLotsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const statusFilter = params.status?.trim() || "";
  const searchQuery = params.search?.trim() || "";
  const page = Math.max(1, parseInt(params.page || "1", 10));

  const where: Parameters<typeof prisma.lot.findMany>[0]["where"] = {};

  // Exclude LIVE, SOLD, UNSOLD from lot management (review/approve workflow only)
  const allowedStatuses = ["DRAFT", "SCHEDULED", "RESEND"] as const;
  if (statusFilter && allowedStatuses.includes(statusFilter as (typeof allowedStatuses)[number])) {
    where.status = statusFilter;
  } else {
    where.status = { notIn: ["LIVE", "SOLD", "UNSOLD"] };
  }

  if (searchQuery) {
    where.OR = [
      { lotDisplayId: { contains: searchQuery, mode: "insensitive" } },
      { id: { contains: searchQuery, mode: "insensitive" } },
      { store: { owner: { name: { contains: searchQuery, mode: "insensitive" } } } },
      { store: { owner: { email: { contains: searchQuery, mode: "insensitive" } } } },
    ];
  }

  const [lots, totalCount] = await Promise.all([
    prisma.lot.findMany({
      where,
      include: {
        store: {
          include: { owner: { select: { name: true, email: true } } },
        },
        _count: { select: { items: true } },
      },
      orderBy: { status: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lot.count({ where }),
  ]);

  return (
    <div className="container mx-auto p-6 max-w-10xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Lot Management</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve lots submitted by sellers
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/admin-dashboard">Back to Dashboard</Link>
        </Button>
      </div>

      <LotsManagementClient
        lots={lots}
        totalCount={totalCount}
        page={page}
        statusFilter={statusFilter}
        searchQuery={searchQuery}
      />
    </div>
  );
}