"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { moderateStoreReview } from "@/actions/store-review.action";
import { toast } from "sonner";

type ReviewRow = {
  id: string;
  storeId: string;
  storeName: string;
  userId: string;
  buyerName: string;
  orderId: string;
  rating: number;
  comment: string | null;
  status: string;
  rejectReason: string | null;
  createdAt: Date;
  moderatedAt: Date | null;
};

export function AdminReviewsTable({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async (reviewId: string) => {
    setIsSubmitting(true);
    try {
      const result = await moderateStoreReview(reviewId, "APPROVED", null);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Review approved. Store rating updated.");
        router.refresh();
      }
    } catch {
      toast.error("Failed to approve review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    setIsSubmitting(true);
    try {
      const result = await moderateStoreReview(
        rejectingId,
        "REJECTED",
        rejectReason.trim() || null
      );
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Review rejected.");
        setRejectingId(null);
        setRejectReason("");
        router.refresh();
      }
    } catch {
      toast.error("Failed to reject review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.storeName}</TableCell>
              <TableCell>{r.buyerName}</TableCell>
              <TableCell>
                <span className="flex items-center gap-1">
                  {r.rating}
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </span>
              </TableCell>
              <TableCell className="max-w-[240px] truncate">
                {r.comment || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(r.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    disabled={isSubmitting}
                    onClick={() => handleApprove(r.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isSubmitting}
                    onClick={() => setRejectingId(r.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject review</DialogTitle>
            <DialogDescription>
              Optionally provide a reason shown to the buyer. The review will not be shown on the store.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Inappropriate content"
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectingId(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={handleReject}
            >
              Reject review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
