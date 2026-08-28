"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StatusOption = { value: string; label: string };

interface StatusFilterProps {
  options: StatusOption[];
  placeholder?: string;
  triggerClassName?: string;
  /**
   * URL query param this filter reads/writes. Must be distinct per filter
   * instance on the same page — e.g. the Auctions and Lots tabs each need
   * their own key, otherwise selecting a status in one tab overwrites the
   * other tab's filter (they'd share the same "status" param and each
   * tab's status enum has different valid values).
   */
  paramKey: string;
}

export function StatusFilter({
  options,
  placeholder = "Filter by status",
  triggerClassName,
  paramKey,
}: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get(paramKey) ?? "ALL";

  const onValueChange = (newValue: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (newValue === "ALL") next.delete(paramKey);
    else next.set(paramKey, newValue);
    router.push(`/my-auctions?${next.toString()}`);
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
