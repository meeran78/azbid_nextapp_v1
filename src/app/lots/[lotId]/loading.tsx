import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function LotDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-10xl">
      <Skeleton className="h-9 w-32 mb-6" />
      <div className="space-y-6">
        <div className="border-b pb-6 space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-6 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[320px]">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="rounded-xl aspect-square w-full" />
              ))}
            </div>
            <div className="mt-8 flex justify-between border-t pt-6">
              <Skeleton className="h-4 w-40" />
              <div className="flex gap-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
