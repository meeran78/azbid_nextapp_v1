"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { submitStoreReview } from "@/actions/store-review.action";
import { toast } from "sonner";
import type { OrderEligibleForReview } from "@/actions/store-review.action";

const MIN_RATING = 1;
const MAX_RATING = 5;

type StoreReviewFormProps = {
  storeId: string;
  storeName: string;
  eligibleOrders: OrderEligibleForReview[];
};

export function StoreReviewForm({
  storeId,
  storeName,
  eligibleOrders,
}: StoreReviewFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState(
    eligibleOrders[0]?.orderId ?? ""
  );
  const [rating, setRating] = useState(3);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) {
      toast.error("Please select an order.");
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await submitStoreReview(
        storeId,
        orderId,
        rating,
        comment.trim() || null
      );
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Review submitted. It will appear after moderation.");
        setOpen(false);
        setComment("");
        setRating(3);
        router.refresh();
      }
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Leave a review
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review {storeName}</DialogTitle>
            <DialogDescription>
              You can leave one review per completed order. Only verified purchases count.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {eligibleOrders.length > 1 && (
              <div className="space-y-2">
                <Label>Order to review</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                >
                  {eligibleOrders.map((o) => (
                    <option key={o.orderId} value={o.orderId}>
                      {o.lotTitle} — ${o.orderTotal.toFixed(2)} (paid{" "}
                      {o.paidAt ? new Date(o.paidAt).toLocaleDateString() : "—"})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Rating (1–5)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="rounded p-1 transition-colors hover:bg-muted"
                    aria-label={`${n} stars`}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        n <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-comment">Comment (optional)</Label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this store..."
                rows={3}
                maxLength={2000}
                className="resize-none"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Submit review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
