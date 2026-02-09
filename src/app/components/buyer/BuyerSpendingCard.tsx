"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DollarSign, ArrowRight } from "lucide-react";
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

export function BuyerSpendingCard({ m }: { m: BuyerDashboardMetrics }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover="hover"
    >
    <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-emerald-200 dark:border-emerald-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Spending behavior
        </CardTitle>
        <CardDescription>
          Total amount paid on won items. View orders for details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">
          ${m.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <p className="text-sm text-muted-foreground">
          Across {m.winsCount} won item{m.winsCount !== 1 ? "s" : ""}.
        </p>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href="/buyers-dashboard/bids">
            View orders and bids
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
    </motion.div>
  );
}
