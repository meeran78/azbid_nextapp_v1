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
 * Check if the current buyer has a valid card stored in Stripe (required to place bids).
 */
export async function ensureBuyerHasValidCard(): Promise<
  { valid: true } | { valid: false; error: string }
> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return { valid: false, error: "Sign in to place a bid." };
  }
  if (session.user.role !== "BUYER") {
    return { valid: false, error: "Only buyers can place bids." };
  }
  const stripe = getStripe();
  if (!stripe) {
    return { valid: false, error: "Payments are not configured." };
  }
  const customerResult = await getOrCreateStripeCustomer(session.user.id);
  if ("error" in customerResult) {
    return { valid: false, error: customerResult.error };
  }
  const customer = await stripe.customers.retrieve(customerResult.customerId);
  if (customer.deleted) {
    return { valid: false, error: "Payment account is invalid." };
  }
  // Only card payment methods work for bid verification and off_session charge; Link etc. are not supported.
  const cardList = await stripe.paymentMethods.list({
    customer: (customer as Stripe.Customer).id,
    type: "card",
  });
  const hasCard = cardList.data.length > 0;
  if (!hasCard) {
    return {
      valid: false,
      error: "Add a valid payment method to place bids. We'll charge it only if you win.",
    };
  }
  return { valid: true };
}

/**
 * Create a $0.50 verification PaymentIntent (manual capture) so the buyer can confirm with CVC before placing a bid.
 * Call this when the user clicks "Place bid"; then show Stripe Elements to collect CVC. After confirm, call cancelBidVerificationAndPlaceBid.
 */
export async function createBidVerificationIntent(
  itemId: string
): Promise<
  | { clientSecret: string; paymentIntentId: string }
  | { error: string; requiresPaymentMethod?: boolean }
> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id || session.user.role !== "BUYER") {
    return { error: "Sign in as a buyer to place a bid." };
  }
  const check = await ensureBuyerHasValidCard();
  if (!check.valid) {
    return {
      error: check.error,
      requiresPaymentMethod: check.error.includes("Add a valid payment method"),
    };
  }
  const stripe = getStripe();
  if (!stripe) return { error: "Payments are not configured." };
  const customerResult = await getOrCreateStripeCustomer(session.user.id);
  if ("error" in customerResult) return { error: customerResult.error };
  const customer = await stripe.customers.retrieve(customerResult.customerId);
  if (customer.deleted) return { error: "Payment account is invalid." };
  // Bid verification and confirmCardPayment require a card; Link/default may be non-card.
  const cardList = await stripe.paymentMethods.list({
    customer: (customer as Stripe.Customer).id,
    type: "card",
  });
  const pmId = cardList.data[0]?.id ?? null;
  if (!pmId) {
    return {
      error: "Add a valid payment method to place bids.",
      requiresPaymentMethod: true,
    };
  }

  // Create a small manual-capture PaymentIntent for card verification before bidding.
  // We pass an explicit payment_method, so we don't need automatic_payment_methods here.
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 50, // $0.50 minimum for USD
    currency: "usd",
    customer: customerResult.customerId,
    payment_method: pmId,
    capture_method: "manual",
    metadata: {
      type: "bid_verification",
      itemId,
      userId: session.user.id,
    },
  });
  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Cancel the bid-verification PaymentIntent (no charge). Call after the user has confirmed with CVC; then the client should call placeBidAction.
 */
export async function cancelBidVerification(
  paymentIntentId: string
): Promise<{ success: true } | { error: string }> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return { error: "Session expired. Please sign in again." };
  }
  const stripe = getStripe();
  if (!stripe) return { error: "Payments are not configured." };
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (pi.metadata.type !== "bid_verification" || pi.metadata.userId !== session.user.id) {
    return { error: "Invalid verification. Please try again." };
  }
  if (pi.status === "requires_capture" || pi.status === "succeeded") {
    await stripe.paymentIntents.cancel(paymentIntentId);
  }
  return { success: true };
}

/**
 * After a SetupIntent succeeds, set the new payment method as the customer's default.
 * Call this from the client when confirmSetup succeeds (or when returning from redirect) so the card is used for bids/charges.
 */
export async function setDefaultPaymentMethodFromSetupIntent(
  setupIntentId: string
): Promise<{ success: true } | { error: string }> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) {
    return { error: "Not signed in." };
  }
  const stripe = getStripe();
  if (!stripe) {
    return { error: "Stripe is not configured." };
  }
  const setupIntent = await stripe.setupIntents.retrieve(setupIntentId, {
    expand: ["payment_method", "customer"],
  });
  const customerId =
    typeof setupIntent.customer === "string"
      ? setupIntent.customer
      : (setupIntent.customer as Stripe.Customer)?.id;
  const pmId =
    typeof setupIntent.payment_method === "string"
      ? setupIntent.payment_method
      : (setupIntent.payment_method as Stripe.PaymentMethod)?.id;
  if (!customerId || !pmId) {
    return { error: "SetupIntent missing customer or payment method." };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId || user.stripeCustomerId !== customerId) {
    return { error: "SetupIntent does not belong to your account." };
  }
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: pmId },
  });
  return { success: true };
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

  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  if (customer.deleted) {
    return { charged: false, reason: "Customer no longer valid." };
  }
  // Prefer customer's default payment method (set after SetupIntent), then first card.
  const defaultPmId =
    typeof customer.invoice_settings?.default_payment_method === "string"
      ? customer.invoice_settings.default_payment_method
      : (customer.invoice_settings?.default_payment_method as Stripe.PaymentMethod)?.id ?? null;
  const cardList = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });
  const defaultIsCard = defaultPmId
    ? cardList.data.some((pm) => pm.id === defaultPmId)
    : false;
  const pmId = defaultIsCard ? defaultPmId! : cardList.data[0]?.id ?? null;
  if (!pmId) {
    return { charged: false, reason: "No card on file for off-session charge." };
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
          data: { status: "PAID", paidAt: new Date(), paymentRequiresAction: false },
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
      // Seller payout is done in the payment_intent.succeeded webhook to avoid double transfer
      return { charged: true };
    }
    if (pi.status === "requires_action") {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { paymentRequiresAction: true },
      });
      return { charged: false, reason: "Payment requires customer action (e.g. 3DS)." };
    }
    return { charged: false, reason: `PaymentIntent status: ${pi.status}` };
  } catch (err: unknown) {
    const stripeErr = err as { code?: string; message?: string };
    const reason = stripeErr?.message ?? (err instanceof Error ? err.message : "Charge failed.");
    return { charged: false, reason };
  }
}
