"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface LotCountdownProps {
  closesAt: Date;
}

function pad(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

export function LotCountdown({ closesAt }: LotCountdownProps) {
  const [diff, setDiff] = useState({ days: 0, hrs: 0, min: 0, sec: 0 });

  useEffect(() => {
    const update = () => {
      const end = new Date(closesAt).getTime();
      const now = Date.now();
      const total = Math.max(0, end - now);
      setDiff({
        days: total / (1000 * 60 * 60 * 24),
        hrs: (total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        min: (total % (1000 * 60 * 60)) / (1000 * 60),
        sec: (total % (1000 * 60)) / 1000,
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [closesAt]);

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-violet-500 shrink-0" />
      <div className="flex gap-1.5">
        <div className="rounded-md border bg-muted/50 px-2 py-1.5 min-w-[2.5rem] text-center">
          <span className="text-sm font-semibold tabular-nums">{pad(diff.days)}</span>
          <span className="block text-[10px] text-muted-foreground uppercase">Days</span>
        </div>
        <div className="rounded-md border bg-muted/50 px-2 py-1.5 min-w-[2.5rem] text-center">
          <span className="text-sm font-semibold tabular-nums">{pad(diff.hrs)}</span>
          <span className="block text-[10px] text-muted-foreground uppercase">Hrs</span>
        </div>
        <div className="rounded-md border bg-muted/50 px-2 py-1.5 min-w-[2.5rem] text-center">
          <span className="text-sm font-semibold tabular-nums">{pad(diff.min)}</span>
          <span className="block text-[10px] text-muted-foreground uppercase">Min</span>
        </div>
        <div className="rounded-md border bg-muted/50 px-2 py-1.5 min-w-[2.5rem] text-center">
          <span className="text-sm font-semibold tabular-nums">{pad(diff.sec)}</span>
          <span className="block text-[10px] text-muted-foreground uppercase">Sec</span>
        </div>
      </div>
    </div>
  );
}
