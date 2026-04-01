"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { setStoreDisplayInHeroAction } from "@/actions/store-display-in-hero.action";
import { toast } from "sonner";

type Props = {
  storeId: string;
  checked: boolean;
  /** When false, store cannot be featured (e.g. not ACTIVE). */
  canToggle: boolean;
};

export function StoreHeroDisplayToggle({ storeId, checked, canToggle }: Props) {
  const [isPending, startTransition] = useTransition();

  const hint = canToggle
    ? "Show this store on the homepage hero carousel"
    : "Approve and activate the store before featuring on hero";

  return (
    <span className="inline-flex" title={hint}>
      <Switch
        checked={checked}
        disabled={!canToggle || isPending}
        onCheckedChange={(v) => {
        startTransition(async () => {
          const result = await setStoreDisplayInHeroAction(storeId, v);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success(
            v ? "Store will appear on the homepage hero" : "Removed from homepage hero"
          );
        });
      }}
      />
    </span>
  );
}
