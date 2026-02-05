"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Gavel, Trophy, TrendingDown, RefreshCw, Loader2 } from "lucide-react";
import { ActiveBidsList } from "./ActiveBidsList";
import { WonOrdersList } from "./WonOrdersList";
import { LostBidsList } from "./LostBidsList";
import type { BuyerActiveBid } from "@/actions/buyer-bids.action";
import type { BuyerWonOrder } from "@/actions/buyer-bids.action";
import type { BuyerLostBid } from "@/actions/buyer-bids.action";

const REFRESH_INTERVAL_MS = 30_000;

interface BuyerBidsDashboardClientProps {
  activeBids: BuyerActiveBid[];
  wonOrders: BuyerWonOrder[];
  lostBids: BuyerLostBid[];
}

export function BuyerBidsDashboardClient({
  activeBids: initialActiveBids,
  wonOrders: initialWonOrders,
  lostBids: initialLostBids,
}: BuyerBidsDashboardClientProps) {
  const router = useRouter();
  const [activeBids, setActiveBids] = useState(initialActiveBids);
  const [wonOrders, setWonOrders] = useState(initialWonOrders);
  const [lostBids, setLostBids] = useState(initialLostBids);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    setActiveBids(initialActiveBids);
    setWonOrders(initialWonOrders);
    setLostBids(initialLostBids);
  }, [initialActiveBids, initialWonOrders, initialLostBids]);

  useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Bid status updates automatically every 30 seconds. You can also refresh manually.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Gavel className="h-4 w-4" />
            Active ({activeBids.length})
          </TabsTrigger>
          <TabsTrigger value="won" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Won ({wonOrders.length})
          </TabsTrigger>
          <TabsTrigger value="lost" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            Lost ({lostBids.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <ActiveBidsList bids={activeBids} />
        </TabsContent>
        <TabsContent value="won" className="space-y-4">
          <WonOrdersList orders={wonOrders} />
        </TabsContent>
        <TabsContent value="lost" className="space-y-4">
          <LostBidsList bids={lostBids} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
