"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Gavel } from "lucide-react";
import { placeBidAction } from "@/actions/bid.action";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import type { PublicLot, PublicLotItem } from "@/actions/public-lot.action";

interface LotDetailClientProps {
  lot: PublicLot;
}

function ItemCarousel({ item }: { item: PublicLotItem }) {
  const [api, setApi] = useState<{ scrollNext: () => void; canScrollNext: () => boolean; scrollTo: (i: number) => void } | undefined>();

  useEffect(() => {
    if (!api) return;
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [api]);

  if (!item.imageUrls || item.imageUrls.length === 0) {
    return (
      <div className="relative w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
        <Package className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Carousel
      opts={{ loop: true }}
      setApi={setApi}
      className="w-full"
    >
      <CarouselContent>
        {item.imageUrls.map((url, i) => (
          <CarouselItem key={i}>
            <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
              <Image
                src={url}
                alt={`${item.title} - ${i + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {item.imageUrls.length > 1 && (
        <>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </>
      )}
    </Carousel>
  );
}

function ItemBidForm({
  item,
  lotId,
}: {
  item: PublicLotItem;
  lotId: string;
}) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPrice = item.currentPrice ?? item.startPrice;
  const minBid = currentPrice + 1;

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < minBid) {
      toast.error(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await placeBidAction(item.id, numAmount);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Bid placed successfully!");
        setAmount("");
        router.refresh();
      }
    } catch {
      toast.error("Failed to place bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-4 rounded-lg border bg-muted/30">
        <p className="text-sm text-muted-foreground mb-3">
          Sign in to place a bid on this item.
        </p>
        <Button asChild size="sm">
          <Link href={`/sign-in?callbackURL=/lots/${lotId}`}>Sign In to Bid</Link>
        </Button>
      </div>
    );
  }

  if (session.user.role !== "BUYER") {
    return (
      <div className="p-4 rounded-lg border bg-muted/30">
        <p className="text-sm text-muted-foreground">
          Only buyers can place bids. Switch to a buyer account to bid.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleBid} className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
            $
          </span>
          <Input
            type="number"
            step="0.01"
            min={minBid}
            placeholder={minBid.toFixed(2)}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7"
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          <Gavel className="h-4 w-4 mr-2" />
          Place Bid
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Current: ${currentPrice.toFixed(2)} · Min bid: ${minBid.toFixed(2)}
      </p>
    </form>
  );
}

export function LotDetailClient({ lot }: LotDetailClientProps) {
  if (lot.items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No items in this lot yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Items ({lot.items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {lot.items.map((item, idx) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 md:p-6 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ItemCarousel item={item} />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    Item {idx + 1}: {item.title}
                  </h3>
                  {item.category && (
                    <Badge variant="outline" className="mt-2">
                      {item.category.name}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm">
                  {item.condition && (
                    <span>Condition: {item.condition}</span>
                  )}
                  <span>Start: ${item.startPrice.toFixed(2)}</span>
                  {item.reservePrice != null && (
                    <span>Reserve: ${item.reservePrice.toFixed(2)}</span>
                  )}
                  {item.retailPrice != null && (
                    <span>Retail: ${item.retailPrice.toFixed(2)}</span>
                  )}
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Place a bid</p>
                  <ItemBidForm item={item} lotId={lot.id} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
