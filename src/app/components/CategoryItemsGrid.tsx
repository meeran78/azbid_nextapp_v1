"use client";

import { LotItemCard } from "@/app/stores/[storeId]/LotItemCard";
import type { CategoryItemWithLot } from "@/actions/category-browse.action";
import type { PublicStoreLotItem } from "@/actions/public-store.action";

type CategoryItemsGridProps = {
  items: CategoryItemWithLot[];
  favouriteItemIds: string[];
  watchedItemIds: string[];
};

export function CategoryItemsGrid({
  items,
  favouriteItemIds,
  watchedItemIds,
}: CategoryItemsGridProps) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-16">
        No items in this category right now. Check back later or browse other categories.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map(({ item, lotId, lotStatus, storeId }) => (
        <LotItemCard
          key={item.id}
          item={item as PublicStoreLotItem}
          lotId={lotId}
          lotStatus={lotStatus}
          storeId={storeId}
          isFavourited={favouriteItemIds.includes(item.id)}
          isWatched={watchedItemIds.includes(item.id)}
        />
      ))}
    </div>
  );
}
