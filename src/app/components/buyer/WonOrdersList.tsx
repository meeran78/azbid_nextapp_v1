"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Trophy, CreditCard } from "lucide-react";
import type { BuyerWonOrder } from "@/actions/buyer-bids.action";

interface WonOrdersListProps {
  orders: BuyerWonOrder[];
}

export function WonOrdersList({ orders }: WonOrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-12 text-center">
        <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-medium">No won auctions yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          When you win items, they will appear here with payment options.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const firstImage = order.items[0]?.itemImageUrls?.[0];
        const isPaid =
          order.orderStatus === "PAID" || order.invoiceStatus === "PAID";

        return (
          <Card key={order.orderId} className="overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-24 h-24 shrink-0 rounded-lg bg-muted overflow-hidden">
                  {firstImage ? (
                    <Image
                      src={firstImage}
                      alt={order.items[0]?.itemTitle ?? "Item"}
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
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{order.lotTitle}</h3>
                    <Badge variant={isPaid ? "default" : "secondary"}>
                      {isPaid ? "Paid" : "Payment pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} item(s) won
                  </p>
                  <ul className="text-sm list-disc list-inside">
                    {order.items.slice(0, 3).map((item) => (
                      <li key={item.itemId} className="truncate">
                        {item.itemTitle} - ${item.winningBidAmount.toFixed(2)}
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="text-muted-foreground">
                        +{order.items.length - 3} more
                      </li>
                    )}
                  </ul>
                  <p className="text-sm font-semibold pt-1">
                    Order total: $
                    {(order.orderTotal ?? order.invoiceTotal ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button asChild variant="outline" size="sm">
                    <Link href={"/lots/" + order.lotId}>View lot</Link>
                  </Button>
                  {!isPaid && order.invoiceId && (
                    <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700">
                      <Link
                        href={
                          "/buyers-dashboard/orders/" + order.orderId + "/pay"
                        }
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay now
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
