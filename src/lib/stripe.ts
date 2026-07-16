import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

/**
 * Pinned explicitly so an SDK upgrade (e.g. `npm update stripe`) can never silently shift
 * which Stripe API version our requests target. Bump deliberately after testing.
 */
const STRIPE_API_VERSION = "2026-01-28.clover";

/** Server-side Stripe instance (uses STRIPE_SECRET_KEY). */
export function getStripe(): Stripe | null {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return null;
  if (!stripeInstance) {
    stripeInstance = new Stripe(secret, {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
    });
  }
  return stripeInstance;
}

/** Webhook signing secret for verifying Stripe events. */
export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}
