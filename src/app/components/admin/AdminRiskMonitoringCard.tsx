"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { AlertTriangle, CreditCard, Store, FileWarning } from "lucide-react";
import type { AdminRiskMetrics } from "@/actions/admin-dashboard.action";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export function AdminRiskMonitoringCard({ risk }: { risk: AdminRiskMetrics }) {
  const hasRisk =
    risk.failedPayments > 0 ||
    risk.suspendedStores > 0 ||
    risk.failedInvoices > 0 ||
    risk.pendingStores > 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Card className={`${hasRisk ? "border-amber-500/50" : ""} hover:shadow-lg transition-shadow duration-300`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Risk monitoring
        </CardTitle>
        <CardDescription>
          Failed payments, suspended stores, failed invoices, and pending store approvals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div variants={itemVariants} className="flex items-center gap-3 rounded-lg border p-3">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed payments</p>
              <p className="text-xl font-bold">{risk.failedPayments}</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-3 rounded-lg border p-3">
            <Store className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Suspended stores</p>
              <p className="text-xl font-bold">{risk.suspendedStores}</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-3 rounded-lg border p-3">
            <FileWarning className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Failed invoices</p>
              <p className="text-xl font-bold">{risk.failedInvoices}</p>
            </div>
          </motion.div>
          <motion.div variants={itemVariants} className="flex items-center gap-3 rounded-lg border p-3">
            <Store className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending stores</p>
              <p className="text-xl font-bold">{risk.pendingStores}</p>
            </div>
          </motion.div>
        </div>

        {risk.recentFailedPaymentReasons.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">Recent failed payments</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risk.recentFailedPaymentReasons.map((row) => (
                    <TableRow key={row.orderId}>
                      <TableCell className="font-mono text-xs">{row.orderId.slice(0, 8)}…</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {row.reason || "—"}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/buyers-dashboard/orders/${row.orderId}`}
                          className="text-xs text-primary hover:underline"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </motion.div>
  );
}
