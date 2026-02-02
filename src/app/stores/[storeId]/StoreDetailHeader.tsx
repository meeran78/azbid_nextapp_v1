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
    <div className="rounded-lg border bg-card p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Logo, name, description, location */}
        <div className="flex flex-1 gap-4 min-w-0">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted shrink-0">
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
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-xl text-foreground truncate">
              {store.name}
            </h1>
            {store.description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {store.description}
              </p>
            )}
            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>Location</span>
            </div>
            <p className="text-sm text-foreground">
              {formatLocation(store.owner)}
            </p>
          </div>
        </div>

        {/* Middle: Pills + Add to Favorites */}
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleFavourite}
            disabled={isToggling}
            className={
              isFavourited
                ? "text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                : ""
            }
          >
            <Heart
              className={`h-4 w-4 mr-2 ${isFavourited ? "fill-current" : ""}`}
            />
            {isFavourited ? "Favorited" : "Add to favorites"}
          </Button>
        </div>

        {/* Right: Phone + Response Rate (purple accent) */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 lg:gap-6 lg:w-40 shrink-0">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <Phone className="h-5 w-5 text-violet-500 mb-1" />
            <span className="text-xs text-muted-foreground">Phone</span>
            <span className="text-sm font-medium text-foreground">
              {formatPhone(store.owner.businessPhone)}
            </span>
          </div>
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <Star className="h-5 w-5 text-violet-500 mb-1" />
            <span className="text-xs text-muted-foreground">Response Rate</span>
            <span className="text-sm font-medium text-foreground">
              {responseRate != null ? `${responseRate}%` : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
