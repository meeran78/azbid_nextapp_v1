"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cancelBidVerification } from "@/actions/payment.action";
import { placeBidAction } from "@/actions/bid.action";
import { BID_VERIFY_PENDING_KEY } from "@/lib/bid-session";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

/**
 * After Stripe confirmPayment redirect (e.g. 3DS), Stripe adds payment_intent params to return_url.
 * Complete cancel verification PI + placeBid using sessionStorage written before redirect.
 *
 * redirect_status values:
 * - "succeeded"   → payment confirmed; proceed to cancel + bid
 * - "processing"  → payment not yet confirmed; show error and wait
 * - "failed"      → payment failed; show error
 */
export function BidVerificationResume() {
  const router = useRouter();
  const { data: session } = useSession();
  const handledPiRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const piFromUrl = params.get("payment_intent");
    if (!piFromUrl || handledPiRef.current === piFromUrl) return;

    const raw = sessionStorage.getItem(BID_VERIFY_PENDING_KEY);
    if (!raw) return;

    let pending: {
      itemId: string;
      amount: number;
      paymentIntentId: string;
      userId?: string;
    };
    try {
      pending = JSON.parse(raw);
    } catch {
      return;
    }

    if (pending.paymentIntentId !== piFromUrl) return;

    const lockKey = `azbid_bid_verify_lock_${piFromUrl}`;
    if (sessionStorage.getItem(lockKey)) return;
    sessionStorage.setItem(lockKey, "1");
    handledPiRef.current = piFromUrl;

    const cleanupUrl = () => {
      params.delete("payment_intent");
      params.delete("payment_intent_client_secret");
      params.delete("redirect_status");
      const qs = params.toString();
      const path = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
      window.history.replaceState({}, "", path);
    };

    const redirectStatus = params.get("redirect_status");

    if (redirectStatus === "failed") {
      sessionStorage.removeItem(BID_VERIFY_PENDING_KEY);
      sessionStorage.removeItem(lockKey);
      cleanupUrl();
      toast.error("Card verification failed. Please try again.");
      return;
    }

    // "processing" means Stripe hasn't confirmed the payment yet — placing the bid now
    // would be premature. Tell the user to wait and retry manually.
    if (redirectStatus === "processing") {
      sessionStorage.removeItem(BID_VERIFY_PENDING_KEY);
      sessionStorage.removeItem(lockKey);
      cleanupUrl();
      toast.error(
        "Card verification is still processing. Wait a moment, then try placing your bid again."
      );
      return;
    }

    // "succeeded" (or any other redirect_status): proceed to cancel the hold and place the bid.
    const toastId = toast.loading("Completing your bid…");

    (async () => {
      try {
        const cancelResult = await cancelBidVerification(piFromUrl);
        if ("error" in cancelResult) {
          toast.dismiss(toastId);
          toast.error(cancelResult.error);
          sessionStorage.removeItem(BID_VERIFY_PENDING_KEY);
          sessionStorage.removeItem(lockKey);
          cleanupUrl();
          return;
        }
        const bidResult = await placeBidAction(pending.itemId, pending.amount);
        if ("error" in bidResult) {
          toast.dismiss(toastId);
          toast.error(bidResult.error);
          sessionStorage.removeItem(BID_VERIFY_PENDING_KEY);
          sessionStorage.removeItem(lockKey);
          cleanupUrl();
          return;
        }
        sessionStorage.removeItem(BID_VERIFY_PENDING_KEY);
        sessionStorage.removeItem(lockKey);
        toast.dismiss(toastId);
        toast.success("Bid placed successfully!");
        cleanupUrl();
        router.refresh();
      } catch {
        toast.dismiss(toastId);
        toast.error("Something went wrong placing your bid. Please try again.");
        sessionStorage.removeItem(BID_VERIFY_PENDING_KEY);
        sessionStorage.removeItem(lockKey);
        cleanupUrl();
      }
    })();
  }, [router, session?.user?.id]);

  return null;
}
