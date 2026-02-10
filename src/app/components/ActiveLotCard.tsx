import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Package } from "lucide-react";
import type { ActiveLot } from "@/actions/active-lots.action";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotCountdown } from "@/app/stores/[storeId]/LotCountdown";

const REMOVAL_DISCLAIMER = "Removal Date Firm, No Exceptions.";

export function ActiveLotCard({ lot }: { lot: ActiveLot }) {
  const statusLower = lot.status.toLowerCase();
  const lotNumber = lot.lotDisplayId ?? lot.auctionDisplayId ?? lot.id.slice(0, 8);
  const displayTitle = lot.lotDisplayId
    ? `${lot.title} Lot #${lot.lotDisplayId}`
    : lot.title;

  return (
    <Card className="overflow-hidden border-2 border-violet-200/50 shadow-md dark:border-violet-800/30">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-foreground leading-tight pr-2">
            {displayTitle}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${
              statusLower === "live" ? "bg-green-600" : "bg-muted-foreground/80"
            }`}
          >
            {lot.status.toUpperCase()}
          </span>
        </div>
        {lot.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {lot.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6 pb-6">
        {/* Lot details: two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p>
              <span className="font-semibold text-muted-foreground">Lot Number: </span>
              <span className="font-medium">{lotNumber}</span>
            </p>
            {lot.buyersPremium && (
              <p className="text-muted-foreground">
                {lot.buyersPremium} buyer&apos;s premium is added to every purchase
              </p>
            )}
            <p>
              <span className="font-semibold text-muted-foreground block">Removal Date: </span>
              <span className="font-medium">
                {lot.removalStartAt
                  ? format(new Date(lot.removalStartAt), "MMM d, yyyy h:mm a")
                  : "Date not set"}
              </span>
            </p>
            <p className="text-muted-foreground text-xs">{REMOVAL_DISCLAIMER}</p>
          </div>
          <div className="space-y-2">
            <p>
              <span className="font-semibold text-muted-foreground">Start Closing Date: </span>
              <span className="font-medium">
                {format(new Date(lot.closesAt), "MMM d, yyyy h:mm a")}
              </span>
            </p>
            <p>
              <span className="font-semibold text-muted-foreground">Items in Lot: </span>
              <span className="font-medium text-violet-600">
                {lot.itemCount} item{lot.itemCount !== 1 ? "s" : ""}
              </span>
            </p>
          </div>
        </div>

        {/* Time to lot closing */}
        <div>
          <p className="font-semibold text-muted-foreground text-sm mb-2">
            Time to Lot Closing:
          </p>
          <LotCountdown closesAt={lot.closesAt} />
        </div>

        {/* Lot images */}
        {/* {lot.imageUrls.length > 0 && (
          <div>
            <p className="font-semibold text-muted-foreground text-sm mb-2">
              Lot Images:
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {lot.imageUrls.slice(0, 10).map((url, i) => (
                <div
                  key={`${lot.id}-img-${i}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted"
                >
                  <Image
                    src={url}
                    alt={`Lot image ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ))}
            </div>
          </div>
        )} */}

        {lot.imageUrls.length === 0 && (
          <div>
            <p className="font-semibold text-muted-foreground text-sm mb-2">
              Lot Images:
            </p>
            <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        )}

        <Button asChild className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold">
          <Link href={`/lots/${lot.id}`}>View Lot Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
