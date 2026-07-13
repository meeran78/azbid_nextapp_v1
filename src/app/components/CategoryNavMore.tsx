"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CategoryNavMoreProps = {
  categories: { id: string; name: string }[];
};

export function CategoryNavMore({ categories }: CategoryNavMoreProps) {
  if (categories.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 whitespace-nowrap text-muted-foreground outline-none transition-colors hover:text-foreground">
        More
        <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80">
        {categories.map((category) => (
          <DropdownMenuItem key={category.id} asChild>
            <Link href={`/categories/${category.id}`}>{category.name}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
