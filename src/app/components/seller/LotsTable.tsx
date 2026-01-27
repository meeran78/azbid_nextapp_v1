"use client";

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

interface Lot {
  id: string;
  title: string;
  status: string;
  startPrice: number;
  reservePrice: number | null;
  currentPrice: number | null;
  auction: {
    title: string;
    status: string;
  };
  store: {
    name: string;
  };
  _count: {
    items: number;
    bids: number;
  };
  winningBid: {
    amount: number;
  } | null;
}

interface LotsTableProps {
  lots: Lot[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500",
  SCHEDULED: "bg-blue-500",
  LIVE: "bg-green-500",
  SOLD: "bg-purple-500",
  UNSOLD: "bg-red-500",
};

export function LotsTable({ lots }: LotsTableProps) {
  if (lots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No lots found. Create your first lot to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Auction</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Starting Price</TableHead>
            <TableHead>Current/Highest Bid</TableHead>
            <TableHead>Bids</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lots.map((lot, index) => {
            const highestBid =
              lot.winningBid?.amount || lot.currentPrice || lot.startPrice;
            return (
              <motion.tr
                key={lot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{lot.title}</TableCell>
                <TableCell>{lot.auction.title}</TableCell>
                <TableCell>{lot._count.items}</TableCell>
                <TableCell>
                  ${lot.startPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>
                  ${highestBid.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>{lot._count.bids}</TableCell>
                <TableCell>
                  <Badge className={statusColors[lot.status] || "bg-gray-500"}>
                    {lot.status}
                  </Badge>
                </TableCell>
              </motion.tr>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}