import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { transferToSellerForInvoice } from "@/actions/stripe-connect.action";

/**
 * Stripe webhook – event sync.
 * Verify STRIPE_WEBHOOK_SECRET and handle:
 * - payment_intent.succeeded       → mark Invoice/Order PAID, create Payment, trigger seller payout
 * - payment_intent.payment_failed  → mark invoice as requiring action, record a FAILED Payment
 * - setup_intent.succeeded         → set payment method as default on customer
 * - charge.refunded                → on a full refund, mark Invoice/Order/Payment REFUNDED
 * - charge.dispute.created/.closed → log loudly (no dispute tracking table yet — see comment below)
 *
 * All handlers are idempotent: if the invoice is already PAID, the succeeded handler skips
 * the DB writes and payout so duplicate webhook deliveries are safe.
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

        // Idempotency guard: skip if already processed by chargeInvoiceWithStoredPayment.
        if (!invoice?.order || invoice.status === "PAID") break;

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

        // transferToSellerForInvoice is idempotent (checks sellerPayoutTransferId).
        const transferResult = await transferToSellerForInvoice(invoiceId);
        if (!transferResult.transferred && transferResult.reason) {
          console.warn("Seller payout (webhook):", transferResult.reason);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const invoiceId = pi.metadata?.invoiceId;
        const failureReason = pi.last_payment_error?.message ?? "Unknown error";
        console.warn(
          "Payment failed:",
          pi.id,
          failureReason,
          invoiceId ? `(invoice ${invoiceId})` : ""
        );
        if (invoiceId) {
          const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { order: { select: { id: true } } },
          });
          if (invoice?.order && invoice.status === "PENDING") {
            // Only "requires_action" (e.g. 3DS not completed) warrants the "additional
            // verification needed" messaging on the pay page — a plain decline (insufficient
            // funds, expired card, etc.) leaves the PI in requires_payment_method and should
            // NOT be mislabeled as requiring 3DS.
            const requiresAction = pi.status === "requires_action";
            await prisma.$transaction([
              prisma.invoice.update({
                where: { id: invoiceId },
                data: { paymentRequiresAction: requiresAction },
              }),
              prisma.payment.upsert({
                where: { orderId: invoice.order.id },
                create: {
                  orderId: invoice.order.id,
                  provider: "STRIPE",
                  providerRef: pi.id,
                  amount: invoice.invoiceTotal,
                  status: "FAILED",
                  failureReason,
                },
                update: {
                  providerRef: pi.id,
                  status: "FAILED",
                  failureReason,
                },
              }),
            ]);
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (!paymentIntentId) break;

        // charge.refunded fires for partial refunds too — `refunded` is only true once the
        // full charge amount has been refunded. We don't have a PARTIALLY_REFUNDED status,
        // so partial refunds are logged but don't change Invoice/Order/Payment state.
        if (!charge.refunded) {
          console.warn(
            `Partial refund on charge ${charge.id} (payment_intent ${paymentIntentId}): ` +
              `${charge.amount_refunded} of ${charge.amount} refunded. No DB status change.`
          );
          break;
        }

        const invoice = await prisma.invoice.findFirst({
          where: { stripePaymentIntentId: paymentIntentId },
          include: { order: { select: { id: true } } },
        });
        if (!invoice?.order || invoice.status === "REFUNDED") break;

        await prisma.$transaction([
          prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: "REFUNDED" },
          }),
          prisma.order.update({
            where: { id: invoice.order.id },
            data: { status: "REFUNDED" },
          }),
          prisma.payment.updateMany({
            where: { orderId: invoice.order.id },
            data: { status: "REFUNDED" },
          }),
        ]);

        // No automatic clawback of the seller payout — Stripe Connect transfer reversals need
        // a deliberate decision (who eats the loss), not an automatic one. Surface it loudly.
        if (invoice.sellerPayoutTransferId) {
          console.error(
            `REFUND ALERT: invoice ${invoice.id} was refunded but had already paid out to the ` +
              `seller (transfer ${invoice.sellerPayoutTransferId}). Manual review/clawback required.`
          );
        }
        break;
      }

      case "charge.dispute.created":
      case "charge.dispute.closed": {
        const dispute = event.data.object as Stripe.Dispute;
        const paymentIntentId =
          typeof dispute.payment_intent === "string"
            ? dispute.payment_intent
            : dispute.payment_intent?.id;
        const invoice = paymentIntentId
          ? await prisma.invoice.findFirst({
              where: { stripePaymentIntentId: paymentIntentId },
              select: { id: true, sellerPayoutTransferId: true, invoiceDisplayId: true },
            })
          : null;

        // No Dispute model/table yet — this is intentionally log-only so a dispute is never
        // silently missed. Wire up real alerting (Sentry/Slack/email) on this log line.
        console.error(
          `STRIPE DISPUTE ${event.type === "charge.dispute.created" ? "OPENED" : "CLOSED"}: ` +
            `dispute ${dispute.id}, status=${dispute.status}, reason=${dispute.reason}, ` +
            `amount=${dispute.amount} ${dispute.currency}, ` +
            `invoice=${invoice?.invoiceDisplayId ?? invoice?.id ?? "unknown"}` +
            (invoice?.sellerPayoutTransferId
              ? ` (already paid out to seller via transfer ${invoice.sellerPayoutTransferId} — manual review required)`
              : "")
        );
        break;
      }

      case "setup_intent.succeeded": {
        const si = event.data.object as Stripe.SetupIntent;
        const pmId =
          typeof si.payment_method === "string"
            ? si.payment_method
            : (si.payment_method as Stripe.PaymentMethod)?.id;
        const customerId =
          typeof si.customer === "string" ? si.customer : si.customer?.id;
        if (customerId && pmId) {
          await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: pmId },
          });
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
