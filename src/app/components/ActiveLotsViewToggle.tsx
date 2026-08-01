"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Store } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/components/lib/utils";

export type ActiveLotsView = "items" | "store";

export function ActiveLotsViewToggle({ view }: { view: ActiveLotsView }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isStoreView = view === "store";

  const setView = (next: ActiveLotsView) => {
    const params = new URLSearchParams(searchParams.toString());
    // "items" is the default view, so keep the URL clean when selecting it.
    if (next === "items") params.delete("lot_view");
    else params.set("lot_view", next);
    // Switching views changes what's paginated, so reset to page 1.
    params.delete("lot_page");
    const query = params.toString();
    router.push(query ? `/?${query}#active-lots` : "/#active-lots");
  };

  return (
    <div className="inline-flex items-center gap-3 rounded-lg border bg-card px-4 py-2.5">
      <span
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium transition-colors",
          isStoreView ? "text-muted-foreground" : "text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        All Items
      </span>
      <Switch
        checked={isStoreView}
        onCheckedChange={(checked) => setView(checked ? "store" : "items")}
        aria-label="Toggle grouping items by store"
      />
      <span
        className={cn(
          "flex items-center gap-1.5 text-sm font-medium transition-colors",
          isStoreView ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <Store className="h-4 w-4" />
        By Store
      </span>
    </div>
  );
}
