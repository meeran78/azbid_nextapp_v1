import { getActiveStoresWithLotsFiltered, type StoreStatusFilter } from "@/actions/landing.action";
import { getUserFavouriteStoreIds } from "@/actions/store-favourite.action";
import { StoreCard } from "@/components/StoreCard";
import { ActiveStoresFilterBar } from "@/app/components/ActiveStoresFilterBar";
import { Badge } from "@/components/ui/badge";
import { span } from "framer-motion/client";

type ActiveStoresSectionProps = {
  searchParams?: { q?: string; status?: string; location?: string } | Promise<{ q?: string; status?: string; location?: string }>;
};

export async function ActiveStoresSection({ searchParams }: ActiveStoresSectionProps) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  const q = params.q ?? null;
  const status = (params.status as StoreStatusFilter) ?? null;
  const location = params.location ?? null;

  const [stores, favouriteStoreIds] = await Promise.all([
    getActiveStoresWithLotsFiltered(q, status || "ACTIVE", location),
    getUserFavouriteStoreIds(),
  ]);

  const favouriteSet = new Set(favouriteStoreIds);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              isFavourited={favouriteSet.has(store.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
