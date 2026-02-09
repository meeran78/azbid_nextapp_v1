import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminDashboardKPIs,
  getAdminRiskMetrics,
  getMostCompetitiveAuctions,
  getAdminTimeSeries,
} from "@/actions/admin-dashboard.action";
import { getAdminSoftCloseAnalytics } from "@/actions/soft-close-analytics.action";
import { SoftCloseAnalyticsCard } from "@/app/components/analytics/SoftCloseAnalyticsCard";
import { AdminDashboardKPICards } from "@/app/components/admin/AdminDashboardKPICards";
import { AdminRiskMonitoringCard } from "@/app/components/admin/AdminRiskMonitoringCard";
import { AdminCompetitiveAuctionsTable } from "@/app/components/admin/AdminCompetitiveAuctionsTable";
import { AdminDashboardCharts } from "@/app/components/admin/AdminDashboardCharts";

const defaultKPIs = {
  activeUsers: 0,
  totalStores: 0,
  activeStores: 0,
  activeAuctions: 0,
  closedAuctions: 0,
  activeLots: 0,
  closedLots: 0,
  totalGMV: 0,
};

const defaultRisk = {
  failedPayments: 0,
  suspendedStores: 0,
  failedInvoices: 0,
  pendingStores: 0,
  recentFailedPaymentReasons: [],
};

export default async function AdminDashboardPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) redirect("/sign-in");

  if (session.user.role !== "ADMIN") {
    return (
      <div className="container mx-auto max-w-screen-lg space-y-8 px-8 py-16">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="rounded-md bg-red-600 p-2 text-lg font-bold text-white">
            FORBIDDEN
          </p>
        </div>
      </div>
    );
  }

  const [kpis, risk, competitiveAuctions, timeSeries, softCloseAnalytics] =
    await Promise.all([
      getAdminDashboardKPIs(),
      getAdminRiskMetrics(),
      getMostCompetitiveAuctions(10),
      getAdminTimeSeries(30),
      getAdminSoftCloseAnalytics(),
    ]);

  return (
    <div className="container mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform overview, risk monitoring, and analytics
        </p>
      </div>

      <AdminDashboardKPICards kpis={kpis ?? defaultKPIs} />

      <AdminRiskMonitoringCard risk={risk ?? defaultRisk} />

      <AdminDashboardCharts data={timeSeries} />

      <AdminCompetitiveAuctionsTable auctions={competitiveAuctions} />

      <SoftCloseAnalyticsCard data={softCloseAnalytics} isAdmin />
    </div>
  );
}
