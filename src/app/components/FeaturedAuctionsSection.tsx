"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Gem, CalendarDays, Pause, Play, Package } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/app/components/ui/carousel";
import type { FeaturedAuction } from "@/actions/featured-auctions.action";
import { AUCTION_TIME_ZONE } from "@/lib/timezone";

const AUTOPLAY_INTERVAL_MS = 5000;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZoneName: "short",
  timeZone: AUCTION_TIME_ZONE,
});

function AuctionCard({ auction }: { auction: FeaturedAuction }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-black shadow-lg h-full flex flex-col">
      <Link
        href={`/stores/${auction.storeId}`}
        className="relative block h-40 md:h-48 bg-zinc-800"
      >
        {auction.storeLogoUrl ? (
          <Image
            src={auction.storeLogoUrl}
            alt={auction.storeName}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 440px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-zinc-500" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 items-center justify-between gap-3 p-5">
        <div className="min-w-0 space-y-2">
          <h3 className="truncate text-lg md:text-xl font-bold text-white">
            {auction.title}
          </h3>
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-zinc-300">
            <Gem className="h-3.5 w-3.5 shrink-0 text-violet-300" />
            <span className="truncate uppercase tracking-wide">{auction.storeName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs md:text-sm text-zinc-300">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-violet-300" />
            <span>{dateFormatter.format(new Date(auction.closesAt))}</span>
          </div>
        </div>
        <Link
          href={`/stores/${auction.storeId}`}
          className="shrink-0 whitespace-nowrap rounded-lg border border-white/40 px-4 py-2 text-xs md:text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          EXPLORE &gt;
        </Link>
      </div>
    </div>
  );
}

export function FeaturedAuctionsSection({ auctions }: { auctions: FeaturedAuction[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
    onSelect(api);
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    if (!api || !isPlaying) return;
    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [api, isPlaying]);

  if (auctions.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
         <div className="mb-8 flex items-end justify-between">
         <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Ongoing <span className="text-gradient-primary italic">Auctions</span></h2>
          {/* <Link
            href="/live-auctions"
            className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >
            View All
            <ChevronRight className="h-4 w-4" />
          </Link> */}
        
      {/* <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
        Browse lots by name, location, item, or store. Filter by status and find live or scheduled auctions.
      </p> */}
        </div>

        <div className="relative">
          <Carousel setApi={setApi} opts={{ align: "start", loop: false }}>
            <CarouselContent className="-ml-4">
              {auctions.map((auction) => (
                <CarouselItem
                  key={auction.id}
                  className="pl-4 basis-full md:basis-1/2"
                >
                  <AuctionCard auction={auction} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {scrollSnaps.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                disabled={!api?.canScrollPrev()}
                className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background p-2 shadow-md transition-opacity disabled:opacity-40 hover:bg-muted"
                aria-label="Previous auctions"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                disabled={!api?.canScrollNext()}
                className="absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 rounded-full border bg-background p-2 shadow-md transition-opacity disabled:opacity-40 hover:bg-muted"
                aria-label="Next auctions"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {scrollSnaps.length > 1 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => api?.scrollTo(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === selectedIndex
                      ? "w-6 bg-violet-600"
                      : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white hover:bg-violet-700"
              aria-label={isPlaying ? "Pause autoplay" : "Resume autoplay"}
            >
              {isPlaying ? (
                <Pause className="h-3 w-3 fill-current" />
              ) : (
                <Play className="h-3 w-3 fill-current" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
