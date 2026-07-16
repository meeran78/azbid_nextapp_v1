"use client";

import { useRouter } from "next/navigation";
import { Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_CATEGORIES_ID = "all";

type CategorySelectProps = {
  categories: { id: string; name: string }[];
  selectedId: string;
};

export function CategorySelect({ categories, selectedId }: CategorySelectProps) {
  const router = useRouter();

  return (
    <div className="mb-6 max-w-xs space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Category</label>
      <Select value={selectedId} onValueChange={(value) => router.push(`/categories/${value}`)}>
        <SelectTrigger className="w-full">
          <Tag className="h-4 w-4 mr-1.5 shrink-0" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CATEGORIES_ID}>All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
