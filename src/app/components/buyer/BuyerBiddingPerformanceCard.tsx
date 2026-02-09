"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Gavel, ArrowRight } from "lucide-react";
import type { BuyerDashboardMetrics } from "@/actions/buyer-dashboard.action";

export function BuyerBiddingPerformanceCard({ m }: { m: BuyerDashboardMetrics }) {
  const total = m.winsCount + m.lossesCount;
  const winRate = m.winRatePct;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Bidding performance
        </CardTitle>
        <CardDescription>
          Wins vs losses on closed lots. Win rate is based on items you bid on that had a winner.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-green-600">{m.winsCount}</span>
            <span className="text-muted-foreground">wins</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-muted-foreground">{m.lossesCount}</span>
            <span className="text-muted-foreground">losses</span>
          </div>
          {total > 0 && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                {winRate}% win rate
              </span>
            </div>
          )}
        </div>
        {total > 0 && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${winRate}%` }}
            />
          </div>
        )}
        {total === 0 && (
          <p className="text-sm text-muted-foreground">
            Place bids on lots to see your win/loss performance here.
          </p>
        )}
        <Button variant="outline" size="sm" asChild>
          <Link href="/buyers-dashboard/bids" className="gap-2">
            <Gavel className="h-4 w-4" />
            My Bids
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
