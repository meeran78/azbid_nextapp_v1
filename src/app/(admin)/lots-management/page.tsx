import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Eye } from "lucide-react";

export default async function AdminLotsPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const scheduledLots = await prisma.lot.findMany({
    where: { status: "SCHEDULED" },
    include: {
      store: {
        include: { owner: { select: { name: true, email: true } } },
      },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto p-6 max-w-10xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Lot Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve lots submitted by sellers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lots Pending Review ({scheduledLots.length})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Lots in SCHEDULED status awaiting admin approval
          </p>
        </CardHeader>
        <CardContent>
          {scheduledLots.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No lots pending review.
            </p>
          ) : (
            <div className="space-y-4">
              {scheduledLots.map((lot) => (
                <div
                  key={lot.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{lot.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Store: {lot.store.name} | Seller: {lot.store.owner.name} ({lot.store.owner.email})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {lot._count.items} item(s) • Closes: {new Date(lot.closesAt).toLocaleString()}
                    </p>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/lots-management/lots/${lot.id}`}>
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link href="/admin-dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}