import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLotDetailClient } from "./AdminLotDetailClient";

export default async function AdminLotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const lot = await prisma.lot.findUnique({
    where: { id },
    include: {
      store: {
        include: { owner: { select: { name: true, email: true } } },
      },
      auction: { select: { title: true, status: true } },
      items: {
        include: { category: { select: { name: true } } },
      },
    },
  });

  if (!lot) notFound();

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-10xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate">{lot.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
            Store: {lot.store.name} | Seller: {lot.store.owner.name} ({lot.store.owner.email})
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto shrink-0">
          <Link href="/lots-management">Back to Lots</Link>
        </Button>
      </div>

      <AdminLotDetailClient
        lot={JSON.parse(JSON.stringify(lot))}
      />
    </div>
  );
}