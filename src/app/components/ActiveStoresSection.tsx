import { getActiveStoresWithLotsFiltered, type StoreStatusFilter } from "@/actions/landing.action";
import { getUserFavouriteStoreIds } from "@/actions/store-favourite.action";
import { StoreCard } from "@/components/StoreCard";
import { ActiveStoresFilterBar } from "@/app/components/ActiveStoresFilterBar";
import { Badge } from "@/components/ui/badge";
import { SectionPagination } from "@/app/components/SectionPagination";

const DEFAULT_STORE_PER_PAGE = 6;

type ActiveStoresSectionProps = {
  searchParams?:
    | { q?: string; status?: string; location?: string; store_page?: string; store_per_page?: string }
    | Promise<{ q?: string; status?: string; location?: string; store_page?: string; store_per_page?: string }>;
};

export async function ActiveStoresSection({ searchParams }: ActiveStoresSectionProps) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  const q = params.q ?? null;
  const status = (params.status as StoreStatusFilter) ?? null;
  const location = params.location ?? null;
  const page = Math.max(1, parseInt(params.store_page ?? "1", 10) || 1);
  const perPage = Math.min(24, Math.max(1, parseInt(params.store_per_page ?? String(DEFAULT_STORE_PER_PAGE), 10) || DEFAULT_STORE_PER_PAGE));

  const [{ stores, totalCount }, favouriteStoreIds] = await Promise.all([
    getActiveStoresWithLotsFiltered(q, status || "ACTIVE", location, page, perPage),
    getUserFavouriteStoreIds(),
  ]);

  const favouriteSet = new Set(favouriteStoreIds);
  const baseParams: Record<string, string | undefined> = {
    q: params.q,
    status: params.status,
    location: params.location,
    store_page: params.store_page,
    store_per_page: params.store_per_page,
  };

  return (
    <section id="active-stores" className="container mx-auto px-4 py-16 max-w-7xl">
      <div className='flex items-center justify-center space-x-2 mb-4'>
							<Badge
								variant='outline'
								className='bg-primary/10 text-primary border-primary/20'>
								🏪 TRUSTED SELLERS
							</Badge>
						</div>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
      Browse By <span className='italic'>Seller</span>
      </h2>
      <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        Browse our trusted sellers. View stores, favourite your favourites, and explore live auctions.
      </p>
     
      <ActiveStoresFilterBar />

      {stores.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No stores match your filters. Try adjusting search, status, or location.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[360px]">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                isFavourited={favouriteSet.has(store.id)}
              />
            ))}
          </div>
          <SectionPagination
            paramPrefix="store"
            baseParams={baseParams}
            currentPage={page}
            perPage={perPage}
            totalCount={totalCount}
            syncResponsivePerPage
          />
        </>
      )}
    </section>
  );
}
