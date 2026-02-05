import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBuyerActiveBids, getBuyerWonOrders, getBuyerLostBids } from "@/actions/buyer-bids.action";
import { BuyerBidsDashboardClient } from "@/app/components/buyer/BuyerBidsDashboardClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function BuyerBidsDashboardPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "BUYER") redirect("/");

  const [activeBids, wonOrders, lostBids] = await Promise.all([
    getBuyerActiveBids(),
    getBuyerWonOrders(),
    getBuyerLostBids(),
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          
          <h1 className="text-3xl font-bold">My Bids</h1>
          <p className="text-muted-foreground mt-1">
            Track active bids, won auctions, and lost bids. Complete payments for won items.
          </p>
        </div>
      </div>

      <BuyerBidsDashboardClient
        activeBids={activeBids}
        wonOrders={wonOrders}
        lostBids={lostBids}
      />
    </div>
  );
}
