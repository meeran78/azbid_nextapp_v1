import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SellerTimelineCard } from "@/app/components/seller/SellerTimelineCard";
import { SellerRevenueKPICards } from "@/app/components/seller/SellerRevenueKPICards";
import { SoftCloseAnalyticsCard } from "@/app/components/analytics/SoftCloseAnalyticsCard";
import { getSellerSoftCloseAnalytics } from "@/actions/soft-close-analytics.action";
import { getSellerRevenueMetrics } from "@/actions/seller-revenue.action";
import { getSellerTimelineEvents } from "@/actions/seller-timeline.action";

import { getSellerDashboardMetrics, getSellerFlowStatus } from "@/actions/seller-dashboard.action";
import { getSellerAlertMetrics } from "@/actions/seller-alert-metrics.action";
import { DashboardMetrics } from "@/app/components/seller/DashboardMetrics";
import { SellerAlertMetricsCard } from "@/app/components/seller/SellerAlertMetricsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Building2, Gavel, Sparkles } from "lucide-react";


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

  const [metrics, alertMetrics, revenueMetrics, timelineEvents, flowStatus] = await Promise.all([
    getSellerDashboardMetrics(session.user.id),
    getSellerAlertMetrics(session.user.id),
    getSellerRevenueMetrics(session.user.id),
    getSellerTimelineEvents(session.user.id),
    getSellerFlowStatus(session.user.id),
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

      <Card className="border-violet-200 bg-violet-50/70 dark:border-violet-900/60 dark:bg-violet-950/20">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Seller workflow checklist
              </CardTitle>
              <CardDescription>
                Follow these steps to move from setup to live bidding quickly.
              </CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href={flowStatus.nextStepHref}>
                {flowStatus.nextStep}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border bg-background/70 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4" />
              Stores
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {flowStatus.activeStoresCount} active, {flowStatus.pendingStoresCount} pending
            </p>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Gavel className="h-4 w-4" />
              Lots and auctions
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {flowStatus.lotsCount} lots, {flowStatus.auctionsCount} auctions
            </p>
          </div>
          <div className="rounded-lg border bg-background/70 p-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Next action
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {flowStatus.nextStep}
            </p>
          </div>
        </CardContent>
      </Card>

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