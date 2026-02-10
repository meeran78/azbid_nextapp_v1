import { getActiveLotsFiltered, getActiveCategoriesForFilter, type LotStatusFilter } from "@/actions/active-lots.action";
import { ActiveLotsFilterBar } from "@/app/components/ActiveLotsFilterBar";
import { ActiveLotCard } from "@/app/components/ActiveLotCard";
import { Badge } from "@/components/ui/badge";
type ActiveLotsSectionProps = {
  searchParams?:
    | { lot_q?: string; lot_status?: string; lot_location?: string; lot_item?: string; lot_category?: string }
    | Promise<{ lot_q?: string; lot_status?: string; lot_location?: string; lot_item?: string; lot_category?: string }>;
};

export async function ActiveLotsSection({ searchParams }: ActiveLotsSectionProps) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  const lotQ = params.lot_q ?? null;
  const lotStatus = (params.lot_status as LotStatusFilter) ?? null;
  const lotLocation = params.lot_location ?? null;
  const lotItem = params.lot_item ?? null;
  const lotCategory = params.lot_category ?? null;

  const [lots, categories] = await Promise.all([
    getActiveLotsFiltered(lotQ, lotStatus || "ALL", lotLocation, lotItem, lotCategory),
    getActiveCategoriesForFilter(),
  ]);

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
      Live Auctions
      </h2>
      <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
        Browse lots by name, location, item, or category. Filter by status and find live or scheduled auctions.
      </p>
    
      <ActiveLotsFilterBar categories={categories} />

      {lots.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No lots match your filters. Try adjusting search, status, location, item, or category.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lots.map((lot) => (
            <ActiveLotCard key={lot.id} lot={lot} />
          ))}
        </div>
      )}
    </section>
  );
}
