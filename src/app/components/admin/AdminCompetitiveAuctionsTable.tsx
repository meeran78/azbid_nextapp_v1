"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame } from "lucide-react";
import type { CompetitiveAuctionRow } from "@/actions/admin-dashboard.action";

export function AdminCompetitiveAuctionsTable({
  auctions,
}: {
  auctions: CompetitiveAuctionRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Most competitive auctions
        </CardTitle>
        <CardDescription>
          By total bid count. Lots with extensions indicate bidding wars near close.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {auctions.length === 0 ? (
          <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
            No auction data yet.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auction</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead className="text-center">Bids</TableHead>
                  <TableHead className="text-center">Lots</TableHead>
                  <TableHead className="text-center">Bidding war lots</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {auctions.map((a) => (
                  <TableRow key={a.auctionId}>
                    <TableCell className="font-medium">
                      {a.auctionDisplayId ? `${a.auctionDisplayId} — ` : ""}
                      {a.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.storeName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{a.bidCount}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{a.lotCount}</TableCell>
                    <TableCell className="text-center">
                      {a.extendedLotsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <Flame className="h-3.5 w-3.5" />
                          {a.extendedLotsCount}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/auctions-management/${a.auctionId}/edit`}
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
