import {
  getActiveItemsFiltered,
  getActiveStoresForFilter,
  getNextAuction,
  type LotStatusFilter,
} from "@/actions/active-lots.action";
import { getUserFavouriteItemIds } from "@/actions/item-favourite.action";
import { getUserWatchedItemIds } from "@/actions/item-watch.action";
import { ActiveLotsFilterBar } from "@/app/components/ActiveLotsFilterBar";
import { ActiveLotsViewToggle, type ActiveLotsView } from "@/app/components/ActiveLotsViewToggle";
import { ActiveLotsStoreSelect } from "@/app/components/ActiveLotsStoreSelect";
import { ActiveItemCard } from "@/app/components/ActiveItemCard";
import { AuctionCountdown } from "@/app/components/AuctionCountdown";
import { SectionPagination } from "@/app/components/SectionPagination";
import { Badge } from "@/components/ui/badge";

const DEFAULT_ITEM_PER_PAGE = 9;

type ActiveLotsSectionProps = {
  searchParams?:
    | {
        lot_view?: string;
        lot_q?: string;
        lot_status?: string;
        lot_location?: string;
        lot_item?: string;
        lot_store?: string;
        lot_page?: string;
        lot_per_page?: string;
      }
    | Promise<{
        lot_view?: string;
        lot_q?: string;
        lot_status?: string;
        lot_location?: string;
        lot_item?: string;
        lot_store?: string;
        lot_page?: string;
        lot_per_page?: string;
      }>;
};

export async function ActiveLotsSection({ searchParams }: ActiveLotsSectionProps) {
  const [params, nextAuction] = await Promise.all([
    searchParams instanceof Promise ? searchParams : Promise.resolve(searchParams ?? {}),
    getNextAuction(),
  ]);
  const view: ActiveLotsView = params.lot_view === "store" ? "store" : "items";
  const lotQ = params.lot_q ?? null;
  const lotStatus = (params.lot_status as LotStatusFilter) ?? null;
  const lotLocation = params.lot_location ?? null;
  const lotItem = params.lot_item ?? null;
  const page = Math.max(1, parseInt(params.lot_page ?? "1", 10) || 1);

  const baseParams: Record<string, string | undefined> = {
    lot_view: params.lot_view,
    lot_q: params.lot_q,
    lot_status: params.lot_status,
    lot_location: params.lot_location,
    lot_item: params.lot_item,
    lot_store: params.lot_store,
    lot_page: params.lot_page,
    lot_per_page: params.lot_per_page,
  };

  return (
    <section id="active-lots" className="container mx-auto px-4  max-w-7xl">
      <div className='flex items-center justify-center space-x-2 mb-4'>
        <Badge
          variant='outline'
          className='bg-destructive/10 text-destructive border-destructive/20'>
          🔥 BIDDING LIVE
        </Badge>
      </div>
{/* 
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
        Live <span className="text-gradient-primary italic">Auctions</span>
      </h2>
      <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
        Browse lots by name, location, item, or store. Filter by status and find live or scheduled auctions.
      </p> */}

      {nextAuction && (
        <AuctionCountdown title={nextAuction.title} endAt={nextAuction.endAt} />
      )}

      <div className="flex justify-start mb-6">
        <ActiveLotsViewToggle view={view} />
      </div>

      <ActiveLotsFilterBar />

      {view === "items" && (
        <ActiveItemsView
          lotQ={lotQ}
          lotStatus={lotStatus}
          lotLocation={lotLocation}
          lotItem={lotItem}
          storeId={null}
          auctionId={nextAuction?.id ?? null}
          page={page}
          perPage={Math.min(24, Math.max(1, parseInt(params.lot_per_page ?? String(DEFAULT_ITEM_PER_PAGE), 10) || DEFAULT_ITEM_PER_PAGE))}
          baseParams={baseParams}
        />
      )}

      {view === "store" && <ActiveStoreView lotStatus={lotStatus} />}
    </section>
  );
}

async function ActiveItemsView({
  lotQ,
  lotStatus,
  lotLocation,
  lotItem,
  storeId,
  auctionId,
  page,
  perPage,
  baseParams,
}: {
  lotQ: string | null;
  lotStatus: LotStatusFilter | null;
  lotLocation: string | null;
  lotItem: string | null;
  storeId: string | null;
  auctionId: string | null;
  page: number;
  perPage: number;
  baseParams: Record<string, string | undefined>;
}) {
  // No auctionId means there's no LIVE/SCHEDULED auction to spotlight right now.
  if (!auctionId) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No auction is currently live or scheduled. Check back soon.
      </p>
    );
  }

  const [{ items, totalCount }, favouriteIds, watchedIds] = await Promise.all([
    getActiveItemsFiltered(lotQ, lotStatus || "ALL", lotLocation, lotItem, storeId, auctionId, page, perPage),
    getUserFavouriteItemIds(),
    getUserWatchedItemIds(),
  ]);

  const favouriteSet = new Set(favouriteIds);
  const watchedSet = new Set(watchedIds);

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No items match your filters. Try adjusting search, status, location, or item.
      </p>
    );
  }

  return (
    <>
     <SectionPagination
        paramPrefix="lot"
        baseParams={baseParams}
        currentPage={page}
        perPage={perPage}
        totalCount={totalCount}
        syncResponsivePerPage
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-100 my-10">
        {items.map((item) => (
          <ActiveItemCard
            key={item.id}
            item={item}
            isFavourited={favouriteSet.has(item.id)}
            isWatched={watchedSet.has(item.id)}
          />
        ))}
      </div>
      <SectionPagination
        paramPrefix="lot"
        baseParams={baseParams}
        currentPage={page}
        perPage={perPage}
        totalCount={totalCount}
        syncResponsivePerPage
      />
    </>
  );
}

async function ActiveStoreView({ lotStatus }: { lotStatus: LotStatusFilter | null }) {
  const stores = await getActiveStoresForFilter(lotStatus);
  return <ActiveLotsStoreSelect stores={stores} />;
}
