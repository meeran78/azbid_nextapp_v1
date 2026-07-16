"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Store } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ActiveLotsStoreSelectProps = {
  stores: { id: string; name: string }[];
  selectedStoreId: string | null;
};

export function ActiveLotsStoreSelect({ stores, selectedStoreId }: ActiveLotsStoreSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onChange = (storeId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lot_store", storeId);
    params.delete("lot_page");
    router.push(`/?${params.toString()}#active-lots`);
  };

  return (
    <div className="mx-auto mb-8 max-w-sm space-y-2">
      <label className="text-sm font-medium text-muted-foreground">Select a store</label>
      <Select value={selectedStoreId ?? undefined} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <Store className="h-4 w-4 mr-1.5 shrink-0" />
          <SelectValue placeholder="Choose a store..." />
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
