"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CreditCard, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import type { BuyerDashboardMetrics } from "@/actions/buyer-dashboard.action";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

export function BuyerPaymentCard({ m }: { m: BuyerDashboardMetrics }) {
  const totalPayments = m.paymentSuccessCount + m.paymentFailureCount;
  const successRate = totalPayments > 0
    ? Math.round((m.paymentSuccessCount / totalPayments) * 100)
    : 100;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover="hover"
    >
    <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment success and failures
        </CardTitle>
        <CardDescription>
          Track payment outcomes. Failed payments can be retried from your order.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-xl font-bold">{m.paymentSuccessCount}</span>
            <span className="text-muted-foreground">succeeded</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <span className="text-xl font-bold">{m.paymentFailureCount}</span>
            <span className="text-muted-foreground">failed</span>
          </div>
          {totalPayments > 0 && (
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
              {successRate}% success rate
            </span>
          )}
        </div>
        {m.recentFailedPayments.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Recent failed payments</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {m.recentFailedPayments.map((p) => (
                    <TableRow key={p.orderId}>
                      <TableCell className="font-mono text-xs">{p.orderId.slice(0, 8)}…</TableCell>
                      <TableCell>${p.amount.toFixed(2)}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {p.reason ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/buyers-dashboard/orders/${p.orderId}/pay`}>Pay again</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href="/buyers-dashboard/payment-methods">
            Payment methods
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
    </motion.div>
  );
}
