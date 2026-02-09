import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicLot } from "@/actions/public-lot.action";
import { getUserFavouriteItemIds } from "@/actions/item-favourite.action";
import { getUserWatchedItemIds } from "@/actions/item-watch.action";
import { LotDetailClient } from "./LotDetailClient";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function LotDetailPage({
  params,
}: {
  params: Promise<{ lotId: string }>;
}) {
  const { lotId } = await params;
  const [lot, favouriteItemIds, watchedItemIds] = await Promise.all([
    getPublicLot(lotId),
    getUserFavouriteItemIds(),
    getUserWatchedItemIds(),
  ]);

  if (!lot) notFound();

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
        />
      </div>
    </div>
  );
}
