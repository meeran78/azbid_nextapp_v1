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
  const customer = await stripe.customers.create(
    {
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    },
    { idempotencyKey: `customer-create-${userId}` }
  );
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
  | { valid: true }
  | { valid: false; error: string; suggestAddCard?: boolean }
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

  // List cards in a single call — avoids the extra customer.retrieve + expand round-trip.
  const cardList = await stripe.paymentMethods.list({
    customer: customerResult.customerId,
    type: "card",
  });
  if (cardList.data.length > 0) {
    return { valid: true };
  }

  // No cards found — check whether the default method is a non-card (e.g. Link) to give a
  // more specific error message.
  const customer = await stripe.customers.retrieve(customerResult.customerId, {
    expand: ["invoice_settings.default_payment_method"],
  });
  if (customer.deleted) {
    return { valid: false, error: "Payment account is invalid." };
  }
  const cust = customer as Stripe.Customer;
  const rawDefault = cust.invoice_settings?.default_payment_method;
  let defaultPaymentMethodType: string | undefined;
  if (typeof rawDefault === "object" && rawDefault && "type" in rawDefault) {
    defaultPaymentMethodType = (rawDefault as Stripe.PaymentMethod).type;
  } else if (typeof rawDefault === "string") {
    const pm = await stripe.paymentMethods.retrieve(rawDefault);
    defaultPaymentMethodType = pm.type;
  }

  if (defaultPaymentMethodType && defaultPaymentMethodType !== "card") {
    return {
      valid: false,
      suggestAddCard: true,
      error:
        "A debit or credit card is required to bid. You saved a non-card method (for example Link). Add a card on Payment methods.",
    };
  }

  return {
    valid: false,
    suggestAddCard: true,
    error: "Add a card to place bids. We'll charge it only if you win.",
  };
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
      requiresPaymentMethod: check.suggestAddCard === true,
    };
  }
  const stripe = getStripe();
  if (!stripe) return { error: "Payments are not configured." };
  const customerResult = await getOrCreateStripeCustomer(session.user.id);
  if ("error" in customerResult) return { error: customerResult.error };
  const customer = await stripe.customers.retrieve(customerResult.customerId);
  if (customer.deleted) return { error: "Payment account is invalid." };

  // Small manual-capture PI for bid verification. No payment_method here — the client confirms
  // with Payment Element so buyers pick a saved card and enter CVC / 3DS when required.
  // Idempotency key is bucketed per-minute so an accidental double-invocation (e.g. a duplicate
  // click or effect re-fire) reuses the same PI, while a genuinely later attempt gets a fresh one.
  const idempotencyBucket = Math.floor(Date.now() / 60_000);
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: 50, // $0.50 minimum for USD
      currency: "usd",
      customer: customerResult.customerId,
      capture_method: "manual",
      confirmation_method: "automatic",
      payment_method_types: ["card"],
      metadata: {
        type: "bid_verification",
        itemId,
        userId: session.user.id,
      },
    },
    { idempotencyKey: `bid-verify-${session.user.id}-${itemId}-${idempotencyBucket}` }
  );
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
  let pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (pi.metadata.type !== "bid_verification" || pi.metadata.userId !== session.user.id) {
    return { error: "Invalid verification. Please try again." };
  }
  if (pi.status === "canceled") {
    return { success: true };
  }

  // Intent can be briefly "processing" right after client confirmation.
  // Poll up to 3 times with a short back-off rather than a tight busy loop.
  for (let attempt = 0; attempt < 3 && pi.status === "processing"; attempt++) {
    await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  }

  if (pi.status === "canceled") {
    return { success: true };
  }
  if (pi.status === "processing") {
    return {
      error:
        "Card verification is still processing. Wait a few seconds and try your bid again.",
    };
  }

  // "requires_capture" is the only status that means the buyer actually completed CVC/3DS
  // confirmation successfully (the manual-capture authorization succeeded and is on hold).
  // We record this server-side — placeBidAction checks it directly rather than trusting any
  // client-supplied "verified" flag, which is what previously made verification bypassable.
  const wasSuccessfullyAuthorized = pi.status === "requires_capture";

  // Void authorization or abandon an unconfirmed intent.
  const cancelable: Stripe.PaymentIntent.Status[] = [
    "requires_payment_method",
    "requires_confirmation",
    "requires_capture",
    "requires_action",
  ];
  if (!cancelable.includes(pi.status)) {
    return { success: true };
  }
  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
  } catch {
    const again = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (again.status !== "canceled") {
      return { error: "Could not release card verification. Try again or contact support." };
    }
  }

  if (wasSuccessfullyAuthorized) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { cardVerifiedAt: new Date() },
    });
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

  // Only act on a completed setup — a failed or processing intent must not set the PM.
  if (setupIntent.status !== "succeeded") {
    return { error: "SetupIntent has not succeeded." };
  }

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
  const idempotencyBucket = Math.floor(Date.now() / 60_000);
  const setupIntent = await stripe.setupIntents.create(
    {
      customer: customerResult.customerId,
      usage: "off_session",
      metadata: { userId: session.user.id },
      // Card-only so bidding + ensureBuyerHasValidCard (card list) stay in sync. Link-only saves looked "successful" but failed bid checks.
      payment_method_types: ["card"],
    },
    { idempotencyKey: `setup-intent-${session.user.id}-${idempotencyBucket}` }
  );
  return {
    success: true,
    clientSecret: setupIntent.client_secret ?? "",
  };
}

/**
 * Trigger payment flow for an invoice.
 * Creates a Stripe PaymentIntent (card-only, for off-session compatibility) and stores
 * stripePaymentIntentId on the Invoice. Returns clientSecret for frontend confirmation.
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
        // If the existing PI is in a terminal/non-usable state, fall through to create a new one.
        const reusable: Stripe.PaymentIntent.Status[] = [
          "requires_payment_method",
          "requires_confirmation",
          "requires_action",
          "processing",
          "succeeded",
        ];
        if (reusable.includes(pi.status)) {
          return { success: true, clientSecret: pi.client_secret ?? undefined };
        }
        // PI is canceled or otherwise terminal — create a fresh one below.
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { stripePaymentIntentId: null },
        });
      } catch {
        // PI not found in Stripe — clear it and create fresh.
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { stripePaymentIntentId: null },
        });
      }
    } else {
      return { success: true };
    }
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

  // Use payment_method_types: ["card"] (not automatic_payment_methods) so this PI can be
  // confirmed off-session without Stripe requiring a return_url.
  // Deterministic idempotency key: a concurrent/retried call for the same invoice always
  // resolves to the same PaymentIntent at the Stripe API layer, on top of the DB-level reuse
  // check above.
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency: "usd",
      customer: customerId,
      payment_method_types: ["card"],
      metadata: { invoiceId },
    },
    { idempotencyKey: `invoice-payment-${invoiceId}` }
  );

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

  // If the stored PI is in a terminal state (e.g. canceled), it cannot be confirmed —
  // clear it and create a fresh one.
  const existingPi = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (existingPi.status === "canceled") {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { stripePaymentIntentId: null },
    });
    const refreshed = await triggerPaymentFlow(invoiceId);
    if ("error" in refreshed) return { charged: false, reason: refreshed.error };
    const inv = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { stripePaymentIntentId: true },
    });
    paymentIntentId = inv?.stripePaymentIntentId ?? null;
    if (!paymentIntentId) return { charged: false, reason: "Could not create new PaymentIntent." };
  }

  const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
  if (customer.deleted) {
    return { charged: false, reason: "Customer no longer valid." };
  }

  // Prefer customer's default payment method, then first available card.
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
    const pi = await stripe.paymentIntents.confirm(
      paymentIntentId,
      {
        payment_method: pmId,
        off_session: true,
      },
      { idempotencyKey: `confirm-${paymentIntentId}` }
    );
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
      // Seller payout is triggered by the payment_intent.succeeded webhook to avoid double transfer.
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
