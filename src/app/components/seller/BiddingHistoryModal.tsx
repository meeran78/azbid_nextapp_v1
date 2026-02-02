"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { Gavel, Loader2 } from "lucide-react";
import { getBidHistoryAction } from "@/actions/bid-history.action";
import type { BidHistoryEntry } from "@/actions/bid-history.action";

interface BiddingHistoryModalProps {
  itemId: string;
  itemTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BiddingHistoryModal({
  itemId,
  itemTitle,
  open,
  onOpenChange,
}: BiddingHistoryModalProps) {
  const [bids, setBids] = useState<BidHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && itemId) {
      setLoading(true);
      setError(null);
      getBidHistoryAction(itemId)
        .then((result) => {
          if ("error" in result) {
            setError(result.error);
            setBids([]);
          } else {
            setBids(result);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, itemId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-violet-600" />
            Bidding History
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground truncate" title={itemTitle}>
          {itemTitle}
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive py-4">{error}</p>
        ) : bids.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No bids yet. Be the first to bid!
          </p>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <ul className="space-y-2">
              <AnimatePresence mode="popLayout">
                {bids.map((bid, index) => (
                  <motion.li
                    key={bid.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-medium text-sm truncate">
                        {bid.buyerDisplay}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(bid.bidDate), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.25,
                        delay: index * 0.05 + 0.15,
                      }}
                      className="shrink-0 font-bold text-violet-600"
                    >
                      ${bid.amount.toFixed(2)}
                    </motion.span>
                  </motion.li>
                ))} 
                </AnimatePresence>
            </ul>
           
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
