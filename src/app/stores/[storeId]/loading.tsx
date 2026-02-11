import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function StoreDetailLoading() {
  return (
    <div className="container mx-auto px-2 py-8 max-w-10xl">
      <Skeleton className="h-9 w-32 mb-6" />
      <Skeleton className="h-24 w-full max-w-2xl mb-6" />
      <Card className="mt-6">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-6 min-h-[400px]">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
          <div className="flex justify-between border-t pt-4">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
