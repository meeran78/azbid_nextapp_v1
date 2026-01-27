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
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Auction {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date;
  status: string;
  store: {
    name: string;
  };
  _count: {
    lots: number;
  };
}

interface AuctionsTableProps {
  auctions: Auction[];
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-500",
  SCHEDULED: "bg-blue-500",
  LIVE: "bg-green-500",
  COMPLETED: "bg-purple-500",
  CANCELLED: "bg-red-500",
};

export function AuctionsTable({ auctions }: AuctionsTableProps) {
  if (auctions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No auctions found. Create your first auction to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Store</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Lots</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auctions.map((auction, index) => (
            <motion.tr
              key={auction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">{auction.title}</TableCell>
              <TableCell>{auction.store.name}</TableCell>
              <TableCell>
                {format(new Date(auction.startAt), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>
                {format(new Date(auction.endAt), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell>{auction._count.lots}</TableCell>
              <TableCell>
                <Badge
                  className={statusColors[auction.status] || "bg-gray-500"}
                >
                  {auction.status}
                </Badge>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}