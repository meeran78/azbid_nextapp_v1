"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { toggleItemFavouriteAction } from "@/actions/item-favourite.action";
import { BuyerItemListCard } from "./BuyerItemListCard";
import type { BuyerFavouriteItem } from "@/actions/item-favourite.action";

interface BuyerFavouritesListProps {
  items: BuyerFavouriteItem[];
}

export function BuyerFavouritesList({ items }: BuyerFavouritesListProps) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function handleRemove(itemId: string) {
    setRemovingId(itemId);
    try {
      const result = await toggleItemFavouriteAction(itemId);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Removed from favourites");
        router.refresh();
      }
    } catch {
      toast.error("Failed to remove");
    } finally {
      setRemovingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-12 text-center">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-medium">No favourite items yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Click the heart on any item in a store or lot to add it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <BuyerItemListCard
          key={item.id}
          item={item}
          type="favourite"
          onRemove={handleRemove}
          isRemoving={removingId === item.id}
        />
      ))}
    </div>
  );
}
