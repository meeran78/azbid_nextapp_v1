import {
  getActiveLotsFiltered,
  getActiveItemsFiltered,
  getActiveStoresForFilter,
  type LotStatusFilter,
} from "@/actions/active-lots.action";
import { getUserFavouriteItemIds } from "@/actions/item-favourite.action";
import { getUserWatchedItemIds } from "@/actions/item-watch.action";
import { ActiveLotsFilterBar } from "@/app/components/ActiveLotsFilterBar";
import { ActiveLotsViewToggle, type ActiveLotsView } from "@/app/components/ActiveLotsViewToggle";
import { ActiveLotsStoreSelect } from "@/app/components/ActiveLotsStoreSelect";
import { ActiveLotCard } from "@/app/components/ActiveLotCard";
import { ActiveItemCard } from "@/app/components/ActiveItemCard";
import { SectionPagination } from "@/app/components/SectionPagination";
import { Badge } from "@/components/ui/badge";

const DEFAULT_LOT_PER_PAGE = 6;
const DEFAULT_ITEM_PER_PAGE = 9;

/** Display order for lot status (lower index = shown first). */
const LOT_STATUS_ORDER: Record<string, number> = {
  LIVE: 0,
  SCHEDULED: 1,
  DRAFT: 2,
  SOLD: 3,
  UNSOLD: 4,
  RESEND: 5,
};

function sortLotsByStatus<T extends { status: string }>(lots: T[]): T[] {
  return [...lots].sort(
    (a, b) => (LOT_STATUS_ORDER[a.status] ?? 99) - (LOT_STATUS_ORDER[b.status] ?? 99)
  );
}

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
  const params = searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  const view: ActiveLotsView =
    params.lot_view === "lots" ? "lots" : params.lot_view === "store" ? "store" : "items";
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
    <section id="active-lots" className="container mx-auto px-4 py-16 max-w-7xl">
      <div className='flex items-center justify-center space-x-2 mb-4'>
        <Badge
          variant='outline'
          className='bg-destructive/10 text-destructive border-destructive/20'>
          🔥 BIDDING LIVE
        </Badge>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
        Live <span className="text-gradient-primary italic">Auctions</span>
      </h2>
      <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
        Browse lots by name, location, item, or store. Filter by status and find live or scheduled auctions.
      </p>

      <div className="flex justify-center mb-6">
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
          page={page}
          perPage={Math.min(24, Math.max(1, parseInt(params.lot_per_page ?? String(DEFAULT_ITEM_PER_PAGE), 10) || DEFAULT_ITEM_PER_PAGE))}
          baseParams={baseParams}
        />
      )}

      {view === "store" && (
        <ActiveStoreView
          lotQ={lotQ}
          lotStatus={lotStatus}
          lotLocation={lotLocation}
          lotItem={lotItem}
          requestedStoreId={params.lot_store ?? null}
          page={page}
          perPage={Math.min(24, Math.max(1, parseInt(params.lot_per_page ?? String(DEFAULT_ITEM_PER_PAGE), 10) || DEFAULT_ITEM_PER_PAGE))}
          baseParams={baseParams}
        />
      )}

      {view === "lots" && (
        <ActiveLotsView
          lotQ={lotQ}
          lotStatus={lotStatus}
          lotLocation={lotLocation}
          lotItem={lotItem}
          page={page}
          perPage={Math.min(24, Math.max(1, parseInt(params.lot_per_page ?? String(DEFAULT_LOT_PER_PAGE), 10) || DEFAULT_LOT_PER_PAGE))}
          baseParams={baseParams}
        />
      )}
    </section>
  );
}

async function ActiveItemsView({
  lotQ,
  lotStatus,
  lotLocation,
  lotItem,
  storeId,
  page,
  perPage,
  baseParams,
}: {
  lotQ: string | null;
  lotStatus: LotStatusFilter | null;
  lotLocation: string | null;
  lotItem: string | null;
  storeId: string | null;
  page: number;
  perPage: number;
  baseParams: Record<string, string | undefined>;
}) {
  const [{ items, totalCount }, favouriteIds, watchedIds] = await Promise.all([
    getActiveItemsFiltered(lotQ, lotStatus || "ALL", lotLocation, lotItem, storeId, page, perPage),
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
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

async function ActiveStoreView({
  lotQ,
  lotStatus,
  lotLocation,
  lotItem,
  requestedStoreId,
  page,
  perPage,
  baseParams,
}: {
  lotQ: string | null;
  lotStatus: LotStatusFilter | null;
  lotLocation: string | null;
  lotItem: string | null;
  requestedStoreId: string | null;
  page: number;
  perPage: number;
  baseParams: Record<string, string | undefined>;
}) {
  const stores = await getActiveStoresForFilter();

  if (stores.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No stores currently have live or scheduled lots.
      </p>
    );
  }

  const selectedStoreId =
    requestedStoreId && stores.some((s) => s.id === requestedStoreId)
      ? requestedStoreId
      : stores[0].id;

  return (
    <>
      <ActiveLotsStoreSelect stores={stores} selectedStoreId={selectedStoreId} />
      <ActiveItemsView
        lotQ={lotQ}
        lotStatus={lotStatus}
        lotLocation={lotLocation}
        lotItem={lotItem}
        storeId={selectedStoreId}
        page={page}
        perPage={perPage}
        baseParams={baseParams}
      />
    </>
  );
}

async function ActiveLotsView({
  lotQ,
  lotStatus,
  lotLocation,
  lotItem,
  page,
  perPage,
  baseParams,
}: {
  lotQ: string | null;
  lotStatus: LotStatusFilter | null;
  lotLocation: string | null;
  lotItem: string | null;
  page: number;
  perPage: number;
  baseParams: Record<string, string | undefined>;
}) {
  const { lots, totalCount } = await getActiveLotsFiltered(
    lotQ,
    lotStatus || "ALL",
    lotLocation,
    lotItem,
    null,
    page,
    perPage
  );

  if (lots.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No lots match your filters. Try adjusting search, status, location, or item.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
        {sortLotsByStatus(lots).map((lot) => (
          <ActiveLotCard key={lot.id} lot={lot} />
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
