import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBuyerDashboardMetrics } from "@/actions/buyer-dashboard.action";
import { BuyerDashboardOverview } from "@/app/components/buyer/BuyerDashboardOverview";
import { BuyerBiddingPerformanceCard } from "@/app/components/buyer/BuyerBiddingPerformanceCard";
import { BuyerActiveBiddingCard } from "@/app/components/buyer/BuyerActiveBiddingCard";
import { BuyerPaymentCard } from "@/app/components/buyer/BuyerPaymentCard";
import { BuyerSpendingCard } from "@/app/components/buyer/BuyerSpendingCard";
import { BuyerEngagementCard } from "@/app/components/buyer/BuyerEngagementCard";
import { BuyerFinancialCard } from "@/app/components/buyer/BuyerFinancialCard";
import { BuyerLiveExposureCard } from "@/app/components/buyer/BuyerLiveExposureCard";
import { Button } from "@/components/ui/button";
import { Gavel, Heart, CreditCard } from "lucide-react";

const defaultMetrics = {
  winsCount: 0,
  lossesCount: 0,
  outbidCount: 0,
  winRatePct: 0,
  activeBidsCount: 0,
  leadingBidsCount: 0,
  paymentSuccessCount: 0,
  paymentFailureCount: 0,
  totalSpent: 0,
  recentFailedPayments: [] as { orderId: string; amount: number; reason: string | null }[],
  totalSpentLast30Days: 0,
  totalSpentLast90Days: 0,
  averageWinningBid: 0,
  buyerPremiumPaid: 0,
  successfulCardTransactions: 0,
  failedCardTransactions: 0,
  pendingPaymentsCount: 0,
  totalBidsPlaced: 0,
  watchlistCount: 0,
  favoritesCount: 0,
  lotsParticipatedCount: 0,
};

export default async function BuyersDashboardPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "BUYER") redirect("/");

  const metrics = await getBuyerDashboardMetrics();
  const m = metrics ?? defaultMetrics;

  return (
    <div className="container mx-auto space-y-8 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buyer Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Bidding performance, active bids, payments, and engagement
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/buyers-dashboard/bids" className="gap-2">
              <Gavel className="h-4 w-4" />
              My Bids
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/buyers-dashboard/favorites" className="gap-2">
              <Heart className="h-4 w-4" />
              Favorites
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/buyers-dashboard/payment-methods" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payment methods
            </Link>
          </Button>
        </div>
      </div>

      <BuyerDashboardOverview m={m} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BuyerBiddingPerformanceCard m={m} />
        <BuyerActiveBiddingCard m={m} />
      </div>

      <BuyerLiveExposureCard m={m} />

      <BuyerFinancialCard m={m} />

      <div className="grid gap-6 lg:grid-cols-2">
        <BuyerPaymentCard m={m} />
        <BuyerSpendingCard m={m} />
      </div>

      <BuyerEngagementCard m={m} />
    </div>
  );
}
