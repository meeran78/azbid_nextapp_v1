"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Heart, Eye, Loader2 } from "lucide-react";
import type { BuyerFavouriteItem } from "@/actions/item-favourite.action";
import type { BuyerWatchedItem } from "@/actions/item-watch.action";

type Item = BuyerFavouriteItem | BuyerWatchedItem;

interface BuyerItemListCardProps {
  item: Item;
  type: "favourite" | "watch";
  onRemove: (itemId: string) => Promise<void>;
  isRemoving: boolean;
}

export function BuyerItemListCard({
  item,
  type,
  onRemove,
  isRemoving,
}: BuyerItemListCardProps) {
  const currentPrice = item.currentPrice ?? item.startPrice;
  const imageUrl = item.imageUrls?.[0];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/lots/${item.lotId}`} className="block">
        <div className="relative aspect-square bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 280px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <span
            className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs font-medium text-white ${
              item.lotStatus === "LIVE" ? "bg-green-600" : "bg-muted-foreground"
            }`}
          >
            {item.lotStatus}
          </span>
        </div>
      </Link>
      <CardContent className="p-4 space-y-3">
        <Link href={`/lots/${item.lotId}`} className="block">
          <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
            {item.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground">
          {item.storeName} · {item.lotTitle}
        </p>
        <p className="text-sm font-medium text-violet-600">
          Current: ${currentPrice.toFixed(2)}
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="flex-1"
          >
            <Link href={`/lots/${item.lotId}`}>View Lot</Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              onRemove(item.id);
            }}
            disabled={isRemoving}
            title={type === "favourite" ? "Remove from favourites" : "Remove from watchlist"}
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : type === "favourite" ? (
              <Heart className="h-4 w-4 fill-current" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
