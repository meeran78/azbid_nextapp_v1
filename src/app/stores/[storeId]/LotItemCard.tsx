"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Package, Gavel, ChevronDown, Heart, Eye, Share2, History } from "lucide-react";
import { getMinimumNextBid } from "@/lib/bid-increment";
import { BidConfirmCvcModal } from "@/app/components/stripe/BidConfirmCvcModal";
import { getCardVerifiedForBidSession, clearCardVerifiedForBidSession } from "@/lib/bid-session";
import { placeBidAction } from "@/actions/bid.action";
import { toggleItemFavouriteAction } from "@/actions/item-favourite.action";
import { toggleItemWatchAction } from "@/actions/item-watch.action";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { BiddingHistoryModal } from "@/app/components/seller/BiddingHistoryModal";
import type { PublicStoreLotItem } from "@/actions/public-store.action";

const NEW_ITEM_DAYS = 7;

function isNewItem(createdAt: Date): boolean {
  const age = Date.now() - new Date(createdAt).getTime();
  return age < NEW_ITEM_DAYS * 24 * 60 * 60 * 1000;
}

function ItemCarousel({
  item,
  lotStatus,
}: {
  item: PublicStoreLotItem;
  lotStatus: string;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
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
        {isNewItem(item.createdAt) && (
          <span className="absolute top-3 left-3 rounded-full bg-teal-500/90 px-2.5 py-0.5 text-xs font-medium text-white">
            {item.condition?.toUpperCase()}
          </span>
        )}
        {lotStatus === "LIVE" && (
          <span className="absolute top-3 right-3 rounded-full bg-purple-600 px-2.5 py-0.5 text-xs font-medium text-white">
            {lotStatus?.toUpperCase()}
          </span>
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
                {isNewItem(item.createdAt) && (
                  <span className="absolute top-3 left-3 rounded-full bg-teal-500/90 px-2.5 py-0.5 text-xs font-medium text-white">
                   {item.condition?.toUpperCase()}
                  </span>
                )}
                {lotStatus === "LIVE" && (
                  <span className="absolute top-3 right-3 rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-medium text-white">
                    {lotStatus?.toUpperCase()}
                  </span>
                )}
                {item.imageUrls.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {item.imageUrls.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => api?.scrollTo(idx)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          idx === selectedIndex ? "bg-white" : "bg-white/50"
                        }`}
                        aria-label={`Go to image ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

function ItemBidForm({
  item,
  lotId,
  lotStatus,
  onViewHistory,
}: {
  item: PublicStoreLotItem;
  lotId: string;
  lotStatus: string;
  onViewHistory: () => void;
}) {
  const isScheduled = (lotStatus ?? "").toUpperCase() === "SCHEDULED";
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const currentPrice = Number(item.currentPrice ?? item.startPrice ?? 0);
  const minBid = getMinimumNextBid(currentPrice);
  const [amount, setAmount] = useState(() => minBid.toFixed(2));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmItemId, setConfirmItemId] = useState<string | null>(null);
  const [confirmAmount, setConfirmAmount] = useState<number | null>(null);

  useEffect(() => {
    setAmount(minBid.toFixed(2));
  }, [minBid]);

  useEffect(() => {
    if (!session?.user) clearCardVerifiedForBidSession();
  }, [session?.user]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < minBid) {
      toast.error(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }
    if (getCardVerifiedForBidSession()) {
      setIsSubmitting(true);
      try {
        const result = await placeBidAction(item.id, numAmount);
        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success("Bid placed successfully!");
          setAmount(minBid.toFixed(2));
          router.refresh();
        }
      } catch {
        toast.error("Failed to place bid");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    setConfirmItemId(item.id);
    setConfirmAmount(numAmount);
    setConfirmOpen(true);
  };

  if (isPending) {
    return (
      <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-lg bg-muted/30 p-4">
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
      <div className="rounded-lg bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Only buyers can place bids. Switch to a buyer account to bid.
        </p>
      </div>
    );
  }

  if (isScheduled) {
    return (
      <div className="rounded-lg bg-muted/30 p-4 space-y-2">
        <p className="text-sm text-muted-foreground">
          Bidding opens when this lot goes live. You can favourite or add to watchlist now.
        </p>
        <div className="flex gap-2">
          <Button type="button" size="sm" disabled className="bg-zinc-800 text-white shrink-0" title="Bidding opens when the lot goes live">
            Place Bid
          </Button>
          <Button type="button" variant="outline" size="sm" disabled className="shrink-0" title="Bidding opens when the lot goes live">
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
    <form onSubmit={handleBid} className="space-y-3">
      <div className="flex gap-2 items-center">
        {/* <span className="text-sm text-muted-foreground shrink-0">
          $ Next bid: ${minBid.toFixed(2)}
        </span> */}
        <div className="relative flex-1 min-w-0">
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
            className="pl-7 h-9"
            aria-label="Bid amount"
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          size="sm"
          className="bg-zinc-800 hover:bg-zinc-900 text-white shrink-0"
        >
          Place Bid
        </Button>
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={onViewHistory}
        >
          <History className="h-4 w-4" />
         
        </Button>
      </div>
      {/* <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-violet-600 hover:bg-violet-700"
        >
          <Gavel className="h-4 w-4 mr-2" />
          Confirm Bid
        </Button>
       <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={onViewHistory}
        >
          <History className="h-4 w-4 mr-2" />
          View History
        </Button> 
      </div>*/}
    </form>
      <BidConfirmCvcModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        itemId={confirmItemId}
        amount={confirmAmount}
        onSuccess={() => {
          setAmount(minBid.toFixed(2));
          router.refresh();
        }}
      />
    </>
  );
}

interface LotItemCardProps {
  item: PublicStoreLotItem;
  lotId: string;
  lotStatus: string;
  storeId?: string;
  isFavourited?: boolean;
  isWatched?: boolean;
}

const CONDITION_BADGES = {
  "New": "bg-teal-500/90",
  "Like New": "bg-teal-500/90",
  "Used - Good": "bg-teal-500/90",
  "Used - Fair": "bg-teal-500/90",
  "Salvage": "bg-teal-500/90",
}


export function LotItemCard({
  item,
  lotId,
  lotStatus,
  storeId,
  isFavourited: initialFavourited = false,
  isWatched: initialWatched = false,
}: LotItemCardProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isFavourited, setIsFavourited] = useState(initialFavourited);
  const [isWatched, setIsWatched] = useState(initialWatched);
  const [isFavouriteLoading, setIsFavouriteLoading] = useState(false);
  const [isWatchLoading, setIsWatchLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsFavourited(initialFavourited);
    setIsWatched(initialWatched);
  }, [initialFavourited, initialWatched]);

  const handleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavouriteLoading(true);
    try {
      const result = await toggleItemFavouriteAction(item.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setIsFavourited(result.favourited);
        toast.success(
          result.favourited ? "Added to favourites" : "Removed from favourites"
        );
        router.refresh();
      }
    } catch {
      toast.error("Failed to update favourite");
    } finally {
      setIsFavouriteLoading(false);
    }
  };

  const handleWatch = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWatchLoading(true);
    try {
      const result = await toggleItemWatchAction(item.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        setIsWatched(result.watching);
        toast.success(
          result.watching ? "Added to watchlist" : "Removed from watchlist"
        );
        router.refresh();
      }
    } catch {
      toast.error("Failed to update watchlist");
    } finally {
      setIsWatchLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "";
    const shareUrl = storeId
      ? `${baseUrl}/stores/${storeId}#item-${item.id}`
      : `${baseUrl}/lots/${lotId}#item-${item.id}`;
    const shareTitle = `${item.title} | Az-Bid`;
    const shareText = `Check out "${item.title}" on Az-Bid`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success("Link copied to clipboard!");
          } catch {
            toast.error("Failed to share");
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <ItemCarousel item={item} lotStatus={lotStatus} />
      <div className="p-4 space-y-4">
        {item.category && (
          <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
            {item.category.name}
          </span>
        )}
        <Collapsible defaultOpen={false} className="group/desc">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <h3 className="font-bold text-lg truncate">{item.title}</h3>
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
              {/* {item.condition && (
                <p className="text-sm text-muted-foreground">
                  Condition: {item.condition}
                </p>
              )}
              {item.reservePrice != null && (
                <p className="text-sm text-muted-foreground">
                  Reserve: ${item.reservePrice.toFixed(2)}
                </p>
              )} */}
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div
          id={`item-${item.id}`}
          className="rounded-lg border bg-muted/30 p-4 space-y-3"
        >
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Starting Bid:{" "}
              <span className="font-bold text-violet-600">
                ${(item.currentPrice ?? item.startPrice).toFixed(2)}
              </span>
            </span>
            <span className="text-muted-foreground">
              Total Bids: <span className="font-medium">{item.bidCount}</span>
            </span>
          </div>
          <ItemBidForm
            item={item}
            lotId={lotId}
            lotStatus={lotStatus}
            onViewHistory={() => setHistoryOpen(true)}
          />
        </div>

        <BiddingHistoryModal
          itemId={item.id}
          itemTitle={item.title}
          open={historyOpen}
          onOpenChange={setHistoryOpen}
        />

        <div className="flex justify-center gap-8 pt-2">
          <button
            type="button"
            onClick={handleFavourite}
            disabled={isFavouriteLoading}
            className={`flex flex-col items-center gap-1 text-sm transition-colors ${
              isFavourited
                ? "text-red-500 hover:text-red-600"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Heart
              className={`h-5 w-5 ${isFavourited ? "fill-current" : ""}`}
            />
            <span>{isFavourited ? "Favourited" : "Favourite"}</span>
          </button>
          <button
            type="button"
            onClick={handleWatch}
            disabled={isWatchLoading}
            className={`flex flex-col items-center gap-1 text-sm transition-colors ${
              isWatched
                ? "text-violet-600 hover:text-violet-700"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className={`h-5 w-5 ${isWatched ? "fill-current" : ""}`} />
            <span>{isWatched ? "Watching" : "Watch"}</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
