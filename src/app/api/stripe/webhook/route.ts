import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Stripe webhook – event sync.
 * Verify STRIPE_WEBHOOK_SECRET and handle:
 * - payment_intent.succeeded → mark Invoice/Order PAID, create Payment
 * - payment_intent.payment_failed → log (optional notify)
 * - setup_intent.succeeded → set payment method as default on customer
 */
export async function POST(request: Request) {
  const secret = getStripeWebhookSecret();
  if (!secret) {
    console.warn("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("Stripe webhook signature verification failed:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const invoiceId = pi.metadata?.invoiceId;
        if (!invoiceId) break;
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId },
          include: { order: { select: { id: true } } },
        });
        if (invoice?.order) {
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
        }
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.warn("Payment failed:", pi.id, pi.last_payment_error?.message);
        break;
      }
      case "setup_intent.succeeded": {
        const si = event.data.object as Stripe.SetupIntent;
        const pmId =
          typeof si.payment_method === "string"
            ? si.payment_method
            : (si.payment_method as Stripe.PaymentMethod)?.id;
        const customerId = typeof si.customer === "string" ? si.customer : si.customer?.id;
        if (customerId && pmId) {
          await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: pmId },
          });
        }
        break;
      }
      default:
        // Unhandled event type
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json(
      { error: "Handler error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
