"use client";

import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import Link from "next/link";
import {
  createBidVerificationIntent,
  cancelBidVerification,
} from "@/actions/payment.action";
import { placeBidAction } from "@/actions/bid.action";
import {
  setCardVerifiedForBidSession,
  BID_VERIFY_PENDING_KEY,
} from "@/lib/bid-session";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type BidConfirmCvcModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  amount: number | null;
  onSuccess: () => void;
};

function buildCleanReturnUrl(): string {
  const u = new URL(window.location.href);
  u.searchParams.delete("payment_intent");
  u.searchParams.delete("payment_intent_client_secret");
  u.searchParams.delete("redirect_status");
  return u.toString();
}

function ConfirmCvcInner({
  paymentIntentId,
  itemId,
  amount,
  onVerifiedFlowComplete,
  onSuccess,
  onCancel,
}: {
  paymentIntentId: string;
  itemId: string;
  amount: number;
  onVerifiedFlowComplete: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const userId = session?.user?.id;
    if (!userId) {
      toast.error("Sign in to place a bid.");
      return;
    }
    setIsSubmitting(true);
    try {
      sessionStorage.setItem(
        BID_VERIFY_PENDING_KEY,
        JSON.stringify({ itemId, amount, paymentIntentId, userId })
      );
      const returnUrl = buildCleanReturnUrl();
      const { error: submitError } = await elements.submit();
      if (submitError) {
        sessionStorage.removeItem(BID_VERIFY_PENDING_KEY);
        toast.error(submitError.message ?? "Check your payment details");
        setIsSubmitting(false);
        return;
      }
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: returnUrl },
      });
      if (error) {
        sessionStorage.removeItem(BID_VERIFY_PENDING_KEY);
        toast.error(error.message ?? "Card verification failed");
        setIsSubmitting(false);
        return;
      }
      // Non-redirect completion: finish bid here. After a redirect, BidVerificationResume runs.
      sessionStorage.removeItem(BID_VERIFY_PENDING_KEY);
      const cancelResult = await cancelBidVerification(paymentIntentId);
      if ("error" in cancelResult) {
        toast.error(cancelResult.error);
        setIsSubmitting(false);
        return;
      }
      const bidResult = await placeBidAction(itemId, amount);
      if ("error" in bidResult) {
        toast.error(bidResult.error);
        setIsSubmitting(false);
        return;
      }
      onVerifiedFlowComplete();
      setCardVerifiedForBidSession(userId);
      toast.success("Bid placed successfully!");
      onSuccess();
    } catch (err) {
      sessionStorage.removeItem(BID_VERIFY_PENDING_KEY);
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Confirm your saved card (CVC if required). Stripe may open a secure window for 3D Secure.
        We won&apos;t charge you unless you win.
      </p>
      <PaymentElement
        options={{
          layout: "tabs",
          paymentMethodOrder: ["card"],
        }}
      />
      <DialogFooter className="gap-2 sm:gap-0">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !stripe || !elements}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CreditCard className="h-4 w-4 mr-2" />
          )}
          Verify card &amp; place bid ${amount.toFixed(2)}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ConfirmCvcStep({
  clientSecret,
  paymentIntentId,
  itemId,
  amount,
  onVerifiedFlowComplete,
  onSuccess,
  onCancel,
}: {
  clientSecret: string;
  paymentIntentId: string;
  itemId: string;
  amount: number;
  onVerifiedFlowComplete: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  if (!stripePromise) return null;
  const options = {
    clientSecret,
    appearance: { theme: "stripe" as const },
  };
  return (
    <Elements stripe={stripePromise} options={options}>
      <ConfirmCvcInner
        paymentIntentId={paymentIntentId}
        itemId={itemId}
        amount={amount}
        onVerifiedFlowComplete={onVerifiedFlowComplete}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}

export function BidConfirmCvcModal({
  open,
  onOpenChange,
  itemId,
  amount,
  onSuccess,
}: BidConfirmCvcModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requiresPaymentMethod, setRequiresPaymentMethod] = useState(false);
  const verifiedCompleteRef = useRef(false);
  const intentRequestSeq = useRef(0);

  useEffect(() => {
    if (open) {
      verifiedCompleteRef.current = false;
    }
  }, [open]);

  useEffect(() => {
    if (!open || !itemId || amount == null || amount <= 0) {
      setClientSecret(null);
      setPaymentIntentId(null);
      setError(null);
      setRequiresPaymentMethod(false);
      return;
    }
    const seq = ++intentRequestSeq.current;
    setLoading(true);
    setError(null);
    createBidVerificationIntent(itemId)
      .then((res) => {
        if (seq !== intentRequestSeq.current) return;
        if ("error" in res) {
          setError(res.error);
          setRequiresPaymentMethod(res.requiresPaymentMethod ?? false);
          return;
        }
        setClientSecret(res.clientSecret);
        setPaymentIntentId(res.paymentIntentId);
        setError(null);
      })
      .catch(() => {
        if (seq !== intentRequestSeq.current) return;
        setError("Could not load verification form");
      })
      .finally(() => {
        if (seq !== intentRequestSeq.current) return;
        setLoading(false);
      });
  }, [open, itemId, amount]);

  const handleVerifiedComplete = () => {
    verifiedCompleteRef.current = true;
  };

  const handleDialogOpenChange = (next: boolean) => {
    if (!next && !verifiedCompleteRef.current && paymentIntentId && clientSecret) {
      // Fire-and-forget cancel with error logging so orphaned holds don't accumulate.
      cancelBidVerification(paymentIntentId).then((result) => {
        if ("error" in result) {
          console.error("Failed to cancel bid verification PI:", paymentIntentId, result.error);
        }
      });
    }
    if (!next) {
      setClientSecret(null);
      setPaymentIntentId(null);
    }
    onOpenChange(next);
  };

  const handleSuccess = () => {
    handleDialogOpenChange(false);
    onSuccess();
  };

  if (!itemId || amount == null) return null;

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Confirm your bid</DialogTitle>
          <DialogDescription>
            Verify your payment method for your ${amount.toFixed(2)} bid. We&apos;ll charge your card only if you win.
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!stripePromise && !loading && (
          <p className="text-sm text-muted-foreground py-4">
            Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
          </p>
        )}

        {error && !loading && (
          <div className="space-y-3 py-4">
            <p className="text-sm text-destructive">{error}</p>
            {requiresPaymentMethod && (
              <Button asChild variant="default" size="sm">
                <Link href="/buyers-dashboard/payment-methods">
                  Add payment method
                </Link>
              </Button>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => handleDialogOpenChange(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}

        {clientSecret && paymentIntentId && !loading && stripePromise && (
          <ConfirmCvcStep
            clientSecret={clientSecret}
            paymentIntentId={paymentIntentId}
            itemId={itemId}
            amount={amount}
            onVerifiedFlowComplete={handleVerifiedComplete}
            onSuccess={handleSuccess}
            onCancel={() => handleDialogOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
