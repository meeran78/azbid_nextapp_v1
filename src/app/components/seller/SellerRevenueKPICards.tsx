"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  DollarSign,
  Calendar,
  Banknote,
  CheckCircle,
  TrendingUp,
  Percent,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SellerRevenueMetrics } from "@/actions/seller-revenue.action";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Revenue & financial KPIs for sellers. Data from Invoices and Stripe webhook-confirmed payments.
 */
export function SellerRevenueKPICards({ m }: { m: SellerRevenueMetrics }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue & financial KPIs
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          From invoices and Stripe payouts. Payout = sale amount minus platform commission.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <DollarSign className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total revenue (lifetime)</p>
              <p className="text-xl font-bold">${fmt(m.totalRevenueLifetime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Revenue (last 30 days)</p>
              <p className="text-xl font-bold">${fmt(m.revenueLast30Days)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending payout amount</p>
              <p className="text-xl font-bold">${fmt(m.pendingPayoutAmount)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Paid payout amount</p>
              <p className="text-xl font-bold">${fmt(m.paidPayoutAmount)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Average sale price</p>
              <p className="text-xl font-bold">${fmt(m.averageSalePrice)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Percent className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Platform commission paid</p>
              <p className="text-xl font-bold">${fmt(m.platformCommissionPaid)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="flex flex-1 items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed / pending buyer payments</p>
                <p className="text-lg font-bold">
                  <span className="text-destructive">{m.failedBuyerPaymentsCount}</span>
                  <span className="text-muted-foreground"> failed</span>
                  <span className="mx-1">·</span>
                  <span className="text-amber-600">{m.pendingBuyerPaymentsCount}</span>
                  <span className="text-muted-foreground"> pending</span>
                </p>
              </div>
              <XCircle className="h-6 w-6 shrink-0 text-destructive" />
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href="/my-auctions/payouts">
            <Banknote className="h-4 w-4" />
            Payouts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
