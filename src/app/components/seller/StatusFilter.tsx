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
}

export function StatusFilter({
  options,
  placeholder = "Filter by status",
  triggerClassName,
}: StatusFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get("status") ?? "ALL";

  const onValueChange = (newValue: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (newValue === "ALL") next.delete("status");
    else next.set("status", newValue);
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
