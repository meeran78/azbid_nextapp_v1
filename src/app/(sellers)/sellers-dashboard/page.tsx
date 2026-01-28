import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  getSellerDashboardMetrics,

} from "@/actions/seller-dashboard.action";
import { DashboardMetrics } from "@/app/components/seller/DashboardMetrics";


export default async function SellersDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; storeId?: string; auctionId?: string }>;
}) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    redirect("/sign-in");
  }

  if (session.user.role !== "SELLER") {
    redirect("/");
  }

  const [metrics] = await Promise.all([
    getSellerDashboardMetrics(session.user.id),

  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your stores, auctions, and lots
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <DashboardMetrics metrics={metrics} />


    </div>
  );
}