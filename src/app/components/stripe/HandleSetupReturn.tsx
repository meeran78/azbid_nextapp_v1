"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setDefaultPaymentMethodFromSetupIntent } from "@/actions/payment.action";
import { toast } from "sonner";

/**
 * When Stripe redirects back after confirmSetup (e.g. 3DS), URL contains setup_intent and redirect_status.
 * We set the new payment method as default and clear the URL.
 */
export function HandleSetupReturn({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    const setupIntentId = searchParams.get("setup_intent");
    const redirectStatus = searchParams.get("redirect_status");
    if (handled || !setupIntentId || redirectStatus !== "succeeded") return;

    let cancelled = false;
    setDefaultPaymentMethodFromSetupIntent(setupIntentId)
      .then((result) => {
        if (cancelled) return;
        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success("Card saved successfully.");
        }
        setHandled(true);
        window.history.replaceState(
          {},
          "",
          window.location.pathname
        );
        router.refresh();
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to save card.");
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, handled]);

  return <>{children}</>;
}
