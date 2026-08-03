"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/components/lib/utils";

type PillPaginationProps = {
  currentPage: number;
  totalPages: number;
  /** Build the href for a given page number (used for the <Link>, and for right-click/open-in-new-tab). */
  getHref: (page: number) => string;
  /** Called after preventDefault on click, so callers can router.push / track a pending state. */
  onNavigate: (page: number, href: string) => void;
  disabled?: boolean;
};

/** Always show first/last page plus a window around the current page; collapse gaps to "…". */
function getPageWindow(currentPage: number, totalPages: number, windowSize = 2): (number | "ellipsis")[] {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || (p >= currentPage - windowSize && p <= currentPage + windowSize)
  );
  const result: (number | "ellipsis")[] = [];
  pages.forEach((p, idx) => {
    if (idx > 0 && pages[idx - 1] !== p - 1) result.push("ellipsis");
    result.push(p);
  });
  return result;
}

export function PillPagination({
  currentPage,
  totalPages,
  getHref,
  onNavigate,
  disabled = false,
}: PillPaginationProps) {
  const pageWindow = getPageWindow(currentPage, totalPages);

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      aria-busy={disabled}
      className={`flex items-center gap-3 transition-opacity duration-200 ${disabled ? "pointer-events-none opacity-60" : ""}`}
    >
      {currentPage > 1 ? (
        <Link
          href={getHref(currentPage - 1)}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(currentPage - 1, getHref(currentPage - 1));
          }}
          className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-foreground transition-colors hover:text-primary"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Link>
      ) : (
        <span
          className="inline-flex cursor-not-allowed items-center gap-1 whitespace-nowrap text-sm font-medium text-muted-foreground/40"
          aria-disabled
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </span>
      )}

      <div className="flex items-center gap-1">
        {pageWindow.map((entry, idx) =>
          entry === "ellipsis" ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-sm text-muted-foreground">
              …
            </span>
          ) : (
            <Link
              key={entry}
              href={getHref(entry)}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(entry, getHref(entry));
              }}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm font-medium transition-colors",
                entry === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
              aria-current={entry === currentPage ? "page" : undefined}
              aria-label={`Go to page ${entry}`}
            >
              {entry}
            </Link>
          )
        )}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={getHref(currentPage + 1)}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(currentPage + 1, getHref(currentPage + 1));
          }}
          className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-foreground transition-colors hover:text-primary"
          aria-label="Go to next page"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className="inline-flex cursor-not-allowed items-center gap-1 whitespace-nowrap text-sm font-medium text-muted-foreground/40"
          aria-disabled="true"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
