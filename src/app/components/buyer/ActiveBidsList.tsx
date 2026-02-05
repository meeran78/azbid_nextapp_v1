"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Gavel } from "lucide-react";
import { format } from "date-fns";
import type { BuyerActiveBid } from "@/actions/buyer-bids.action";

interface ActiveBidsListProps {
  bids: BuyerActiveBid[];
}

export function ActiveBidsList({ bids }: ActiveBidsListProps) {
  if (bids.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-12 text-center">
        <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-medium">No active bids</p>
        <p className="text-sm text-muted-foreground mt-1">
          Place bids on items in live lots to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bids.map((bid) => {
        const imageUrl = bid.itemImageUrls?.[0];
        return (
          <Card key={bid.bidId} className="overflow-hidden">
            <Link href={`/lots/${bid.lotId}`}>
              <div className="flex flex-col sm:flex-row gap-4 p-4">
                <div className="relative w-full sm:w-24 h-24 shrink-0 rounded-lg bg-muted overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={bid.itemTitle}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-semibold line-clamp-1">{bid.itemTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    {bid.lotTitle} · {bid.storeName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Badge variant={bid.isLeading ? "default" : "secondary"}>
                      {bid.isLeading ? "Leading" : "Outbid"}
                    </Badge>
                    <span className="text-sm">
                      Your bid: <strong>${bid.bidAmount.toFixed(2)}</strong>
                    </span>
                    {!bid.isLeading && bid.currentPrice != null && (
                      <span className="text-sm text-muted-foreground">
                        Current: ${bid.currentPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Closes: {format(new Date(bid.lotClosesAt), "PPp")}
                  </p>
                </div>
                <div className="shrink-0 flex items-center">
                  <Link href={`/lots/${bid.lotId}`} onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm font-medium text-primary hover:underline">
                      View lot →
                    </span>
                  </Link>
                </div>
              </div>
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
