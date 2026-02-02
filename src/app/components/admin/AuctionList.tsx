"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { deleteAuctionAction } from "@/actions/auction.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500 text-white",
  SCHEDULED: "bg-blue-500 text-white",
  LIVE: "bg-green-500 text-white",
  COMPLETED: "bg-slate-500 text-white",
  CANCELLED: "bg-red-500 text-white",
};

interface LotSummary {
  id: string;
  title: string;
  lotDisplayId: string | null;
}

interface Auction {
  id: string;
  storeId: string;
  title: string;
  description: string | null;
  buyersPremium: string | null;
  auctionDisplayId: string | null;
  status: string;
  startAt: Date;
  endAt: Date;
  softCloseEnabled: boolean;
  softCloseWindowSec: number;
  softCloseExtendSec: number;
  softCloseExtendLimit: number;
  store: { id: string; name: string };
  lots: LotSummary[];
  _count: { lots: number };
  createdAt: Date;
  updatedAt: Date;
}

interface AuctionListProps {
  auctions: Auction[];
}

export function AuctionList({ auctions }: AuctionListProps) {
  const router = useRouter();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const result = await deleteAuctionAction(id);
      if (result?.error) {
        toast.error("Error", { description: result.error });
      } else {
        toast.success("Auction deleted");
        router.refresh();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete auction.";
      toast.error("Failed to delete auction", { description: message });
    }
  };

  if (auctions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No auctions found.</p>
          <Button asChild className="mt-4">
            <Link href="/auctions-management/new">
              <Plus className="h-4 w-4 mr-2" />
              Create First Auction
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Auctions</CardTitle>
        <CardDescription>
          {auctions.length} auction{auctions.length === 1 ? "" : "s"} total
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto -mx-4 sm:mx-0">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Display ID</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead className="text-center">Lots</TableHead>
                <TableHead>Buyer&apos;s Premium</TableHead>
                <TableHead>Soft Close</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auctions.map((auction) => (
                <TableRow key={auction.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-mono text-xs">
                    {auction.auctionDisplayId || auction.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>{auction.store.name}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate" title={auction.title}>
                  <p className="font-medium line-clamp-2">{auction.title}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[auction.status] ?? "bg-gray-500"}>
                      {auction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {new Date(auction.startAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {new Date(auction.endAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="space-y-1">
                      <Badge variant="outline">{auction._count.lots} lots</Badge>
                      {auction.lots?.length > 0 && (
                        <div className="text-xs text-muted-foreground max-w-[180px] text-left mt-1 space-y-0.5">
                          {auction.lots.slice(0, 3).map((lot) => (
                            <Link
                              key={lot.id}
                              href={`/lots-management/${lot.id}`}
                              className="block truncate hover:text-foreground hover:underline"
                              title={lot.title}
                            >
                              {lot.lotDisplayId || lot.id.slice(0, 8)}: {lot.title}
                            </Link>
                          ))}
                          {auction.lots.length > 3 && (
                            <div className="text-muted-foreground/80">+{auction.lots.length - 3} more</div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[150px]">
                    <p className="text-sm text-muted-foreground line-clamp-2 truncate" title={auction.buyersPremium || undefined}>
                      {auction.buyersPremium || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {auction.softCloseEnabled ? (
                      <span className="text-muted-foreground">
                        {auction.softCloseWindowSec}s / {auction.softCloseExtendSec}s / {auction.softCloseExtendLimit}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Off</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/auctions-management/${auction.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(auction.id, auction.title)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: card layout */}
        <div className="md:hidden space-y-4 p-4">
          {auctions.map((auction) => (
            <Card key={auction.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    {auction.auctionDisplayId || auction.id.slice(0, 8)}
                  </span>
                  <Badge className={statusColors[auction.status] ?? "bg-gray-500"}>
                    {auction.status}
                  </Badge>
                </div>
                <p className="font-medium">{auction.title}</p>
                <p className="text-sm text-muted-foreground">{auction.store.name}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Start: {new Date(auction.startAt).toLocaleString()}</p>
                  <p>End: {new Date(auction.endAt).toLocaleString()}</p>
                  <p>{auction._count?.lots ?? auction.lots?.length ?? 0} lot(s)</p>
                </div>
                {auction.lots && auction.lots.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Lots:</p>
                    <ul className="text-xs space-y-0.5">
                      {auction.lots.slice(0, 5).map((lot) => (
                        <li key={lot.id}>
                          <Link
                            href={`/lots-management/${lot.id}`}
                            className="block truncate hover:text-foreground hover:underline"
                            title={lot.title}
                          >
                            {lot.lotDisplayId || lot.id.slice(0, 8)}: {lot.title}
                          </Link>
                        </li>
                      ))}
                      {auction.lots.length > 5 && (
                        <li className="text-muted-foreground/80">+{auction.lots.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
                {auction.softCloseEnabled && (
                  <p className="text-xs text-muted-foreground">
                    Soft close: {auction.softCloseWindowSec}s / {auction.softCloseExtendSec}s / {auction.softCloseExtendLimit}
                  </p>
                )}
                {auction.buyersPremium && (
                  <div className="p-2 rounded bg-muted/50 text-sm">
                    <p className="font-medium text-muted-foreground">Buyer&apos;s Premium:</p>
                    <p className="line-clamp-2">{auction.buyersPremium}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/auctions-management/${auction.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(auction.id, auction.title)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
