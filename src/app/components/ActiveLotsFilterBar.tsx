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
import { Search, MapPin, Filter, Package, Tag, X } from "lucide-react";
import type { LotStatusFilter } from "@/actions/active-lots.action";

const STATUS_OPTIONS: { value: LotStatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "LIVE", label: "Live" },
  { value: "SCHEDULED", label: "Scheduled" },
];

type ActiveLotsFilterBarProps = {
  categories: { id: string; name: string }[];
};

export function ActiveLotsFilterBar({ categories }: ActiveLotsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lotQ = searchParams.get("lot_q") ?? "";
  const lotStatus = (searchParams.get("lot_status") as LotStatusFilter) || "ALL";
  const lotLocation = searchParams.get("lot_location") ?? "";
  const lotItem = searchParams.get("lot_item") ?? "";
  const lotCategory = searchParams.get("lot_category") ?? "";

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
    if (lotCategory) params.set("lot_category", lotCategory);
    else params.delete("lot_category");
    const query = params.toString();
    router.push(query ? `/?${query}#active-lots` : "/#active-lots");
  }, [router, searchParams, lotNameInput, lotStatus, locationInput, itemInput, lotCategory]);

  const clearFilters = useCallback(() => {
    setLotNameInput("");
    setLocationInput("");
    setItemInput("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("lot_q");
    params.delete("lot_status");
    params.delete("lot_location");
    params.delete("lot_item");
    params.delete("lot_category");
    const query = params.toString();
    router.push(query ? `/?${query}#active-lots` : "/#active-lots");
  }, [router, searchParams]);

  const hasActiveFilters =
    lotQ || (lotStatus && lotStatus !== "ALL") || lotLocation || lotItem || lotCategory;

  return (
    <div className="mb-10 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <Select
              value={lotCategory || "__all__"}
              onValueChange={(v) => {
                const params = new URLSearchParams(searchParams.toString());
                if (v && v !== "__all__") params.set("lot_category", v);
                else params.delete("lot_category");
                router.push(params.toString() ? `/?${params.toString()}#active-lots` : "/#active-lots");
              }}
            >
              <SelectTrigger className="w-full">
                <Tag className="h-4 w-4 mr-1.5 shrink-0" />
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
    </div>
  );
}
