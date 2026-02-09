"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Gavel, ArrowRight, TrendingUp } from "lucide-react";
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

export function BuyerActiveBiddingCard({ m }: { m: BuyerDashboardMetrics }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover="hover"
    >
    <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5 text-green-500" />
          Active bidding exposure
        </CardTitle>
        <CardDescription>
          Lots you’re currently bidding on. You’re leading on {m.leadingBidsCount} of {m.activeBidsCount} active bids.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{m.activeBidsCount}</span>
            <span className="text-muted-foreground">active bids</span>
          </div>
          {m.activeBidsCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>{m.leadingBidsCount} leading</span>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" className="mt-4 gap-2" asChild>
          <Link href="/buyers-dashboard/bids">
            View all bids
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
    </motion.div>
  );
}
