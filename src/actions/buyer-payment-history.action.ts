"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type BuyerPaymentWonItem = {
  itemId: string;
  itemTitle: string;
  itemImageUrl: string | null;
  winningBidAmount: number;
};

export type BuyerPaymentStatus = "PAID" | "FAILED" | "REFUNDED" | "PENDING";

export type BuyerPaymentEntry = {
  orderId: string;
  lotId: string;
  lotTitle: string;
  storeName: string;
  orderTotal: number;
  invoiceId: string | null;
  invoiceDisplayId: string | null;
  paymentStatus: BuyerPaymentStatus;
  paymentAmount: number | null;
  paymentDate: Date | null;
  providerRef: string | null;
  failureReason: string | null;
  requiresAction: boolean;
  items: BuyerPaymentWonItem[];
};

export type BuyerPaymentsResult = {
  successful: BuyerPaymentEntry[];
  failed: BuyerPaymentEntry[];
  pending: BuyerPaymentEntry[];
};

/**
 * Buyer-only. Every order the buyer has won, grouped by payment outcome, with the
 * won items that order's payment covers. `Payment` is 1:1 with `Order` (upserted in place
 * on retry), so only the current/latest attempt is visible — not a full retry history.
 */
export async function getBuyerPayments(): Promise<BuyerPaymentsResult> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "BUYER") redirect("/");

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      lot: { select: { id: true, title: true, store: { select: { name: true } } } },
      orderItems: {
        include: {
          item: { select: { id: true, title: true, imageUrls: true, winningBidAmount: true } },
        },
      },
      invoice: { select: { id: true, invoiceDisplayId: true, paidAt: true, paymentRequiresAction: true } },
      payment: true,
    },
  });

  const entries: BuyerPaymentEntry[] = orders.map((order) => {
    const paymentStatus: BuyerPaymentStatus = order.payment?.status ?? "PENDING";
    return {
      orderId: order.id,
      lotId: order.lot.id,
      lotTitle: order.lot.title,
      storeName: order.lot.store.name,
      orderTotal: order.total,
      invoiceId: order.invoice?.id ?? null,
      invoiceDisplayId: order.invoice?.invoiceDisplayId ?? null,
      paymentStatus,
      paymentAmount: order.payment?.amount ?? null,
      paymentDate: order.payment?.createdAt ?? order.invoice?.paidAt ?? null,
      providerRef: order.payment?.providerRef ?? null,
      failureReason: order.payment?.failureReason ?? null,
      requiresAction: order.invoice?.paymentRequiresAction ?? false,
      items: order.orderItems.map((oi) => ({
        itemId: oi.item.id,
        itemTitle: oi.item.title,
        itemImageUrl: oi.item.imageUrls?.[0] ?? null,
        winningBidAmount: oi.item.winningBidAmount ?? oi.subtotal,
      })),
    };
  });

  return {
    successful: entries.filter((e) => e.paymentStatus === "PAID" || e.paymentStatus === "REFUNDED"),
    failed: entries.filter((e) => e.paymentStatus === "FAILED"),
    pending: entries.filter((e) => e.paymentStatus === "PENDING"),
  };
}
