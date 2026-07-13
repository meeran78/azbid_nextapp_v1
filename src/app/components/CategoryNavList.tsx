"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CategoryNavMore } from "@/app/components/CategoryNavMore";

type Category = { id: string; name: string };

// Matches Tailwind's default breakpoints. Wider screens have room for more
// inline category links before the rest collapse into the "More" dropdown.
const BREAKPOINTS: { query: string; visibleCount: number }[] = [
  { query: "(min-width: 1280px)", visibleCount: 10 },
  { query: "(min-width: 1024px)", visibleCount: 8 },
  { query: "(min-width: 768px)", visibleCount: 6 },
  { query: "(min-width: 640px)", visibleCount: 4 },
];
const DEFAULT_VISIBLE_COUNT = 3;

function getVisibleCount(): number {
  if (typeof window === "undefined") return BREAKPOINTS[1].visibleCount;
  const match = BREAKPOINTS.find((bp) => window.matchMedia(bp.query).matches);
  return match?.visibleCount ?? DEFAULT_VISIBLE_COUNT;
}

export function CategoryNavList({ categories }: { categories: Category[] }) {
  // Default to the lg breakpoint's count so the server-rendered markup
  // (before hydration determines the real viewport) matches the most
  // common desktop case; useEffect below corrects it immediately on mount.
  const [visibleCount, setVisibleCount] = useState(BREAKPOINTS[1].visibleCount);

  useEffect(() => {
    const update = () => setVisibleCount(getVisibleCount());
    update();

    const mediaQueries = BREAKPOINTS.map((bp) => window.matchMedia(bp.query));
    mediaQueries.forEach((mq) => mq.addEventListener("change", update));
    return () => {
      mediaQueries.forEach((mq) => mq.removeEventListener("change", update));
    };
  }, []);

  const visibleCategories = categories.slice(0, visibleCount);
  const overflowCategories = categories.slice(visibleCount);

  return (
    <>
      {visibleCategories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.id}`}
          className="whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
        >
          {category.name}
        </Link>
      ))}
      <CategoryNavMore categories={overflowCategories} />
    </>
  );
}
