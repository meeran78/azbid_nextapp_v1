"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Store, Layers } from "lucide-react";
import { cn } from "@/components/lib/utils";

export type ActiveLotsView = "items" | "store" | "lots";

const VIEW_OPTIONS: { value: ActiveLotsView; label: string; icon: typeof LayoutGrid }[] = [
  { value: "items", label: "All Items", icon: LayoutGrid },
  { value: "store", label: "By Store", icon: Store },
  { value: "lots", label: "By Lots", icon: Layers },
];

export function ActiveLotsViewToggle({ view }: { view: ActiveLotsView }) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    <div className="inline-flex items-center rounded-lg border bg-card p-1">
      {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setView(value)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            view === value
              ? "bg-violet-600 text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
