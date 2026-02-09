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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { createSetupIntent, setDefaultPaymentMethodFromSetupIntent } from "@/actions/payment.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

function SetupForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsSubmitting(true);
    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/buyers-dashboard/payment-methods?setup=success`,
          payment_method_data: {
            billing_details: {},
          },
        },
      });
      if (error) {
        toast.error(error.message ?? "Failed to save card");
        setIsSubmitting(false);
        return;
      }
      if (setupIntent?.id) {
        const result = await setDefaultPaymentMethodFromSetupIntent(setupIntent.id);
        if ("error" in result) {
          toast.error(result.error);
          setIsSubmitting(false);
          return;
        }
      }
      toast.success("Card saved successfully.");
      onSuccess();
      router.refresh();
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
      <Button type="submit" disabled={!stripe || !elements || isSubmitting} className="w-full">
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : null}
        Save card
      </Button>
    </form>
  );
}

export function SaveCardForm() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createSetupIntent()
      .then((res) => {
        if ("error" in res) {
          setError(res.error);
          return;
        }
        if (res.clientSecret) setClientSecret(res.clientSecret);
      })
      .catch(() => setError("Failed to load form"))
      .finally(() => setLoading(false));
  }, []);

  if (!stripePromise) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm">
            Stripe is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive text-sm">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-sm">Could not create setup session.</p>
        </CardContent>
      </Card>
    );
  }

  const options = { clientSecret, appearance: { theme: "stripe" as const } };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Save a payment method</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add a card to pay for won auctions quickly. We’ll charge this card when you win (charge later).
        </p>
      </CardHeader>
      <CardContent>
        <Elements stripe={stripePromise} options={options}>
          <SetupForm onSuccess={() => {}} />
        </Elements>
      </CardContent>
    </Card>
  );
}
