import { getActiveLotsFiltered, getActiveCategoriesForFilter, type LotStatusFilter } from "@/actions/active-lots.action";
import { ActiveLotsFilterBar } from "@/app/components/ActiveLotsFilterBar";
import { ActiveLotCard } from "@/app/components/ActiveLotCard";
import { SectionPagination } from "@/app/components/SectionPagination";
import { Badge } from "@/components/ui/badge";

const DEFAULT_LOT_PER_PAGE = 6;

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
        lot_q?: string;
        lot_status?: string;
        lot_location?: string;
        lot_item?: string;
        lot_category?: string;
        lot_page?: string;
        lot_per_page?: string;
      }
    | Promise<{
        lot_q?: string;
        lot_status?: string;
        lot_location?: string;
        lot_item?: string;
        lot_category?: string;
        lot_page?: string;
        lot_per_page?: string;
      }>;
};

export async function ActiveLotsSection({ searchParams }: ActiveLotsSectionProps) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams ?? {};
  const lotQ = params.lot_q ?? null;
  const lotStatus = (params.lot_status as LotStatusFilter) ?? null;
  const lotLocation = params.lot_location ?? null;
  const lotItem = params.lot_item ?? null;
  const lotCategory = params.lot_category ?? null;
  const page = Math.max(1, parseInt(params.lot_page ?? "1", 10) || 1);
  const perPage = Math.min(24, Math.max(1, parseInt(params.lot_per_page ?? String(DEFAULT_LOT_PER_PAGE), 10) || DEFAULT_LOT_PER_PAGE));

  const [{ lots, totalCount }, categories] = await Promise.all([
    getActiveLotsFiltered(lotQ, lotStatus || "ALL", lotLocation, lotItem, lotCategory, page, perPage),
    getActiveCategoriesForFilter(),
  ]);

  const baseParams: Record<string, string | undefined> = {
    lot_q: params.lot_q,
    lot_status: params.lot_status,
    lot_location: params.lot_location,
    lot_item: params.lot_item,
    lot_category: params.lot_category,
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
        Live <span className="text-violet-600 dark:text-violet-400 italic">Auctions</span>
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
      )}
    </section>
  );
}
