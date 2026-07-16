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
import { Search, MapPin, Filter, Package, X } from "lucide-react";
import type { LotStatusFilter } from "@/actions/active-lots.action";

const STATUS_OPTIONS: { value: LotStatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "LIVE", label: "Live" },
  { value: "SCHEDULED", label: "Scheduled" },
];

export function ActiveLotsFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lotQ = searchParams.get("lot_q") ?? "";
  const lotStatus = (searchParams.get("lot_status") as LotStatusFilter) || "ALL";
  const lotLocation = searchParams.get("lot_location") ?? "";
  const lotItem = searchParams.get("lot_item") ?? "";

  const [lotNameInput, setLotNameInput] = useState(lotQ);
  const [locationInput, setLocationInput] = useState(lotLocation);
  const [itemInput, setItemInput] = useState(lotItem);

  useEffect(() => {
    setLotNameInput(searchParams.get("lot_q") ?? "");
    setLocationInput(searchParams.get("lot_location") ?? "");
    setItemInput(searchParams.get("lot_item") ?? "");
  }, [searchParams]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (lotNameInput.trim()) params.set("lot_q", lotNameInput.trim());
    else params.delete("lot_q");
    if (lotStatus && lotStatus !== "ALL") params.set("lot_status", lotStatus);
    else params.delete("lot_status");
    if (locationInput.trim()) params.set("lot_location", locationInput.trim());
    else params.delete("lot_location");
    if (itemInput.trim()) params.set("lot_item", itemInput.trim());
    else params.delete("lot_item");
    const query = params.toString();
    router.push(query ? `/?${query}#active-lots` : "/#active-lots");
  }, [router, searchParams, lotNameInput, lotStatus, locationInput, itemInput]);

  const clearFilters = useCallback(() => {
    setLotNameInput("");
    setLocationInput("");
    setItemInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lot_q");
    params.delete("lot_status");
    params.delete("lot_location");
    params.delete("lot_item");
    const query = params.toString();
    router.push(query ? `/?${query}#active-lots` : "/#active-lots");
  }, [router, searchParams]);

  const hasActiveFilters = lotQ || (lotStatus && lotStatus !== "ALL") || lotLocation || lotItem;

  return (
    <div className="mb-10 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[180px] flex-1 space-y-2">
          <label htmlFor="lot-name" className="text-sm font-medium text-muted-foreground">
            Lot name
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="lot-name"
              placeholder="Search lot title..."
              value={lotNameInput}
              onChange={(e) => setLotNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-9"
            />
          </div>
        </div>
        <div className="min-w-[160px] flex-1 space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <Select
            value={lotStatus}
            onValueChange={(v) => {
              const params = new URLSearchParams(searchParams.toString());
              if (v === "ALL") params.delete("lot_status");
              else params.set("lot_status", v);
              router.push(params.toString() ? `/?${params.toString()}#active-lots` : "/#active-lots");
            }}
          >
            <SelectTrigger className="w-full">
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
        </div>
        <div className="min-w-[180px] flex-1 space-y-2">
          <label htmlFor="lot-location" className="text-sm font-medium text-muted-foreground">
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="lot-location"
              placeholder="City, state, country..."
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-9"
            />
          </div>
        </div>
        <div className="min-w-[180px] flex-1 space-y-2">
          <label htmlFor="lot-item" className="text-sm font-medium text-muted-foreground">
            Item
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="lot-item"
              placeholder="Item title..."
              value={itemInput}
              onChange={(e) => setItemInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
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
