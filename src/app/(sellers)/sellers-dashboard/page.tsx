import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SellerTimelineCard } from "@/app/components/seller/SellerTimelineCard";
import { SellerRevenueKPICards } from "@/app/components/seller/SellerRevenueKPICards";
import { SoftCloseAnalyticsCard } from "@/app/components/analytics/SoftCloseAnalyticsCard";
import { getSellerSoftCloseAnalytics } from "@/actions/soft-close-analytics.action";
import { getSellerRevenueMetrics } from "@/actions/seller-revenue.action";
import { getSellerTimelineEvents } from "@/actions/seller-timeline.action";

import { getSellerDashboardMetrics } from "@/actions/seller-dashboard.action";
import { getSellerAlertMetrics } from "@/actions/seller-alert-metrics.action";
import { DashboardMetrics } from "@/app/components/seller/DashboardMetrics";
import { SellerAlertMetricsCard } from "@/app/components/seller/SellerAlertMetricsCard";


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

  const [metrics, alertMetrics, revenueMetrics, timelineEvents] = await Promise.all([
    getSellerDashboardMetrics(session.user.id),
    getSellerAlertMetrics(session.user.id),
    getSellerRevenueMetrics(session.user.id),
    getSellerTimelineEvents(session.user.id),
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

      {/* Attention & Alerts */}
      <SellerAlertMetricsCard metrics={alertMetrics} />

      {/* Revenue & Financial KPIs */}
      {revenueMetrics && <SellerRevenueKPICards m={revenueMetrics} />}

      {/* Timeline */}
      <SellerTimelineCard events={timelineEvents} />


    </div>
  );
}