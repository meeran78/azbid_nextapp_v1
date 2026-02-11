import {
  getStoreReviewsApproved,
  getOrdersEligibleForReview,
} from "@/actions/store-review.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { StoreReviewForm } from "./StoreReviewForm";

const REVIEWS_PAGE_SIZE = 10;

export async function StoreReviewsSection({ storeId }: { storeId: string }) {
  const [reviewsData, eligibleOrders] = await Promise.all([
    getStoreReviewsApproved(storeId, REVIEWS_PAGE_SIZE, 0),
    getOrdersEligibleForReview(),
  ]);

  const eligibleForThisStore = eligibleOrders.filter(
    (o) => o.storeId === storeId && !o.hasExistingReview
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Buyer reviews ({reviewsData.total})
          </CardTitle>
          {eligibleForThisStore.length > 0 && (
            <StoreReviewForm
              storeId={storeId}
              storeName={eligibleForThisStore[0]?.storeName ?? ""}
              eligibleOrders={eligibleForThisStore}
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {reviewsData.reviews.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center">
            No reviews yet. Only verified buyers who completed a purchase can leave a review.
          </p>
        ) : (
          <ul className="space-y-4">
            {reviewsData.reviews.map((r) => (
              <li
                key={r.id}
                className="border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{r.buyerName}</span>
                  <span className="flex items-center gap-0.5 text-amber-600">
                    {r.rating}
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.comment && (
                  <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
