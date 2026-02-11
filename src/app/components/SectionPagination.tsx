"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PER_PAGE_OPTIONS = [6, 12, 24] as const;

/** Responsive page size: sm 6, md 9, lg 12 */
function getResponsivePageSize(): number {
  if (typeof window === "undefined") return 6;
  const w = window.innerWidth;
  if (w >= 1024) return 12;
  if (w >= 768) return 9;
  return 6;
}

type SectionPaginationProps = {
  /** e.g. "store" -> store_page, store_per_page */
  paramPrefix: string;
  /** All current search params (resolved object) */
  baseParams: Record<string, string | undefined>;
  currentPage: number;
  perPage: number;
  totalCount: number;
  /** When true, on mount we may sync per_page from window width (responsive) */
  syncResponsivePerPage?: boolean;
};

function buildQuery(
  base: Record<string, string | undefined>,
  pageKey: string,
  perPageKey: string,
  page: number,
  perPage: number
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(base)) {
    if (v !== undefined && v !== "") q.set(k, v);
  }
  q.set(pageKey, String(page));
  q.set(perPageKey, String(perPage));
  return q.toString();
}

export function SectionPagination({
  paramPrefix,
  baseParams,
  currentPage,
  perPage,
  totalCount,
  syncResponsivePerPage = true,
}: SectionPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const pageKey = `${paramPrefix}_page`;
  const perPageKey = `${paramPrefix}_per_page`;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

  const hasExplicitPerPage = baseParams[perPageKey] !== undefined;
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!syncResponsivePerPage || hasExplicitPerPage || hasSyncedRef.current) return;
    const desired = getResponsivePageSize();
    if (desired === perPage) return;
    hasSyncedRef.current = true;
    const q = buildQuery(baseParams, pageKey, perPageKey, 1, desired);
    router.replace(`${pathname || "/"}?${q}`, { scroll: false });
  }, [syncResponsivePerPage, hasExplicitPerPage, perPage, pathname, baseParams, pageKey, perPageKey, router]);

  const buildHref = useCallback(
    (page: number, perPageValue: number = perPage) => {
      const q = buildQuery(baseParams, pageKey, perPageKey, page, perPageValue);
      return `${pathname || "/"}?${q}`;
    },
    [baseParams, pageKey, perPageKey, perPage, pathname]
  );

  const pageNumbers = useMemo(() => {
    const list: number[] = [];
    const add = (p: number) => {
      if (p >= 1 && p <= totalPages && list[list.length - 1] !== p) list.push(p);
    };
    add(1);
    if (currentPage > 3) list.push(-1);
    for (let p = Math.max(1, currentPage - 2); p <= Math.min(totalPages, currentPage + 2); p++) add(p);
    if (currentPage < totalPages - 2) list.push(-2);
    if (totalPages > 1) add(totalPages);
    return list;
  }, [currentPage, totalPages]);

  if (totalCount <= 0) return null;

  return (
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, totalCount)} of {totalCount}
        </span>
        <Select
          value={String(perPage)}
          onValueChange={(v) => {
            const next = Number(v);
            router.push(buildHref(1, next));
          }}
        >
          <SelectTrigger className="w-[72px] h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">per page</span>
      </div>

      {totalPages > 1 && (
        <nav role="navigation" aria-label="pagination" className="flex items-center gap-2">
          {currentPage > 1 ? (
            <Link
              href={buildHref(currentPage - 1)}
              className="inline-flex items-center gap-1.5 py-1.5 px-0 text-muted-foreground hover:text-foreground transition-colors font-normal"
              aria-label="Go to previous page"
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
          <PaginationContent className="gap-1.5 mx-0">
            {pageNumbers.map((p) =>
              p < 0 ? (
                <PaginationItem key={p}>
                  <span className="flex size-8 items-center justify-center text-muted-foreground">…</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={p}>
                  <PaginationLink
                    href={buildHref(p)}
                    isActive={p === currentPage}
                    className={
                      p === currentPage
                        ? "size-8 min-w-8 rounded-md bg-background border border-input text-foreground font-medium hover:bg-muted/50 hover:text-foreground"
                        : "min-w-0 h-8 px-0 bg-transparent border-0 text-muted-foreground hover:text-foreground hover:bg-transparent shadow-none font-medium"
                    }
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
          </PaginationContent>
          {currentPage < totalPages ? (
            <Link
              href={buildHref(currentPage + 1)}
              className="inline-flex items-center gap-1.5 py-1.5 px-0 text-muted-foreground hover:text-foreground transition-colors font-normal"
              aria-label="Go to next page"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 py-1.5 px-0 text-muted-foreground opacity-50 cursor-not-allowed" aria-disabled="true">
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
