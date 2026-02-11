"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";

type StoreLotPaginationProps = {
  storeId: string;
  currentPage: number;
  totalPages: number;
  totalLotCount: number;
  perPage: number;
};

function buildHref(storeId: string, page: number, perPage: number): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (perPage !== 6) params.set("per_page", String(perPage));
  const q = params.toString();
  return `/stores/${storeId}${q ? `?${q}` : ""}`;
}

export function StoreLotPagination({
  storeId,
  currentPage,
  totalPages,
  totalLotCount,
  perPage,
}: StoreLotPaginationProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleNav = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return;
      setIsPending(true);
      router.push(buildHref(storeId, page, perPage));
    },
    [storeId, perPage, totalPages, router]
  );

  if (totalLotCount <= 0 || totalPages <= 1) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, totalLotCount);

  return (
    <nav
      role="navigation"
      aria-label="Store lots pagination"
      aria-busy={isPending}
      className={`flex flex-wrap items-center justify-between gap-4 pt-4 border-t transition-opacity duration-200 ${isPending ? "pointer-events-none opacity-60" : ""}`}
    >
      <p className="text-sm text-muted-foreground">
        Showing {from}-{to} of {totalLotCount} lots
      </p>
      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link
            href={buildHref(storeId, currentPage - 1, perPage)}
            onClick={(e) => {
              e.preventDefault();
              if (!isPending) handleNav(currentPage - 1);
            }}
            className="inline-flex items-center gap-1.5 py-1.5 px-0 text-muted-foreground hover:text-foreground transition-colors font-normal"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </Link>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 py-1.5 px-0 text-muted-foreground opacity-50 cursor-not-allowed"
            aria-disabled="true"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </span>
        )}
        <span className="text-muted-foreground px-2">
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages ? (
          <Link
            href={buildHref(storeId, currentPage + 1, perPage)}
            onClick={(e) => {
              e.preventDefault();
              if (!isPending) handleNav(currentPage + 1);
            }}
            className="inline-flex items-center gap-1.5 py-1.5 px-0 text-muted-foreground hover:text-foreground transition-colors font-normal"
            aria-label="Go to next page"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 py-1.5 px-0 text-muted-foreground opacity-50 cursor-not-allowed"
            aria-disabled="true"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
