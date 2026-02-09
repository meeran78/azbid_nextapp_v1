"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardCheck,
  RotateCcw,
  Clock,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import type { SellerAlertMetrics } from "@/actions/seller-alert-metrics.action";

interface SellerAlertMetricsCardProps {
  metrics: SellerAlertMetrics;
}

const items: {
  key: keyof SellerAlertMetrics;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    key: "lotsPendingAdminApproval",
    title: "Lots Pending Admin Approval",
    icon: ClipboardCheck,
    color: "text-amber-600",
    bgColor: "bg-amber-100 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  {
    key: "lotsSentBackResend",
    title: "Lots Sent Back (RESEND)",
    icon: RotateCcw,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-800",
  },
  {
    key: "lotsEndingSoon",
    title: "Lots Ending Soon",
    icon: Clock,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  {
    key: "buyerPaymentFailures",
    title: "Buyer Payment Failures",
    icon: CreditCard,
    color: "text-rose-600",
    bgColor: "bg-rose-100 dark:bg-rose-900/20",
    borderColor: "border-rose-200 dark:border-rose-800",
  },
  {
    key: "disputedTransactions",
    title: "Disputed Transactions",
    icon: AlertTriangle,
    color: "text-violet-600",
    bgColor: "bg-violet-100 dark:bg-violet-900/20",
    borderColor: "border-violet-200 dark:border-violet-800",
  },
];

export function SellerAlertMetricsCard({ metrics }: SellerAlertMetricsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attention & Alerts</CardTitle>
        <CardDescription>
          Lots awaiting review, resends, ending soon, and payment or dispute issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {items.map(({ key, title, icon: Icon, color, bgColor, borderColor }) => (
            <Card
              key={key}
              className={`border-2 ${borderColor} overflow-hidden relative group`}
            >
              <div
                className={`absolute inset-0 ${bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {title}
                </CardTitle>
                <div className={`${bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-2xl font-bold">{metrics[key]}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
