"use server";

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

/**
 * Trigger payment flow for an invoice.
 * Creates Stripe PaymentIntent and stores stripePaymentIntentId on Invoice.
 * Returns clientSecret for frontend to confirm payment (Stripe Elements).
 */
export async function triggerPaymentFlow(
  invoiceId: string
): Promise<
  | { success: true; clientSecret?: string }
  | { error: string }
> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { buyer: { select: { stripeCustomerId: true } } },
  });

  if (!invoice) {
    return { error: "Invoice not found." };
  }

  if (invoice.status !== "PENDING") {
    return { error: `Invoice is not pending (status: ${invoice.status}).` };
  }

  if (invoice.stripePaymentIntentId) {
    // Payment already initiated - return existing client secret if needed
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (stripeSecret) {
      try {
        const stripe = new Stripe(stripeSecret);
        const pi = await stripe.paymentIntents.retrieve(
          invoice.stripePaymentIntentId
        );
        return { success: true, clientSecret: pi.client_secret ?? undefined };
      } catch {
        return { success: true };
      }
    }
    return { success: true };
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    console.warn("STRIPE_SECRET_KEY not set – skipping PaymentIntent creation");
    return { success: true };
  }

  const stripe = new Stripe(stripeSecret);
  const amountCents = Math.round(invoice.invoiceTotal * 100);
  if (amountCents < 50) {
    return { error: "Invoice amount too small for Stripe (min $0.50)." };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    customer: invoice.buyer.stripeCustomerId ?? undefined,
    metadata: { invoiceId },
    automatic_payment_methods: { enabled: true },
  });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { stripePaymentIntentId: paymentIntent.id },
  });

  return {
    success: true,
    clientSecret: paymentIntent.client_secret ?? undefined,
  };
}
