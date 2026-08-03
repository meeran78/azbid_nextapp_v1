"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Store } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="relative inline-flex overflow-hidden rounded-full border bg-card">
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-primary"
        animate={{ x: isStoreView ? "100%" : "0%" }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
      />
      <button
        type="button"
        onClick={() => setView("items")}
        aria-pressed={!isStoreView}
        className={cn(
          "relative z-10 flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-6 py-2.5 text-sm font-medium transition-colors",
          !isStoreView
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-4 w-4 " />
        All Items
      </button>
      <button
        type="button"
        onClick={() => setView("store")}
        aria-pressed={isStoreView}
        className={cn(
          "relative z-10 flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap px-6 py-2.5 text-sm font-medium transition-colors",
          isStoreView
            ? "text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Store className="h-4 w-4" />
        By Store
      </button>
    </div>
  );
}
