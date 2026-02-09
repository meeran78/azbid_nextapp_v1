"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Gavel, Heart, Eye, Package, ArrowRight } from "lucide-react";
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

export function BuyerEngagementCard({ m }: { m: BuyerDashboardMetrics }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover="hover"
    >
    <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-violet-200 dark:border-violet-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Auction engagement
        </CardTitle>
        <CardDescription>
          Your activity across bids, watchlist, and favorites.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Gavel className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total bids placed</p>
              <p className="text-2xl font-bold">{m.totalBidsPlaced}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Package className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lots participated</p>
              <p className="text-2xl font-bold">{m.lotsParticipatedCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Eye className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Watching</p>
              <p className="text-2xl font-bold">{m.watchlistCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Heart className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Favorites</p>
              <p className="text-2xl font-bold">{m.favoritesCount}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/buyers-dashboard/bids">My Bids</Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/buyers-dashboard/favorites">Favorites</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
