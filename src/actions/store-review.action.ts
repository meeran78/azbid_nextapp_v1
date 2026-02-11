"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const MIN_RATING = 1;
const MAX_RATING = 5;
const MAX_COMMENT_LENGTH = 2000;

export type StoreReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type StoreReviewPublic = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  buyerName: string; // display name only
};

export type OrderEligibleForReview = {
  orderId: string;
  storeId: string;
  storeName: string;
  lotTitle: string;
  orderTotal: number;
  paidAt: Date | null;
  hasExistingReview: boolean;
};

/**
 * Recompute store aggregate rating from approved reviews only.
 * Call after approve/reject/delete review.
 */
async function updateStoreReviewAggregate(storeId: string): Promise<void> {
  const agg = await prisma.storeReview.aggregate({
    where: { storeId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { id: true },
  });
  await prisma.store.update({
    where: { id: storeId },
    data: {
      averageRating: agg._count.id > 0 ? (agg._avg.rating ?? 0) : null,
      ratingsCount: agg._count.id,
    },
  });
}

/**
 * Submit a store review. Only verified buyers with a completed (PAID) order for that store may submit.
 * One review per order (no duplicate); review is created as PENDING for moderation.
 */
export async function submitStoreReview(
  storeId: string,
  orderId: string,
  rating: number,
  comment: string | null
): Promise<{ success: true } | { error: string }> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) return { error: "Please sign in to leave a review." };
  if (session.user.role !== "BUYER") return { error: "Only buyers can review stores." };

  const numRating = Math.round(Number(rating));
  if (numRating < MIN_RATING || numRating > MAX_RATING) {
    return { error: `Rating must be between ${MIN_RATING} and ${MAX_RATING}.` };
  }
  const trimmedComment =
    comment != null && typeof comment === "string"
      ? comment.slice(0, MAX_COMMENT_LENGTH).trim() || null
      : null;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { lot: { select: { storeId: true } } },
  });
  if (!order) return { error: "Order not found." };
  if (order.buyerId !== session.user.id) return { error: "You can only review orders you placed." };
  if (order.status !== "PAID") return { error: "You can only review stores after payment is completed." };
  if (order.lot.storeId !== storeId) return { error: "This order is not for the selected store." };

  const existing = await prisma.storeReview.findUnique({
    where: { orderId },
  });
  if (existing) return { error: "You have already submitted a review for this order." };

  await prisma.storeReview.create({
    data: {
      storeId,
      userId: session.user.id,
      orderId,
      rating: numRating,
      comment: trimmedComment,
      status: "PENDING",
    },
  });

  revalidatePath(`/stores/${storeId}`);
  revalidatePath("/buyers-dashboard");
  return { success: true };
}

/**
 * Get orders that the current buyer has paid and that are eligible for review (no review yet).
 */
export async function getOrdersEligibleForReview(): Promise<OrderEligibleForReview[]> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session || session.user.role !== "BUYER") return [];

  const paidOrders = await prisma.order.findMany({
    where: { buyerId: session.user.id, status: "PAID" },
    include: {
      lot: { include: { store: { select: { id: true, name: true } } } },
      storeReview: { select: { id: true } },
      payment: { select: { createdAt: true } },
    },
  });

  return paidOrders.map((o) => ({
    orderId: o.id,
    storeId: o.lot.store.id,
    storeName: o.lot.store.name,
    lotTitle: o.lot.title,
    orderTotal: o.total,
    paidAt: o.payment?.createdAt ?? null,
    hasExistingReview: o.storeReview != null,
  }));
}

/**
 * Get approved reviews for a store (public). Efficient for display.
 */
export async function getStoreReviewsApproved(
  storeId: string,
  limit = 20,
  offset = 0
): Promise<{ reviews: StoreReviewPublic[]; total: number }> {
  const [reviews, total] = await Promise.all([
    prisma.storeReview.findMany({
      where: { storeId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.storeReview.count({ where: { storeId, status: "APPROVED" } }),
  ]);

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      buyerName: r.user.name,
    })),
    total,
  };
}

/**
 * Admin/seller: list reviews for moderation (PENDING) or all reviews for a store.
 */
export async function getStoreReviewsForModeration(options: {
  storeId?: string;
  status?: StoreReviewStatus;
  limit?: number;
  offset?: number;
}): Promise<{
  reviews: Array<{
    id: string;
    storeId: string;
    storeName: string;
    userId: string;
    buyerName: string;
    orderId: string;
    rating: number;
    comment: string | null;
    status: string;
    rejectReason: string | null;
    createdAt: Date;
    moderatedAt: Date | null;
  }>;
  total: number;
}> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session) return { reviews: [], total: 0 };

  const isAdmin = session.user.role === "ADMIN";
  type Where = { storeId?: string | { in: string[] }; status?: StoreReviewStatus };
  const where: Where = {};
  if (options.status) where.status = options.status;

  if (!isAdmin && session.user.role === "SELLER") {
    const storeIds = await prisma.store
      .findMany({
        where: { ownerId: session.user.id },
        select: { id: true },
      })
      .then((s) => s.map((x) => x.id));
    if (storeIds.length === 0) return { reviews: [], total: 0 };
    if (options.storeId && !storeIds.includes(options.storeId)) return { reviews: [], total: 0 };
    where.storeId = options.storeId ? options.storeId : { in: storeIds };
  } else if (!isAdmin) {
    return { reviews: [], total: 0 };
  } else if (options.storeId) {
    where.storeId = options.storeId;
  }

  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;

  const [reviews, total] = await Promise.all([
    prisma.storeReview.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        store: { select: { name: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.storeReview.count({ where }),
  ]);

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      storeId: r.storeId,
      storeName: r.store.name,
      userId: r.userId,
      buyerName: r.user.name,
      orderId: r.orderId,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      rejectReason: r.rejectReason,
      createdAt: r.createdAt,
      moderatedAt: r.moderatedAt,
    })),
    total,
  };
}

/**
 * Moderate a review (approve or reject). Admin only. Updates store aggregate on approve/reject.
 */
export async function moderateStoreReview(
  reviewId: string,
  status: "APPROVED" | "REJECTED",
  rejectReason: string | null
): Promise<{ success: true } | { error: string }> {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  if (!session || session.user.role !== "ADMIN") {
    return { error: "Only admins can moderate reviews." };
  }

  const review = await prisma.storeReview.findUnique({
    where: { id: reviewId },
    select: { storeId: true, status: true },
  });
  if (!review) return { error: "Review not found." };

  await prisma.storeReview.update({
    where: { id: reviewId },
    data: {
      status,
      rejectReason: status === "REJECTED" ? (rejectReason?.trim().slice(0, 500) ?? null) : null,
      moderatedAt: new Date(),
      moderatedById: session.user.id,
    },
  });

  await updateStoreReviewAggregate(review.storeId);
  revalidatePath(`/stores/${review.storeId}`);
  revalidatePath("/admin");
  return { success: true };
}
