import { getActiveStoresWithLots } from "@/actions/landing.action";
import { getUserFavouriteStoreIds } from "@/actions/store-favourite.action";
import { StoreCard } from "@/components/StoreCard";

export async function ActiveStoresSection() {
  const [stores, favouriteStoreIds] = await Promise.all([
    getActiveStoresWithLots(),
    getUserFavouriteStoreIds(),
  ]);

  const favouriteSet = new Set(favouriteStoreIds);

  if (stores.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Active Stores & Auctions
        </h2>
        <p className="text-muted-foreground text-center py-12">
          No active stores at the moment. Check back soon!
        </p>
      </section>
    );
  }

  return (
    <section id="active-stores" className="container mx-auto px-4 py-16 max-w-7xl">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
        Active Stores & Auctions
      </h2>
      <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
        Browse our trusted sellers. View stores, favourite your favourites, and explore live auctions.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
            isFavourited={favouriteSet.has(store.id)}
          />
        ))}
      </div>
    </section>
  );
}
