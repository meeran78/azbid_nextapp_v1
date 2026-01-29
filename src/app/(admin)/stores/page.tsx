import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { approveStoreAction, rejectStoreAction } from "@/actions/approve-store.action";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Building2 } from "lucide-react";

export default async function AdminStoresPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const [pendingStores, allStores] = await Promise.all([
    prisma.store.findMany({
      where: { status: "PENDING" },
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.store.findMany({
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Store Approvals</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve stores before sellers can add lots
        </p>
      </div>

      {pendingStores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Pending Approval ({pendingStores.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              These stores are waiting for your approval
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{store.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Owner: {store.owner.name} ({store.owner.email})
                    </p>
                    {store.description && (
                      <p className="text-sm mt-1 line-clamp-2">{store.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <form action={approveStoreAction.bind(null, store.id)}>
                      <Button type="submit" size="sm" variant="default">
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </form>
                    <form action={rejectStoreAction.bind(null, store.id)}>
                      <Button type="submit" size="sm" variant="destructive">
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Stores</CardTitle>
          <p className="text-sm text-muted-foreground">
            {allStores.length} total stores
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Owner</th>
                  <th className="text-left py-2 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {allStores.map((store) => (
                  <tr key={store.id} className="border-b">
                    <td className="py-2 px-4">{store.name}</td>
                    <td className="py-2 px-4">
                      {store.owner.name} ({store.owner.email})
                    </td>
                    <td className="py-2 px-4">
                      <Badge
                        variant={
                          store.status === "ACTIVE"
                            ? "default"
                            : store.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {store.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Button asChild variant="outline">
        <Link href="/admin-dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}