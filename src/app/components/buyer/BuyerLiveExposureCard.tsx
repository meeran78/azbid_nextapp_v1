"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Target, DollarSign, Clock, ArrowRight } from "lucide-react";
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
 * Live auction exposure: active lots participating, highest current exposure (max bid × count), ending soon.
 */
export function BuyerLiveExposureCard({ m }: { m: BuyerDashboardMetrics }) {
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
          <Target className="h-5 w-5 text-green-500" />
          Live auction exposure
        </CardTitle>
        <CardDescription>
          Your current participation in live lots and exposure (max bid × active bid count).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Target className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total active auctions participating
              </p>
              <p className="text-2xl font-bold">{m.totalActiveLotsParticipating}</p>
              <p className="text-xs text-muted-foreground">LIVE lots you’re bidding on</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <DollarSign className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Highest current exposure
              </p>
              <p className="text-2xl font-bold">${fmt(m.highestCurrentExposure)}</p>
              <p className="text-xs text-muted-foreground">Max bid × active bid count</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ending soon (&lt; 10 min)
              </p>
              <p className="text-2xl font-bold">{m.endingSoonCount}</p>
              <p className="text-xs text-muted-foreground">Lots closing in under 10 minutes</p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link href="/buyers-dashboard/bids">
            View my bids
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
    </motion.div>
  );
}
