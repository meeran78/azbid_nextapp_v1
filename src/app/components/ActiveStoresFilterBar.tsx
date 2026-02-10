"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin, Filter, X } from "lucide-react";
import type { StoreStatusFilter } from "@/actions/landing.action";

const STATUS_OPTIONS: { value: StoreStatusFilter; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "ALL", label: "All statuses" },
];

export function ActiveStoresFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const status = (searchParams.get("status") as StoreStatusFilter) || "ACTIVE";
  const location = searchParams.get("location") ?? "";

  const [searchInput, setSearchInput] = useState(q);
  const [locationInput, setLocationInput] = useState(location);

  useEffect(() => {
    setSearchInput(searchParams.get("q") ?? "");
    setLocationInput(searchParams.get("location") ?? "");
  }, [searchParams]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set("q", searchInput.trim());
    if (status && status !== "ACTIVE") params.set("status", status);
    if (locationInput.trim()) params.set("location", locationInput.trim());
    const query = params.toString();
    router.push(query ? `/?${query}#active-stores` : "/#active-stores");
  }, [router, searchInput, status, locationInput]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setLocationInput("");
    router.push("/#active-stores");
  }, [router]);

  const hasActiveFilters = q || (status && status !== "ACTIVE") || location;

  return (
    <div className="mb-10 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-3">
        <div className="flex-1 space-y-2">
          <label htmlFor="store-search" className="text-sm font-medium text-muted-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="store-search"
              placeholder="Store name, description, or owner..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-9"
            />
          </div>
        </div>
        {/* <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <Select
            value={status}
            onValueChange={(v) => {
              const params = new URLSearchParams(searchParams.toString());
              if (v === "ACTIVE") params.delete("status");
              else params.set("status", v);
              router.push(params.toString() ? `/?${params.toString()}#active-stores` : "/#active-stores");
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <Filter className="h-4 w-4 mr-1.5 shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}
        <div className="flex-1 space-y-2">
          <label htmlFor="store-location" className="text-sm font-medium text-muted-foreground">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="store-location"
              placeholder="City, state, or country..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={applyFilters}>Apply</Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="gap-1">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
