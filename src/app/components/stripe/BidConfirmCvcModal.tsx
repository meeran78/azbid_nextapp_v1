"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
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
import { createBidVerificationIntent, cancelBidVerification } from "@/actions/payment.action";
import { placeBidAction } from "@/actions/bid.action";
import { setCardVerifiedForBidSession } from "@/lib/bid-session";
import { toast } from "sonner";

const stripePromise =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
    : null;

type BidConfirmCvcModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
  amount: number | null;
  onSuccess: () => void;
};

function ConfirmCvcStep({
  clientSecret,
  paymentIntentId,
  itemId,
  amount,
  onSuccess,
  onCancel,
}: {
  clientSecret: string;
  paymentIntentId: string;
  itemId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!stripePromise) return;
    setIsSubmitting(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        toast.error("Payment service unavailable");
        setIsSubmitting(false);
        return;
      }
      const { error } = await stripe.confirmCardPayment(clientSecret);
      if (error) {
        toast.error(error.message ?? "Card verification failed");
        setIsSubmitting(false);
        return;
      }
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
      setCardVerifiedForBidSession();
      toast.success("Bid placed successfully!");
      onSuccess();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Click below to verify your card with CVC. Stripe may open a secure form or 3D Secure window. We won’t charge you unless you win.
      </p>
      <DialogFooter className="gap-2 sm:gap-0">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CreditCard className="h-4 w-4 mr-2" />
          )}
          Verify card & place bid ${amount.toFixed(2)}
        </Button>
      </DialogFooter>
    </div>
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

  useEffect(() => {
    if (!open || !itemId || amount == null || amount <= 0) {
      setClientSecret(null);
      setPaymentIntentId(null);
      setError(null);
      setRequiresPaymentMethod(false);
      return;
    }
    setLoading(true);
    setError(null);
    createBidVerificationIntent(itemId)
      .then((res) => {
        if ("error" in res) {
          setError(res.error);
          setRequiresPaymentMethod(res.requiresPaymentMethod ?? false);
          return;
        }
        setClientSecret(res.clientSecret);
        setPaymentIntentId(res.paymentIntentId);
        setError(null);
      })
      .catch(() => setError("Could not load verification form"))
      .finally(() => setLoading(false));
  }, [open, itemId, amount]);

  const handleSuccess = () => {
    onOpenChange(false);
    setClientSecret(null);
    setPaymentIntentId(null);
    onSuccess();
  };

  const handleCancel = () => {
    onOpenChange(false);
    setClientSecret(null);
    setPaymentIntentId(null);
  };

  if (!itemId || amount == null) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm your bid</DialogTitle>
          <DialogDescription>
            Enter your card CVC to verify your payment method. We’ll charge your card only if you win (${amount.toFixed(2)} bid).
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
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
              <Button variant="outline" onClick={handleCancel}>
                Close
              </Button>
            </DialogFooter>
          </div>
        )}

        {clientSecret && paymentIntentId && !loading && (
          <ConfirmCvcStep
            clientSecret={clientSecret}
            paymentIntentId={paymentIntentId}
            itemId={itemId}
            amount={amount}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
