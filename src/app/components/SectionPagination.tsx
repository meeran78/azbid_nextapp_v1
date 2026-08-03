"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { PillPagination } from "@/app/components/PillPagination";

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
  const [isPending, startTransition] = useTransition();
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

  const handleNav = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router]
  );

  if (totalCount <= 0) return null;

  const shownCount = Math.min(currentPage * perPage, totalCount);

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-full border bg-card px-6 py-3 shadow-sm sm:flex-row">
      <PillPagination
        currentPage={currentPage}
        totalPages={totalPages}
        getHref={buildHref}
        onNavigate={(_page, href) => handleNav(href)}
        disabled={isPending}
      />
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        Showing {shownCount.toLocaleString()} of {totalCount.toLocaleString()} results
      </span>
    </div>
  );
}
