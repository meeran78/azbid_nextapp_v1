"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

const DEFAULT_COMMISSION_PCT = 10;

/**
 * Get or create a Stripe Connect Express account for the current seller.
 * Returns the connected account ID. Caller can then create an account link for onboarding.
 */
export async function getOrCreateConnectAccount(
  userId: string
): Promise<{ accountId: string } | { error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, stripeConnectAccountId: true, email: true, name: true },
  });
  if (!user) return { error: "User not found." };
  if (user.stripeConnectAccountId) {
    return { accountId: user.stripeConnectAccountId };
  }
  const stripe = getStripe();
  if (!stripe) return { error: "Stripe is not configured." };
  const account = await stripe.accounts.create({
    type: "express",
    country: "US",
    email: user.email ?? undefined,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { userId: user.id },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stripeConnectAccountId: account.id },
  });
  return { accountId: account.id };
}

/**
 * Create an account link for Stripe Connect onboarding. Redirect the seller to the returned URL.
 * returnUrl and refreshUrl should point to your seller dashboard (e.g. /my-auctions/payouts).
 */
export async function createConnectAccountLink(
  returnUrl: string,
  refreshUrl: string
): Promise<{ url: string } | { error: string }> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session?.user?.id) return { error: "Sign in to connect Stripe." };
  const stripe = getStripe();
  if (!stripe) return { error: "Stripe is not configured." };

  const result = await getOrCreateConnectAccount(session.user.id);
  if ("error" in result) return result;

  const link = await stripe.accountLinks.create({
    account: result.accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
  return { url: link.url };
}

/** Clamp commission to 0–100; treat NaN/invalid as default. */
function resolveCommissionPct(sellerPct: number | null | undefined): number {
  if (sellerPct != null && Number.isFinite(sellerPct)) {
    return Math.min(100, Math.max(0, sellerPct));
  }
  if (typeof process.env.PLATFORM_COMMISSION_PCT === "string") {
    const n = Number.parseFloat(process.env.PLATFORM_COMMISSION_PCT);
    if (Number.isFinite(n)) return Math.min(100, Math.max(0, n));
  }
  return DEFAULT_COMMISSION_PCT;
}

/**
 * Transfer seller payout to their Stripe Connect account after an invoice is paid.
 * Payout = winningBidAmount * (1 - commissionPct/100). Platform keeps buyer premium + commission.
 * Idempotent: if sellerPayoutTransferId is already set, skips transfer and returns that transferId.
 */
export async function transferToSellerForInvoice(
  invoiceId: string
): Promise<{ transferred: true; transferId: string } | { transferred: false; reason?: string }> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      seller: { select: { id: true, stripeConnectAccountId: true, commissionPct: true } },
    },
  });
  if (!invoice || invoice.status !== "PAID") {
    return { transferred: false, reason: "Invoice not found or not paid." };
  }
  if (invoice.sellerPayoutTransferId) {
    return { transferred: true, transferId: invoice.sellerPayoutTransferId };
  }
  const accountId = invoice.seller?.stripeConnectAccountId;
  if (!accountId) {
    return { transferred: false, reason: "Seller has not connected Stripe for payouts." };
  }

  const commissionPct = resolveCommissionPct(invoice.seller.commissionPct);
  const sellerPayout = invoice.winningBidAmount * (1 - commissionPct / 100);
  const amountCents = Math.round(sellerPayout * 100);
  if (amountCents <= 0) {
    return { transferred: false, reason: "Payout amount is zero." };
  }

  const stripe = getStripe();
  if (!stripe) return { transferred: false, reason: "Stripe not configured." };

  try {
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: "usd",
      destination: accountId,
      description: `Payout for invoice ${invoice.invoiceDisplayId ?? invoiceId}`,
      metadata: { invoiceId, sellerId: invoice.sellerId },
    });
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { sellerPayoutTransferId: transfer.id },
    });
    return { transferred: true, transferId: transfer.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Transfer failed.";
    console.error("Stripe Connect transfer failed:", err);
    return { transferred: false, reason: msg };
  }
}

/**
 * Check if the current user (seller) has completed Stripe Connect onboarding.
 * Optionally pass userId for server-side checks.
 */
export async function getConnectAccountStatus(
  userId?: string
): Promise<
  | { connected: true; accountId: string }
  | { connected: false; hasAccount?: boolean; error?: string }
> {
  const uid =
    userId ??
    (await (async () => {
      const h = await headers();
      const s = await auth.api.getSession({ headers: h });
      return s?.user?.id;
    })()) ?? undefined;
  if (!uid) return { connected: false, error: "Not signed in." };
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: { stripeConnectAccountId: true },
  });
  if (!user?.stripeConnectAccountId) {
    return { connected: false, hasAccount: false };
  }
  const stripe = getStripe();
  if (!stripe) return { connected: false, error: "Stripe not configured." };
  try {
    const account = await stripe.accounts.retrieve(user.stripeConnectAccountId);
    const canReceivePayouts = account.payouts_enabled === true;
    if (!canReceivePayouts) {
      return { connected: false, hasAccount: true };
    }
    return { connected: true, accountId: user.stripeConnectAccountId };
  } catch {
    return { connected: false, hasAccount: true };
  }
}
