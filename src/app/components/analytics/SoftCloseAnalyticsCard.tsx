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
import { motion } from "framer-motion";
import { Flame, Timer, Zap } from "lucide-react";
import { format } from "date-fns";
import type { SoftCloseAnalytics } from "@/actions/soft-close-analytics.action";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

type SoftCloseAnalyticsCardProps = {
  data: SoftCloseAnalytics;
  /** If true, show store column and link to admin lot; if false, seller view (no store column, link to lot detail) */
  isAdmin?: boolean;
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-muted",
  SCHEDULED: "bg-amber-500/80",
  LIVE: "bg-green-500/80",
  SOLD: "bg-purple-500/80",
  UNSOLD: "bg-red-500/80",
};

export function SoftCloseAnalyticsCard({
  data,
  isAdmin = false,
}: SoftCloseAnalyticsCardProps) {
  const { lotsWithBiddingWars, totalExtensions, topLots } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Soft-Close & Extension Analytics
        </CardTitle>
        <CardDescription>
          Lots that had bidding wars — late bids triggered time extensions so buyers could counter-bid.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Flame className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Lots with bidding wars</p>
              <p className="text-2xl font-bold">{lotsWithBiddingWars}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Timer className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total extensions</p>
              <p className="text-2xl font-bold">{totalExtensions}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Zap className="h-4 w-4 text-amber-500" />
            Top lots by extensions
          </h3>
          {topLots.length === 0 ? (
            <p className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
              No lots with extensions yet. When buyers bid in the final minutes, lots auto-extend and will show here.
            </p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lot</TableHead>
                    {isAdmin && <TableHead>Store</TableHead>}
                    <TableHead className="text-center">Extensions</TableHead>
                    <TableHead>Last extended</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topLots.map((lot) => (
                    <TableRow key={lot.lotId}>
                      <TableCell className="font-medium">
                        {lot.lotDisplayId ? `${lot.lotDisplayId} — ` : ""}
                        {lot.title}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-muted-foreground">{lot.storeName}</TableCell>
                      )}
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200">
                          {lot.extendedCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {lot.lastExtendedAt
                          ? format(new Date(lot.lastExtendedAt), "MMM d, yyyy HH:mm")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[lot.status] ?? "bg-muted"}>
                          {lot.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={isAdmin ? `/lots-management/${lot.lotId}` : `/lots/${lot.lotId}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {isAdmin ? "Manage" : "View"}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  
  );
}
