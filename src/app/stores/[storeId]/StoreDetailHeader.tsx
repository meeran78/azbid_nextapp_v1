"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Package, Star, Heart, Phone, MapPin, Boxes } from "lucide-react";
import { toggleStoreFavouriteAction } from "@/actions/store-favourite.action";
import { toast } from "sonner";
import type { PublicStore } from "@/actions/public-store.action";

function formatLocation(owner: {
  displayLocation: string | null;
  city: string | null;
  state: string | null;
}): string {
  if (owner.displayLocation) return owner.displayLocation;
  const parts = [owner.city, owner.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
}

function formatPhone(phone: string | null): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

interface StoreDetailHeaderProps {
  store: PublicStore;
  isFavourited: boolean;
}

export function StoreDetailHeader({
  store,
  isFavourited: initialFavourited,
}: StoreDetailHeaderProps) {
  const router = useRouter();
  const [isFavourited, setIsFavourited] = useState(initialFavourited);
  const [isToggling, setIsToggling] = useState(false);

  const handleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsToggling(true);
    try {
      const result = await toggleStoreFavouriteAction(store.id);
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
      setIsToggling(false);
    }
  };

  const rating = store.averageRating ?? 0;
  const responseRate = store.responseRate ?? 0;

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      {/* Row 1: Logo + Store name + Add to Favorites */}
      <div className="flex flex-row items-center gap-4">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted shrink-0">
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
           <h1 className="font-bold text-xl sm:text-2xl text-foreground truncate flex-1 min-w-0">
          {store.name}
        </h1>
        <p>{store.description && (
          <p className="text-sm text-muted-foreground order-first sm:order-none sm:w-full sm:max-w-2xl">
            {store.description}
          </p>
        )}</p>
        
        </div>
       
       
      </div>

      {/* Row 2: Description, location, pills, phone, response rate */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-center sm:gap-x-6 sm:gap-y-3">
        
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{formatLocation(store.owner)}</span>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-sm font-medium text-foreground dark:border-yellow-800 dark:bg-yellow-950/50"
          title="Rating"
        >
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          {rating.toFixed(1)} Rating
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground">
          <Boxes className="h-4 w-4 text-muted-foreground" />
          {store.liveItemCount} Live Items
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium text-foreground">
          {store.totalItemCount} Total Items
        </span>
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-violet-500 shrink-0" />
          <span className="text-muted-foreground">Phone:</span>
          <span className="font-medium">{formatPhone(store.owner.businessPhone)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-violet-500 shrink-0" />
          <span className="text-muted-foreground">Response:</span>
          <span className="font-medium">
            {responseRate != null ? `${responseRate}%` : "—"}
          </span>
        </div>
        <div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFavourite}
          disabled={isToggling}
          className={
            isFavourited
              ? "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 shrink-0"
              : "shrink-0"
          }
        >
          <Heart
            className={`h-4 w-4 mr-2 ${isFavourited ? "fill-current" : ""}`}
          />
          {isFavourited ? "Favorited" : "Add to favorites"}
        </Button>
        </div>
        
      </div>
    </div>
  );
}
