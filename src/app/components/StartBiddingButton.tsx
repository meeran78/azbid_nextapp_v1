"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export const StartBiddingButton = () => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Button size="lg" className="opacity-50" asChild>
        <span>Get Started</span>
      </Button>
    );
  }

  const href = session ? "/" : "/sign-in";

  return (
    <div className="flex flex-col items-center gap-4">
      <Button className="rounded-xl bg-orange-500 px-8 py-8 text-lg font-semibold hover:bg-orange-600 transition">
        <Link href={href}>Start Bidding</Link>
      </Button>


     
    </div>
  );
};