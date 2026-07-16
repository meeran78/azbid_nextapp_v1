import { loadStripe } from "@stripe/stripe-js";

/** Shared client-side Stripe.js instance — load once, reuse across every Elements usage. */
export const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;
