"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PillPagination } from "@/app/components/PillPagination";

const PER_PAGE_OPTIONS = [6, 10, 12, 24] as const;

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

  return (
    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          Showing {(currentPage - 1) * perPage + 1}-{Math.min(currentPage * perPage, totalCount)} of {totalCount}
        </span>
        <Select
          value={String(perPage)}
          disabled={isPending}
          onValueChange={(v) => {
            const next = Number(v);
            startTransition(() => router.push(buildHref(1, next)));
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

      <PillPagination
        currentPage={currentPage}
        totalPages={totalPages}
        getHref={buildHref}
        onNavigate={(_page, href) => handleNav(href)}
        disabled={isPending}
      />
    </div>
  );
}
