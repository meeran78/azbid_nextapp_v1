"use client";

import { useEffect, useState } from "react";
import { Hourglass } from "lucide-react";

type AuctionCountdownProps = {
  title: string;
  endAt: Date;
};

function pad(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

export function AuctionCountdown({ title, endAt }: AuctionCountdownProps) {
  const [diff, setDiff] = useState({ days: 0, hrs: 0, min: 0, sec: 0 });

  useEffect(() => {
    const update = () => {
      const end = new Date(endAt).getTime();
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
  }, [endAt]);

  return (
    <div className="mb-6 flex flex-col items-center text-center">
      {/* <h3 className="text-xl md:text-2xl font-bold">Auction Ends </h3>
      <p className="text-sm text-muted-foreground mt-1">{title}</p> */}

      <div className="mt-1 flex items-center justify-center gap-2 md:gap-3">
        <Hourglass className="h-6 w-6 md:h-8 md:w-8 text-primary shrink-0" />
        <span className="text-2xl md:text-4xl font-bold tabular-nums text-primary">
          {pad(diff.days)}
        </span>
        <span className="text-2xl md:text-4xl font-bold text-primary">:</span>
        <span className="text-2xl md:text-4xl font-bold tabular-nums text-primary">
          {pad(diff.hrs)}
        </span>
        <span className="text-2xl md:text-4xl font-bold text-primary">:</span>
        <span className="text-2xl md:text-4xl font-bold tabular-nums text-primary">
          {pad(diff.min)}
        </span>
        <span className="text-2xl md:text-4xl font-bold text-primary">:</span>
        <span className="text-2xl md:text-4xl font-bold tabular-nums text-primary">
          {pad(diff.sec)}
        </span>
      </div>

      <div className="mt-1 flex items-center justify-center gap-2 md:gap-3 text-[11px] md:text-xs text-muted-foreground uppercase tracking-wide">
        <span className="w-8 md:w-10 text-center invisible">icon</span>
        <span className="w-6 md:w-10 text-center">Days</span>
        <span className="w-2 text-center invisible">:</span>
        <span className="w-6 md:w-10 text-center">Hours</span>
        <span className="w-2 text-center invisible">:</span>
        <span className="w-6 md:w-10 text-center">Minutes</span>
        <span className="w-2 text-center invisible">:</span>
        <span className="w-6 md:w-10 text-center">Seconds</span>
      </div>
    </div>
  );
}
