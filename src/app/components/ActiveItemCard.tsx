import Link from "next/link";
import { Store } from "lucide-react";
import { LotItemCard } from "@/app/stores/[storeId]/LotItemCard";
import type { ActiveItem } from "@/actions/active-lots.action";

export function ActiveItemCard({
  item,
  isFavourited,
  isWatched,
}: {
  item: ActiveItem;
  isFavourited: boolean;
  isWatched: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 px-1 text-sm">
        <Link
          href={`/stores/${item.storeId}`}
          className="flex min-w-0 items-center gap-1.5 truncate font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Store className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{item.storeName}</span>
        </Link>
        <Link
          href={`/lots/${item.lotId}`}
          className="shrink-0 whitespace-nowrap text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
        >
          Lot {item.lotDisplayId ?? `#${item.lotId.slice(0, 8)}`}
        </Link>
      </div>
      <LotItemCard
        item={item}
        lotId={item.lotId}
        lotStatus={item.lotStatus}
        closesAt={item.lotClosesAt}
        storeId={item.storeId}
        isFavourited={isFavourited}
        isWatched={isWatched}
      />
    </div>
  );
}
