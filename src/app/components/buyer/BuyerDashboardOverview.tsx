"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gavel, Target, Trophy, XCircle, Percent, TrendingDown } from "lucide-react";
import type { BuyerDashboardMetrics } from "@/actions/buyer-dashboard.action";

/**
 * KPI cards: Total Bids Placed, Active Bids, Auctions Won, Auctions Lost, Win Rate (%), Outbid Count.
 * Won = highest bidder on CLOSED auction. Lost = participated but not winner.
 */
export function BuyerDashboardOverview({ m }: { m: BuyerDashboardMetrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Bids Placed
          </CardTitle>
          <Gavel className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{m.totalBidsPlaced}</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Bids (Live Auctions)
          </CardTitle>
          <Target className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{m.activeBidsCount}</div>
          <p className="text-xs text-muted-foreground">
            {m.leadingBidsCount} leading
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Auctions Won
          </CardTitle>
          <Trophy className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{m.winsCount}</div>
          <p className="text-xs text-muted-foreground">
            Highest bidder on closed lots
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Auctions Lost
          </CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{m.lossesCount}</div>
          <p className="text-xs text-muted-foreground">
            Participated but not winner
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Win Rate (%)
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{m.winRatePct}%</div>
          <p className="text-xs text-muted-foreground">
            Wins ÷ (wins + losses)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Outbid Count
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{m.outbidCount}</div>
          <p className="text-xs text-muted-foreground">
            Lost to a higher bid
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
