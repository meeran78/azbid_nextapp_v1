import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/** Server-side Stripe instance (uses STRIPE_SECRET_KEY). */
export function getStripe(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  if (!stripeInstance) {
    stripeInstance = new Stripe(secret);
  }
  return stripeInstance;
}

/** Webhook signing secret for verifying Stripe events. */
export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}

/** Publishable key for client-side Stripe.js (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY). */
export function getStripePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;
}
