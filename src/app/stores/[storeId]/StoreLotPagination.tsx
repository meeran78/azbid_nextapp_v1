"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PillPagination } from "@/app/components/PillPagination";

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
      <PillPagination
        currentPage={currentPage}
        totalPages={totalPages}
        getHref={(page) => buildHref(storeId, page, perPage)}
        onNavigate={(page) => handleNav(page)}
        disabled={isPending}
      />
    </nav>
  );
}
