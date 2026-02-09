"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Percent,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import type { BuyerDashboardMetrics } from "@/actions/buyer-dashboard.action";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

/**
 * Financial & payment metrics. Data from Invoices and Stripe Payment records (webhook-confirmed).
 */
export function BuyerFinancialCard({ m }: { m: BuyerDashboardMetrics }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover="hover"
    >
    <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-teal-200 dark:border-teal-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Financial & payment metrics
        </CardTitle>
        <CardDescription>
          Spend and card activity from invoices and Stripe payment intents (webhook-confirmed).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Spend */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Spend</h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <DollarSign className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total spend (lifetime)</p>
                <p className="text-xl font-bold">${fmt(m.totalSpent)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
                <p className="text-xl font-bold">${fmt(m.totalSpentLast30Days)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Last 90 days</p>
                <p className="text-xl font-bold">${fmt(m.totalSpentLast90Days)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Average winning bid</p>
                <p className="text-xl font-bold">${fmt(m.averageWinningBid)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buyer premium */}
        <div className="flex items-center gap-3 rounded-lg border p-3">
          <Percent className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Buyer premium paid</p>
            <p className="text-2xl font-bold">${fmt(m.buyerPremiumPaid)}</p>
          </div>
        </div>

        {/* Card transactions */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-muted-foreground">Card transactions</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Successful</p>
                <p className="text-xl font-bold">{m.successfulCardTransactions}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-xl font-bold">{m.failedCardTransactions}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <Clock className="h-8 w-8 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Pending payments</p>
                <p className="text-xl font-bold">{m.pendingPaymentsCount}</p>
              </div>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href="/buyers-dashboard/payment-methods">
            <CreditCard className="h-4 w-4" />
            Payment methods
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
    </motion.div>
  );
}
