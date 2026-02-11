import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicStore } from "@/actions/public-store.action";
import { getUserFavouriteStoreIds } from "@/actions/store-favourite.action";
import { getUserFavouriteItemIds } from "@/actions/item-favourite.action";
import { getUserWatchedItemIds } from "@/actions/item-watch.action";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { StoreDetailHeader } from "./StoreDetailHeader";
import { StoreLotCard } from "./StoreLotCard";
import { StoreLotPagination } from "./StoreLotPagination";

const DEFAULT_PER_PAGE = 6;

export default async function StoreDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeId: string }>;
  searchParams: Promise<{ page?: string; per_page?: string }> | { page?: string; per_page?: string };
}) {
  const { storeId } = await params;
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  const page = Math.max(1, parseInt(resolvedSearchParams.page ?? "1", 10) || 1);
  const perPage = Math.min(24, Math.max(1, parseInt(resolvedSearchParams.per_page ?? String(DEFAULT_PER_PAGE), 10) || DEFAULT_PER_PAGE));

  const [store, favouriteIds, favouriteItemIds, watchedItemIds] =
    await Promise.all([
      getPublicStore(storeId, page, perPage),
      getUserFavouriteStoreIds(),
      getUserFavouriteItemIds(),
      getUserWatchedItemIds(),
    ]);

  if (!store) notFound();

  const isFavourited = favouriteIds.includes(storeId);
  const totalLotCount = store.totalLotCount ?? store.lots.length;
  const totalPages = Math.max(1, Math.ceil(totalLotCount / perPage));

  return (
    <div className="container mx-auto px-2 py-8 max-w-10xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/#active-stores">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stores
        </Link>
      </Button>

      <StoreDetailHeader store={store} isFavourited={isFavourited} />

      <Card className="mt-6 ">
        <CardContent className="pt-6 space-y-6 w-full">
          {store.lots.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center">
              No active lots at the moment.
            </p>
          ) : (
            <>
              <div className="space-y-6">
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
              <StoreLotPagination
                storeId={storeId}
                currentPage={page}
                totalPages={totalPages}
                totalLotCount={totalLotCount}
                perPage={perPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
