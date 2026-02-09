"use client";

import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { triggerPaymentFlow } from "@/actions/payment.action";
import { toast } from "sonner";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function ConfirmPaymentForm({
  clientSecret,
  returnUrl,
  orderTotal,
  onSuccess,
}: {
  clientSecret: string;
  returnUrl: string;
  orderTotal: number;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
          payment_method_data: {
            billing_details: {},
          },
        },
      });
      if (error) {
        toast.error(error.message ?? "Payment failed");
        return;
      }
      onSuccess();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
          paymentMethodOrder: ["card"],
        }}
      />
      <Button type="submit" disabled={!stripe || !elements || isSubmitting} className="w-full bg-violet-600 hover:bg-violet-700">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <CreditCard className="h-4 w-4 mr-2" />
        )}
        Pay ${orderTotal.toFixed(2)}
      </Button>
    </form>
  );
}

export function PayWithStripeForm({
  invoiceId,
  returnUrl,
  orderTotal,
  onSuccess,
}: {
  invoiceId: string;
  returnUrl: string;
  orderTotal: number;
  onSuccess: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    triggerPaymentFlow(invoiceId)
      .then((res) => {
        if ("error" in res) {
          setError(res.error);
          return;
        }
        if (res.clientSecret) setClientSecret(res.clientSecret);
        else setError("No payment session. Invoice may already be paid.");
      })
      .catch(() => setError("Failed to load payment form"))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (!stripePromise) {
    return (
      <p className="text-muted-foreground text-sm">
        Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive text-sm">{error}</p>
    );
  }

  if (!clientSecret) {
    return (
      <p className="text-muted-foreground text-sm">
        Unable to start payment. You may have already paid or the session expired.
      </p>
    );
  }

  const options = { clientSecret, appearance: { theme: "stripe" as const } };

  return (
    <Elements stripe={stripePromise} options={options}>
      <ConfirmPaymentForm
        clientSecret={clientSecret}
        returnUrl={returnUrl}
        orderTotal={orderTotal}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}
