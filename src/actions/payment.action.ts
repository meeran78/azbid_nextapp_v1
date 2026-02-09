"use server";

import type Stripe from "stripe";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

/**
 * Get or create Stripe Customer for a user. Tracks customer in Stripe for charge later (off_session).
 */
export async function getOrCreateStripeCustomer(
  userId: string
): Promise<{ customerId: string } | { error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, stripeCustomerId: true, email: true, name: true },
  });
  if (!user) {
    return { error: "User not found." };
  }
  if (user.stripeCustomerId) {
    return { customerId: user.stripeCustomerId };
  }
  const stripe = getStripe();
  if (!stripe) {
    return { error: "Stripe is not configured." };
  }
  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });
  return { customerId: customer.id };
}

/**
 * Create a SetupIntent for saving a card (no charge). Use clientSecret with Stripe Elements to collect card; charge later via PaymentIntent (off_session).
 */
export async function createSetupIntent(): Promise<
  | { success: true; clientSecret: string }
  | { error: string }
> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return { error: "You must be signed in to save a payment method." };
  }
  const customerResult = await getOrCreateStripeCustomer(session.user.id);
  if ("error" in customerResult) {
    return { error: customerResult.error };
  }
  const stripe = getStripe();
  if (!stripe) {
    return { error: "Stripe is not configured." };
  }
  const setupIntent = await stripe.setupIntents.create({
    customer: customerResult.customerId,
    usage: "off_session",
    metadata: { userId: session.user.id },
    automatic_payment_methods: { enabled: true },
  });
  return {
    success: true,
    clientSecret: setupIntent.client_secret ?? "",
  };
}

/**
 * Trigger payment flow for an invoice.
 * Creates Stripe PaymentIntent (charge later / off_session) and stores stripePaymentIntentId on Invoice.
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
    include: { buyer: { select: { id: true, stripeCustomerId: true } } },
  });

  if (!invoice) {
    return { error: "Invoice not found." };
  }

  if (invoice.status !== "PENDING") {
    return { error: `Invoice is not pending (status: ${invoice.status}).` };
  }

  if (invoice.stripePaymentIntentId) {
    const stripe = getStripe();
    if (stripe) {
      try {
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

  const stripe = getStripe();
  if (!stripe) {
    console.warn("STRIPE_SECRET_KEY not set – skipping PaymentIntent creation");
    return { success: true };
  }

  let customerId = invoice.buyer.stripeCustomerId;
  if (!customerId) {
    const cust = await getOrCreateStripeCustomer(invoice.buyer.id);
    if ("error" in cust) {
      return { error: cust.error };
    }
    customerId = cust.customerId;
  }

  const amountCents = Math.round(invoice.invoiceTotal * 100);
  if (amountCents < 50) {
    return { error: "Invoice amount too small for Stripe (min $0.50)." };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    customer: customerId,
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

/**
 * Attempt to charge an invoice using the buyer's stored (default) payment method (off-session).
 * Called after lot close. If the customer has no default method or charge fails, invoice stays PENDING.
 */
export async function chargeInvoiceWithStoredPayment(
  invoiceId: string
): Promise<{ charged: true } | { charged: false; reason?: string }> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      buyer: { select: { stripeCustomerId: true } },
      order: { select: { id: true } },
    },
  });

  if (!invoice || !invoice.order) {
    return { charged: false, reason: "Invoice or order not found." };
  }
  if (invoice.status !== "PENDING") {
    return { charged: false, reason: `Invoice not pending (${invoice.status}).` };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { charged: false, reason: "Stripe not configured." };
  }

  const customerId = invoice.buyer.stripeCustomerId;
  if (!customerId) {
    return { charged: false, reason: "Buyer has no Stripe customer (no saved card)." };
  }

  let paymentIntentId = invoice.stripePaymentIntentId;
  if (!paymentIntentId) {
    const created = await triggerPaymentFlow(invoiceId);
    if ("error" in created) return { charged: false, reason: created.error };
    const inv = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { stripePaymentIntentId: true },
    });
    paymentIntentId = inv?.stripePaymentIntentId ?? null;
  }
  if (!paymentIntentId) {
    return { charged: false, reason: "No PaymentIntent for invoice." };
  }

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    return { charged: false, reason: "Customer no longer valid." };
  }
  const defaultPm =
    (customer as Stripe.Customer).invoice_settings?.default_payment_method ??
    (customer as Stripe.Customer).default_source;
  const pmId = typeof defaultPm === "string" ? defaultPm : defaultPm?.id ?? null;
  if (!pmId) {
    return { charged: false, reason: "No default payment method on file." };
  }

  try {
    const pi = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: pmId,
      off_session: true,
    });
    if (pi.status === "succeeded") {
      await prisma.$transaction([
        prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: "PAID", paidAt: new Date() },
        }),
        prisma.order.update({
          where: { id: invoice.order.id },
          data: { status: "PAID" },
        }),
        prisma.payment.upsert({
          where: { orderId: invoice.order.id },
          create: {
            orderId: invoice.order.id,
            provider: "STRIPE",
            providerRef: pi.id,
            amount: invoice.invoiceTotal,
            status: "PAID",
          },
          update: {
            providerRef: pi.id,
            amount: invoice.invoiceTotal,
            status: "PAID",
          },
        }),
      ]);
      return { charged: true };
    }
    if (pi.status === "requires_action") {
      return { charged: false, reason: "Payment requires customer action (e.g. 3DS)." };
    }
    return { charged: false, reason: `PaymentIntent status: ${pi.status}` };
  } catch (err: unknown) {
    const stripeErr = err as { code?: string; message?: string };
    const reason = stripeErr?.message ?? (err instanceof Error ? err.message : "Charge failed.");
    return { charged: false, reason };
  }
}
