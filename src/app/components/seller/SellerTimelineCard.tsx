"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
  FileText,
  CheckCircle,
  XCircle,
  Play,
  Timer,
  Flag,
  CreditCard,
  Banknote,
  ChevronRight,
} from "lucide-react";
import type { SellerTimelineEvent, SellerTimelineEventType } from "@/actions/seller-timeline.action";

const eventIcons: Record<SellerTimelineEventType, React.ComponentType<{ className?: string }>> = {
  lot_submitted: FileText,
  lot_reviewed: CheckCircle,
  auction_live: Play,
  soft_close: Timer,
  auction_closed: Flag,
  payment_completed: CreditCard,
  payout_processed: Banknote,
};

function EventIcon({ event }: { event: SellerTimelineEvent }) {
  const Icon = eventIcons[event.type];
  const isRejected = event.type === "lot_reviewed" && event.approved === false;
  return isRejected ? (
    <XCircle className="h-4 w-4 text-destructive" />
  ) : (
    <Icon className="h-4 w-4 text-muted-foreground" />
  );
}

export function SellerTimelineCard({
  events,
}: {
  events: { type: SellerTimelineEvent["type"]; at: Date; title: string; lotId?: string; lotTitle?: string; auctionId?: string; auctionTitle?: string; invoiceId?: string; approved?: boolean }[];
}) {
  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Activity for your lots, auctions, and payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No timeline events yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>
          Lot submitted → approved/rejected → auction live → soft-close → closed → payment → payout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-0">
          {events.map((event, i) => (
            <li key={`${event.type}-${event.at.toISOString()}-${event.lotId ?? event.invoiceId ?? event.auctionId ?? i}`} className="relative flex gap-4 pb-6 last:pb-0">
              {i < events.length - 1 && (
                <span
                  className="absolute left-[11px] top-6 h-full w-px bg-border"
                  aria-hidden
                />
              )}
              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background">
                <EventIcon event={event as SellerTimelineEvent} />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(event.at), "MMM d, yyyy · h:mm a")}
                </p>
                {(event.lotTitle || event.auctionTitle) && (
                  <p className="text-xs text-muted-foreground">
                    {event.lotTitle && (
                      <>
                        {event.lotId ? (
                          <Link
                            href={`/lots/${event.lotId}`}
                            className="inline-flex items-center gap-0.5 text-primary hover:underline"
                          >
                            {event.lotTitle}
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        ) : (
                          event.lotTitle
                        )}
                      </>
                    )}
                    {event.auctionTitle && !event.lotTitle && (
                      <span>{event.auctionTitle}</span>
                    )}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
