import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPublicStore } from "@/actions/public-store.action";
import { getUserFavouriteStoreIds } from "@/actions/store-favourite.action";
import { getUserFavouriteItemIds } from "@/actions/item-favourite.action";
import { getUserWatchedItemIds } from "@/actions/item-watch.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package } from "lucide-react";
import { StoreDetailHeader } from "./StoreDetailHeader";
import { StoreLotCard } from "./StoreLotCard";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const [store, favouriteIds, favouriteItemIds, watchedItemIds] =
    await Promise.all([
      getPublicStore(storeId),
      getUserFavouriteStoreIds(),
      getUserFavouriteItemIds(),
      getUserWatchedItemIds(),
    ]);

  if (!store) notFound();

  const isFavourited = favouriteIds.includes(storeId);

  return (
    <div className="container mx-auto px-2 py-8 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/#active-stores">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stores
        </Link>
      </Button>

      <StoreDetailHeader store={store} isFavourited={isFavourited} />

      <Card className="mt-6">
        <CardContent className="pt-6 space-y-6">
          {store.lots.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center">
              No active lots at the moment.
            </p>
          ) : (
            <div className="space-y-6">
              {/* <h3 className="font-semibold">Active Lots ({store.lots.length})</h3> */}
              
                {store.lots.map((lot) => (
                  <StoreLotCard
                    key={lot.id}
                    lot={lot}
                    storeId={storeId}
                    storeLogoUrl={store.logoUrl}
                    favouriteItemIds={favouriteItemIds}
                    watchedItemIds={watchedItemIds}
                  />
                ))}
            
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
