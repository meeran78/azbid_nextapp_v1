"use client";

import { useState, useEffect } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Package, Gavel, ChevronDown, Heart, Eye, Share2 } from "lucide-react";
import { placeBidAction } from "@/actions/bid.action";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import type { PublicLot, PublicLotItem } from "@/actions/public-lot.action";

interface LotDetailClientProps {
  lot: PublicLot;
}

function ItemCarousel({
  item,
  lotStatus,
}: {
  item: PublicLotItem;
  lotStatus: string;
}) {
  const [api, setApi] = useState<{
    scrollNext: () => void;
    canScrollNext: () => boolean;
    scrollTo: (i: number) => void;
    selectedScrollSnap: () => number;
    on: (e: string, cb: () => void) => void;
    off: (e: string, cb: () => void) => void;
  } | undefined>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

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
      <div className="relative w-full aspect-square bg-muted rounded-t-xl flex items-center justify-center">
        <Package className="h-16 w-16 text-muted-foreground" />
        {lotStatus === "LIVE" && (
          <Badge className="absolute top-3 right-3 bg-green-600">LIVE</Badge>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel opts={{ loop: true }} setApi={setApi} className="w-full">
        <CarouselContent>
          {item.imageUrls.map((url, i) => (
            <CarouselItem key={i}>
              <div className="relative w-full aspect-square rounded-t-xl overflow-hidden bg-muted">
                <Image
                  src={url}
                  alt={`${item.title} - ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                {lotStatus === "LIVE" && (
                  <Badge className="absolute top-3 right-3 bg-green-600">
                    LIVE
                  </Badge>
                )}
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
      {item.imageUrls.length > 1 && (
        <div className="flex justify-center gap-1.5 py-2">
          {item.imageUrls.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => api?.scrollTo(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === selectedIndex ? "bg-primary" : "bg-muted-foreground/30"
              }`}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
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
      if ("error" in result) {
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
            placeholder={`Next bid: $${minBid.toFixed(2)}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7"
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
          <Gavel className="h-4 w-4 mr-2" />
          Place Bid
        </Button>
      </div>
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
        {lot.items.map((item, idx) => {
          const currentPrice = item.currentPrice ?? item.startPrice;
          const bidCount = item._count?.bids ?? 0;
          return (
            <div
              key={item.id}
              className="rounded-xl border bg-card shadow-sm overflow-hidden"
            >
              <div className="max-w-md mx-auto">
                <ItemCarousel item={item} lotStatus={lot.status} />
              </div>
              <div className="p-4 md:p-6 space-y-4">
                {item.category && (
                  <Badge variant="secondary" className="rounded-md">
                    {item.category.name}
                  </Badge>
                )}
                <Collapsible defaultOpen={false} className="group/desc">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 text-left"
                    >
                      <h3 className="font-semibold text-lg truncate">
                        {item.title}
                      </h3>
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/desc:rotate-180" />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-2 space-y-2">
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                      {item.condition && (
                        <p className="text-sm text-muted-foreground">
                          Condition: {item.condition}
                        </p>
                      )}
                      {item.reservePrice != null && (
                        <p className="text-sm text-muted-foreground">
                          Reserve: ${item.reservePrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Starting Bid:{" "}
                    <span className="font-semibold text-primary">
                      ${item.startPrice.toFixed(2)}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Total Bids: <span className="font-medium">{bidCount}</span>
                  </span>
                </div>
                <div className="pt-2">
                  <ItemBidForm item={item} lotId={lot.id} />
                </div>
                <div className="flex justify-center gap-6 pt-4 border-t">
                  <button
                    type="button"
                    className="flex flex-col items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    <span>Like</span>
                  </button>
                  <button
                    type="button"
                    className="flex flex-col items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                    <span>Watch</span>
                  </button>
                  <button
                    type="button"
                    className="flex flex-col items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
