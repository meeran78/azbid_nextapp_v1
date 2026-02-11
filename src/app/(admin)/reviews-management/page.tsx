import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getStoreReviewsForModeration } from "@/actions/store-review.action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { AdminReviewsTable } from "./AdminReviewsTable";

export default async function AdminReviewsManagementPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const { reviews: pendingReviews, total: pendingTotal } =
    await getStoreReviewsForModeration({
      status: "PENDING",
      limit: 100,
      offset: 0,
    });

  return (
    <div className="container mx-auto p-6 max-w-10xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Store Reviews</h1>
        <p className="text-muted-foreground mt-1">
          Moderate buyer reviews. Only approved reviews are shown on stores and count toward ratings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Pending moderation ({pendingTotal})
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Approve or reject reviews from verified buyers (completed purchases only).
          </p>
        </CardHeader>
        <CardContent>
          {pendingTotal === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No reviews pending moderation.
            </p>
          ) : (
            <AdminReviewsTable reviews={pendingReviews} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
