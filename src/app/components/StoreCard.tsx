"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Package, Star, Heart } from "lucide-react";
import { toggleStoreFavouriteAction } from "@/actions/store-favourite.action";
import { toast } from "sonner";
import type { LandingStore } from "@/actions/landing.action";

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

interface StoreCardProps {
  store: LandingStore;
  isFavourited: boolean;
}

export function StoreCard({ store, isFavourited: initialFavourited }: StoreCardProps) {
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
        toast.success(result.favourited ? "Added to favourites" : "Removed from favourites");
        router.refresh();
      }
    } catch {
      toast.error("Failed to update favourite");
    } finally {
      setIsToggling(false);
    }
  };

  const rating = store.averageRating ?? 0;
  const reviewCount = store.ratingsCount ?? 0;
  const responseRate = store.responseRate ?? 0;

  return (
    <Card className="overflow-hidden relative transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5">
      <div className="absolute top-3 right-3 z-10">
        <span className="h-2.5 w-2.5 rounded-full bg-green-500 block" title="Online" />
      </div>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted mb-3">
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
          <h3 className="font-bold text-lg">{store.name}</h3>
          <p className="text-sm text-muted-foreground">
            {store.itemCount} Item{store.itemCount !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i <= Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : i === Math.ceil(rating) && rating % 1 >= 0.5
                        ? "fill-yellow-400/50 text-yellow-400"
                        : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">
              {rating.toFixed(1)}
              {reviewCount > 0 && (
                <span className="text-muted-foreground font-normal ml-1">
                  ({reviewCount >= 1000 ? `${(reviewCount / 1000).toFixed(1)}k` : reviewCount})
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{formatLocation(store.owner)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4 shrink-0" />
            <span>{formatPhone(store.owner.businessPhone)}</span>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm border-t pt-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Response Rate</span>
            <span className="font-medium text-green-600">
              {responseRate != null ? `${responseRate}%` : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active Auctions</span>
            <span className="font-medium">{store.activeAuctionsCount}</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button variant="outline" asChild className="flex-1">
            <Link href={`/stores/${store.id}`}>View Store</Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleFavourite}
            disabled={isToggling}
            className={isFavourited ? "text-red-500 border-red-200" : ""}
          >
            <Heart
              className={`h-4 w-4 ${isFavourited ? "fill-current" : ""}`}
            />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
