"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";

type LotItemsPaginationProps = {
  lotId: string;
  currentPage: number;
  totalPages: number;
  totalItemCount: number;
  perPage: number;
};

function buildHref(lotId: string, page: number, perPage: number): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("item_page", String(page));
  if (perPage !== 9) params.set("item_per_page", String(perPage));
  const q = params.toString();
  return `/lots/${lotId}${q ? `?${q}` : ""}`;
}

export function LotItemsPagination({
  lotId,
  currentPage,
  totalPages,
  totalItemCount,
  perPage,
}: LotItemsPaginationProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, totalItemCount);

  const handleNav = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setIsPending(true);
      router.push(buildHref(lotId, page, perPage));
    },
    [lotId, perPage, totalPages, router]
  );

  if (totalItemCount <= 0 || totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="Lot items pagination"
      className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6"
    >
      <p className="text-sm text-muted-foreground">
        Showing {from}-{to} of {totalItemCount} items
      </p>
      <div className="flex items-center gap-3">
        {currentPage > 1 ? (
          <Link
            href={buildHref(lotId, currentPage - 1, perPage)}
            onClick={(e) => {
              e.preventDefault();
              if (!isPending) handleNav(currentPage - 1);
            }}
            className={`inline-flex items-center gap-1.5 py-1.5 px-0 font-normal transition-colors ${
              isPending ? "pointer-events-none opacity-50 cursor-wait" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Previous page"
            aria-disabled={isPending}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 py-1.5 px-0 text-muted-foreground opacity-50 cursor-not-allowed" aria-disabled>
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </span>
        )}
        <span className="min-w-[4rem] text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages ? (
          <Link
            href={buildHref(lotId, currentPage + 1, perPage)}
            onClick={(e) => {
              e.preventDefault();
              if (!isPending) handleNav(currentPage + 1);
            }}
            className={`inline-flex items-center gap-1.5 py-1.5 px-0 font-normal transition-colors ${
              isPending ? "pointer-events-none opacity-50 cursor-wait" : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Next page"
            aria-disabled={isPending}
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 py-1.5 px-0 text-muted-foreground opacity-50 cursor-not-allowed" aria-disabled>
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
