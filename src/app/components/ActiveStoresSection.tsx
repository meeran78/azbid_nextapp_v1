import { getActiveStoresWithLots } from "@/actions/landing.action";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Package, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function formatAddress(owner: {
  displayLocation: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
}): string {
  if (owner.displayLocation) return owner.displayLocation;
  const parts = [owner.addressLine1, owner.city, owner.state, owner.zipcode].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Address not provided";
}

export async function ActiveStoresSection() {
  const stores = await getActiveStoresWithLots();

  if (stores.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16 max-w-7xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Active Stores & Auctions
        </h2>
        <p className="text-muted-foreground text-center py-12">
          No active auctions at the moment. Check back soon!
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
        Browse live and scheduled auctions from our trusted sellers. Click on a lot to view items and place bids.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <Card key={store.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                {store.logoUrl ? (
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={store.logoUrl}
                      alt={store.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg truncate">{store.name}</h3>
                  {store.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {store.description}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>
                  Closes:{" "}
                  {store.auctionCloseDate
                    ? new Date(store.auctionCloseDate).toLocaleString()
                    : "—"}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{formatAddress(store.owner)}</span>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <p className="text-sm font-medium">Active Lots</p>
                {store.lots.map((lot) => (
                  <Link
                    key={lot.id}
                    href={`/lots/${lot.id}`}
                    className="block group rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 bg-muted">
                        {lot.firstItemImage ? (
                          <Image
                            src={lot.firstItemImage}
                            alt={lot.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate group-hover:text-primary">
                          {lot.title}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {lot.lotDisplayId || lot.id.slice(0, 8)}
                        </p>
                        {lot.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {lot.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 self-center group-hover:text-primary" />
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button size="sm" variant="ghost" className="h-8">
                        View Lot & Bid
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
