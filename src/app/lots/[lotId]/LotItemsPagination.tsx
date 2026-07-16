"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { PillPagination } from "@/app/components/PillPagination";

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
      <PillPagination
        currentPage={currentPage}
        totalPages={totalPages}
        getHref={(page) => buildHref(lotId, page, perPage)}
        onNavigate={(page) => handleNav(page)}
        disabled={isPending}
      />
    </nav>
  );
}
