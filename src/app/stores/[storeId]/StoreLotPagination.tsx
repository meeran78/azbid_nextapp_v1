"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  if (totalLotCount <= 0 || totalPages <= 1) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, totalLotCount);

  return (
    <nav
      role="navigation"
      aria-label="Store lots pagination"
      className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t"
    >
      <p className="text-sm text-muted-foreground">
        Showing {from}-{to} of {totalLotCount} lots
      </p>
      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link
            href={buildHref(storeId, currentPage - 1, perPage)}
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
