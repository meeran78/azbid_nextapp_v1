"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import type { ActiveStoreCard } from "@/actions/active-lots.action";

function formatClosingLabel(closesAt: Date): string {
  const diff = new Date(closesAt).getTime() - Date.now();
  if (diff <= 0) return "Closing Now";
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `Closes in ${days}d ${hours}h`;
  if (hours > 0) return `Closes in ${hours}h ${minutes}m`;
  return `Closes in ${minutes}m`;
}

function ClosingBadge({ closesAt }: { closesAt: Date | null }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!closesAt) return;
    const update = () => setLabel(formatClosingLabel(closesAt));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [closesAt]);

  if (!closesAt || !label) return null;

  return (
    <span className="inline-block rounded px-2.5 py-1 text-xs font-semibold text-white bg-amber-700">
      {label}
    </span>
  );
}

export function ActiveLotsStoreSelect({ stores }: { stores: ActiveStoreCard[] }) {
  if (stores.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No stores currently have live or scheduled lots.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      {stores.map((store) => (
        <Link
          key={store.id}
          href={`/stores/${store.id}`}
          className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-[16/9] bg-muted">
            {store.bannerImageUrl ? (
              <Image
                src={store.bannerImageUrl}
                alt={store.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 360px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Package className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            {store.logoUrl && (
              <div className="absolute left-3 top-3 h-9 w-9 overflow-hidden rounded-md bg-white/95 p-1 shadow">
                <div className="relative h-full w-full">
                  <Image
                    src={store.logoUrl}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="36px"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2 p-4">
            <h3 className="line-clamp-2 font-bold text-foreground transition-colors group-hover:text-violet-600">
              {store.name}
            </h3>
            {store.location && (
              <p className="text-sm text-muted-foreground">{store.location}</p>
            )}
            <ClosingBadge closesAt={store.closesAt} />
          </div>
        </Link>
      ))}
    </div>
  );
}
