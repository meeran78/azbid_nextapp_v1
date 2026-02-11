"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type BuyerActiveBid = {
  bidId: string;
  bidAmount: number;
  bidAt: Date;
  itemId: string;
  itemTitle: string;
  itemImageUrls: string[];
  currentPrice: number | null;
  isLeading: boolean;
  lotId: string;
  lotTitle: string;
  lotClosesAt: Date;
  lotStatus: string;
  storeName: string;
};

export type BuyerWonItem = {
  itemId: string;
  itemTitle: string;
  itemImageUrls: string[];
  winningBidAmount: number;
  lotId: string;
  lotTitle: string;
  orderId: string;
  orderTotal: number;
  orderStatus: string;
  invoiceId: string | null;
  invoiceStatus: string | null;
  invoiceTotal: number | null;
};

export type BuyerWonOrderItem = {
  itemId: string;
  itemTitle: string;
  itemImageUrls: string[];
  winningBidAmount: number;
};

export type BuyerWonOrder = {
  orderId: string;
  lotId: string;
  lotTitle: string;
  orderTotal: number;
  orderStatus: string;
  invoiceId: string | null;
  invoiceStatus: string | null;
  invoiceTotal: number | null;
  items: BuyerWonOrderItem[];
};

export type BuyerLostBid = {
  bidId: string;
  bidAmount: number;
  bidAt: Date;
  itemId: string;
  itemTitle: string;
  itemImageUrls: string[];
  lotId: string;
  lotTitle: string;
  lotStatus: string;
  winningAmount: number | null;
  wasOutbid: boolean;
};

/**
 * Get current user's active bids (lots still LIVE, item not yet won).
 */
export async function getBuyerActiveBids(): Promise<BuyerActiveBid[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "BUYER") redirect("/");

  const bids = await prisma.bid.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      item: {
        include: {
          lot: {
            include: {
              store: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  const active: BuyerActiveBid[] = [];
  for (const bid of bids) {
    const lot = bid.item.lot;
    const item = bid.item;
    if (lot.status !== "LIVE" || item.winningBidId != null) continue;

    const currentPrice = item.currentPrice ?? item.startPrice;
    const isLeading = bid.amount >= currentPrice;

    active.push({
      bidId: bid.id,
      bidAmount: bid.amount,
      bidAt: bid.createdAt,
      itemId: item.id,
      itemTitle: item.title,
      itemImageUrls: item.imageUrls,
      currentPrice: item.currentPrice ?? item.startPrice,
      isLeading,
      lotId: lot.id,
      lotTitle: lot.title,
      lotClosesAt: lot.closesAt,
      lotStatus: lot.status,
      storeName: lot.store.name,
    });
  }

  return active.sort(
    (a, b) => new Date(a.lotClosesAt).getTime() - new Date(b.lotClosesAt).getTime()
  );
}

/**
 * Get items the current user has won (winning bid on item).
 */
export async function getBuyerWonItems(): Promise<BuyerWonItem[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "BUYER") redirect("/");

  const items = await prisma.item.findMany({
    where: {
      winningBidId: { not: null },
      winningBid: { userId: session.user.id },
    },
    include: {
      lot: { select: { id: true, title: true } },
      winningBid: { select: { amount: true } },
      orderItems: {
        include: {
          order: {
            include: {
              invoice: { select: { id: true, status: true, invoiceTotal: true } },
            },
          },
        },
      },
    },
  });

  const won: BuyerWonItem[] = [];
  for (const item of items) {
    const orderItem = item.orderItems[0];
    const order = orderItem?.order;
    const invoice = order?.invoice;

    won.push({
      itemId: item.id,
      itemTitle: item.title,
      itemImageUrls: item.imageUrls,
      winningBidAmount: item.winningBid?.amount ?? item.winningBidAmount ?? 0,
      lotId: item.lot.id,
      lotTitle: item.lot.title,
      orderId: order?.id ?? "",
      orderTotal: order?.total ?? 0,
      orderStatus: order?.status ?? "PENDING",
      invoiceId: invoice?.id ?? null,
      invoiceStatus: invoice?.status ?? null,
      invoiceTotal: invoice?.invoiceTotal ?? null,
    });
  }

  return won.sort((a, b) => (a.orderId > b.orderId ? -1 : 1));
}

/**
 * Get orders the current user has won (grouped by order / lot).
 */
export async function getBuyerWonOrders(): Promise<BuyerWonOrder[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "BUYER") redirect("/");

  const orders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      lot: { select: { id: true, title: true } },
      orderItems: {
        include: {
          item: {
            select: {
              id: true,
              title: true,
              imageUrls: true,
              winningBidAmount: true,
            },
          },
        },
      },
      invoice: { select: { id: true, status: true, invoiceTotal: true } },
    },
  });

  return orders
    .filter((o) => o.orderItems.some((oi) => oi.item.winningBidAmount != null))
    .map((order) => ({
      orderId: order.id,
      lotId: order.lotId,
      lotTitle: order.lot.title,
      orderTotal: order.total,
      orderStatus: order.status,
      invoiceId: order.invoice?.id ?? null,
      invoiceStatus: order.invoice?.status ?? null,
      invoiceTotal: order.invoice?.invoiceTotal ?? null,
      items: order.orderItems.map((oi) => ({
        itemId: oi.item.id,
        itemTitle: oi.item.title,
        itemImageUrls: oi.item.imageUrls,
        winningBidAmount: oi.item.winningBidAmount ?? oi.subtotal ?? 0,
      })),
    }));
}

/**
 * Get current user's lost bids (lot closed and user did not win this item).
 */
export async function getBuyerLostBids(): Promise<BuyerLostBid[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "BUYER") redirect("/");

  const bids = await prisma.bid.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      item: {
        include: {
          lot: { select: { id: true, title: true, status: true } },
          winningBid: { select: { amount: true, userId: true } },
        },
      },
    },
  });

  const lost: BuyerLostBid[] = [];
  for (const bid of bids) {
    const lot = bid.item.lot;
    const item = bid.item;
    if (lot.status === "LIVE" && !item.winningBidId) continue;
    if (item.winningBidId && item.winningBid?.userId === session.user.id) continue;

    const winningAmount = item.winningBid?.amount ?? null;
    const wasOutbid = winningAmount != null && winningAmount > bid.amount;

    lost.push({
      bidId: bid.id,
      bidAmount: bid.amount,
      bidAt: bid.createdAt,
      itemId: item.id,
      itemTitle: item.title,
      itemImageUrls: item.imageUrls,
      lotId: lot.id,
      lotTitle: lot.title,
      lotStatus: lot.status,
      winningAmount,
      wasOutbid,
    });
  }

  return lost.sort(
    (a, b) => new Date(b.bidAt).getTime() - new Date(a.bidAt).getTime()
  );
}

/**
 * Get order + invoice + seller + payment for a buyer (for Pay now page).
 * Includes seller (store owner) details and payment tracking for winning items.
 */
export async function getBuyerOrderForPayment(orderId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) redirect("/sign-in");
  if (session.user.role !== "BUYER") redirect("/");

  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerId: session.user.id },
    include: {
      lot: {
        select: {
          id: true,
          title: true,
          store: {
            select: {
              id: true,
              name: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  businessEmail: true,
                  businessPhone: true,
                  displayLocation: true,
                  companyName: true,
                },
              },
            },
          },
        },
      },
      orderItems: {
        include: {
          item: { select: { id: true, title: true, imageUrls: true } },
        },
      },
      invoice: true,
      payment: true,
    },
  });

  return order;
}
