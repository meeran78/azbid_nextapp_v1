"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Package } from "lucide-react";
import { LotCountdown } from "./LotCountdown";
import { LotItemCard } from "./LotItemCard";
import type { PublicStoreLot } from "@/actions/public-store.action";

const REMOVAL_DISCLAIMER =
  "Removal Date Firm, No Exceptions. Sign up for pick-up time on paid invoice. Any late removal will incur $50 storage fee.";

interface StoreLotCardProps {
  lot: PublicStoreLot;
  storeId: string;
  storeLogoUrl: string | null;
  favouriteItemIds: string[];
  watchedItemIds: string[];
}

export function StoreLotCard({
  lot,
  storeId,
  storeLogoUrl,
  favouriteItemIds,
  watchedItemIds,
}: StoreLotCardProps) {
  const lotHref = `/lots/${lot.id}`;
  const lotNumber =
    lot.lotDisplayId ?? lot.auctionDisplayId ?? lot.id.slice(0, 8);
  const statusLower = lot.status.toLowerCase();
  const items = lot.items ?? [];

  return (
    <div className="rounded-lg border bg-card overflow-hidden transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5">
      <Link
        href={lotHref}
        className="block p-6 space-y-6 hover:bg-muted/30 transition-colors"
      >
        {/* Lot Header: Seller image + title + status + description */}
        <div className="flex gap-4">
          {/* <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
          {storeLogoUrl ? (
            <Image
              src={storeLogoUrl}
              alt="Store"
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div> */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-lg text-foreground">{lot.title}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${statusLower === "live"
                    ? "bg-violet-600"
                    : "bg-muted-foreground/80"
                  }`}
              >
                {statusLower}
              </span>
            </div>
            {lot.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {lot.description}
              </p>
            )}
          </div>
        </div>

        {/* Lot Details: Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground font-semibold">Lot Number: </span>
              <span className="font-medium">{lotNumber}</span>
            </div>
            {lot.buyersPremium && (
              <div>
                <span className="text-muted-foreground font-semibold">
                  {lot.buyersPremium} buyer&apos;s premium is added to every
                  purchase
                </span>
              </div>
            )}
           <div>
              <span className="text-muted-foreground font-semibold">Items in Lot: </span>
              <span className="font-medium text-violet-600">{lot.itemCount} items</span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1.5 font-semibold">
                Time to Lot Closing:
              </span>
              <LotCountdown closesAt={lot.closesAt} />
            </div>

          </div>

          {/* Right column */}
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground font-semibold">Start Closing Date: </span>
              <span className="font-medium">
                {format(new Date(lot.closesAt), "EEEE, MMMM d, yyyy h:mm a")}
              </span>
            </div>
            {lot.inspectionAt && (
              <div>
                <span className="text-muted-foreground font-semibold">Inspection Date: </span>
                <span className="font-medium">
                  {format(new Date(lot.inspectionAt), "EEEE, MMMM d, yyyy h:mm a")}
                </span>
              </div>
            )}
            {lot.removalStartAt && (
              <div>
                <span className="text-muted-foreground font-semibold">Removal Date: </span>
                <span className="font-medium">
                  {format(new Date(lot.removalStartAt), "EEEE, MMMM d, yyyy h:mm a")}
                </span>
                <p className="text-muted-foreground text-xs mt-1">
                  {REMOVAL_DISCLAIMER}
                </p>
              </div>
            )}
           
          </div>
        </div>

        {/* Lot Images */}
        {/* <div>
        <span className="text-sm font-medium text-muted-foreground block mb-2">
          Lot Images:
        </span>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {lot.imageUrls.length > 0 ? (
            lot.imageUrls.slice(0, 10).map((url, i) => (
              <div
                key={`${lot.id}-img-${i}`}
                className="relative w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0"
              >
                <Image
                  src={url}
                  alt={`Lot image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ))
          ) : (
            <div className="flex gap-2">
              <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </div> */}
      </Link>

      {items.length > 0 && (
        <div className="px-6 pb-6 pt-2 border-t">
          <h4 className="font-semibold text-base mb-4">
            Auction Items ({items.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <LotItemCard
                key={item.id}
                item={item}
                lotId={lot.id}
                lotStatus={lot.status}
                storeId={storeId}
                isFavourited={favouriteItemIds.includes(item.id)}
                isWatched={watchedItemIds.includes(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
