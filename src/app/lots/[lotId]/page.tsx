import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicLot } from "@/actions/public-lot.action";
import { getUserFavouriteItemIds } from "@/actions/item-favourite.action";
import { getUserWatchedItemIds } from "@/actions/item-watch.action";
import { LotDetailClient } from "./LotDetailClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const DEFAULT_ITEM_PER_PAGE = 9;

export default async function LotDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ lotId: string }>;
  searchParams: Promise<{ item_page?: string; item_per_page?: string }> | { item_page?: string; item_per_page?: string };
}) {
  const { lotId } = await params;
  const resolved = searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  const itemPage = Math.max(1, parseInt(resolved.item_page ?? "1", 10) || 1);
  const itemPerPage = Math.min(24, Math.max(1, parseInt(resolved.item_per_page ?? String(DEFAULT_ITEM_PER_PAGE), 10) || DEFAULT_ITEM_PER_PAGE));

  const [lot, favouriteItemIds, watchedItemIds] = await Promise.all([
    getPublicLot(lotId, itemPage, itemPerPage),
    getUserFavouriteItemIds(),
    getUserWatchedItemIds(),
  ]);

  if (!lot) notFound();

  const totalItemCount = lot.totalItemCount ?? lot.items.length;
  const totalItemPages = Math.max(1, Math.ceil(totalItemCount / itemPerPage));

  return (
    <div className="container mx-auto px-4 py-8 max-w-10xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
      </Button>

      <div className="space-y-6">
        <div className="border-b pb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{lot.title}</h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            {lot.lotDisplayId || lot.id.slice(0, 8)}
          </p>
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
            <span>Store: {lot.store.name}</span>
            <span>Closes: {new Date(lot.closesAt).toLocaleString()}</span>
            {lot.auction && (
              <span>Auction: {lot.auction.title}</span>
            )}
          </div>
          {lot.description && (
            <p className="mt-4 text-muted-foreground">{lot.description}</p>
          )}
          <div className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium">Seller:</span> {lot.store.owner.name}
            {lot.store.owner.displayLocation && (
              <span> · {lot.store.owner.displayLocation}</span>
            )}
            {!lot.store.owner.displayLocation &&
              (lot.store.owner.addressLine1 ||
                lot.store.owner.city) && (
                <span>
                  {" "}
                  · {[lot.store.owner.addressLine1, lot.store.owner.city, lot.store.owner.state, lot.store.owner.zipcode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              )}
          </div>
        </div>

        <LotDetailClient
          lot={lot}
          favouriteItemIds={favouriteItemIds}
          watchedItemIds={watchedItemIds}
          totalItemCount={totalItemCount}
          itemPage={itemPage}
          itemPerPage={itemPerPage}
          totalItemPages={totalItemPages}
        />
      </div>
    </div>
  );
}
