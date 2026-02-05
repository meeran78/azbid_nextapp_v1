"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getSellerDashboardMetrics(sellerId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  // Get all stores for this seller
  const stores = await prisma.store.findMany({
    where: { ownerId: sellerId },
    select: { id: true },
  });

  const storeIds = stores.map((s) => s.id);

  if (storeIds.length === 0) {
    return {
      totalAuctions: 0,
      activeAuctions: 0,
      completedAuctions: 0,
      totalRevenue: 0,
      averageBidsPerAuction: 0,
      totalLots: 0,
      liveLots: 0,
      scheduledLots: 0,
      totalLotValue: 0,
      totalItems: 0,
    };
  }

  // Auction metrics
  const [totalAuctions, activeAuctions, completedAuctions] = await Promise.all([
    prisma.auction.count({
      where: { storeId: { in: storeIds } },
    }),
    prisma.auction.count({
      where: {
        storeId: { in: storeIds },
        status: "LIVE",
      },
    }),
    prisma.auction.count({
      where: {
        storeId: { in: storeIds },
        status: "COMPLETED",
      },
    }),
  ]);

  // Revenue from completed auctions (sum of highest bids from sold lots)
  const completedLots = await prisma.lot.findMany({
    where: {
      storeId: { in: storeIds },
      status: "SOLD",
      auction: {
        status: "COMPLETED",
      },
    },
    select: {
        id: true,
        items: {
          select: {
            currentPrice: true,
            winningBidAmount: true,
          },
        },
      },
  });

  const totalRevenue = completedLots.reduce((sum, lot) => {
    const lotRevenue = lot.items.reduce(
      (itemSum, item) => itemSum + (item.winningBidAmount ?? item.currentPrice ?? 0),
      0
    );
    return sum + lotRevenue;
  }, 0);

  // Average bids per auction
  const auctionsWithBids = await prisma.auction.findMany({
    where: { storeId: { in: storeIds } },
    include: {
      lots: {
        select: {
          items: {
            select: {
              _count: {
                select: { bids: true },
              },
            },
          },
        },
      },
    },
  });


  const totalBids = auctionsWithBids.reduce((sum, auction) => {
    const auctionBids = auction.lots.reduce((lotSum, lot) => {
      const lotBids = lot.items.reduce(
        (itemSum, item) => itemSum + item._count.bids,
        0,
      );
      return lotSum + lotBids;
    }, 0);
    return sum + auctionBids;
  }, 0);

  const avgBidsPerAuction =
    auctionsWithBids.length > 0 ? totalBids / auctionsWithBids.length : 0;

  // Lot metrics
  const [totalLots, liveLots, scheduledLots] = await Promise.all([
    prisma.lot.count({
      where: { storeId: { in: storeIds } },
    }),
    prisma.lot.count({
      where: {
        storeId: { in: storeIds },
        status: "LIVE",
      },
    }),
    prisma.lot.count({
      where: {
        storeId: { in: storeIds },
        status: "SCHEDULED",
      },
    }),
  ]);

  // Total lot value (sum of reserve or starting prices)
  // Total lot value (sum of item reserve or starting prices)
const lotsWithItems = await prisma.lot.findMany({
    where: { storeId: { in: storeIds } },
    select: {
      items: {
        select: {
          reservePrice: true,
          startPrice: true,
        },
      },
    },
  });
  
  const totalLotValue = lotsWithItems.reduce((sum, lot) => {
    const lotValue = lot.items.reduce((itemSum, item) => {
      const price = item.reservePrice ?? item.startPrice ?? 0;
      return itemSum + price;
    }, 0);
    return sum + lotValue;
  }, 0);

  // Total items across all lots
  const totalItems = await prisma.item.count({
    where: {
      lot: {
        storeId: { in: storeIds },
      },
    },
  });

  return {
    totalAuctions,
    activeAuctions,
    completedAuctions,
    totalRevenue,
    averageBidsPerAuction: Math.round(avgBidsPerAuction * 100) / 100,
    totalLots,
    liveLots,
    scheduledLots,
    totalLotValue,
    totalItems,
  };
}

export async function getSellerStores(sellerId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  return await prisma.store.findMany({
    where: { ownerId: sellerId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          auctions: true,
          lots: true,
        },
      },
    },
  });
}

export async function getSellerAuctions(
  sellerId: string,
  status?: string,
  storeId?: string
) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  const stores = await prisma.store.findMany({
    where: { ownerId: sellerId },
    select: { id: true },
  });

  const storeIds = stores.map((s) => s.id);

  if (storeIds.length === 0) {
    return [];
  }

  const where: any = {
    storeId: storeId ? storeId : { in: storeIds },
  };

  if (status && status !== "ALL") {
    where.status = status;
  }

  return await prisma.auction.findMany({
    where,
    include: {
      store: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          lots: true,
        },
      },
    },
    orderBy: { startAt: "desc" },
  });
}

export async function getSellerLots(
  sellerId: string,
  status?: string,
  storeId?: string,
  auctionId?: string
) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  const stores = await prisma.store.findMany({
    where: { ownerId: sellerId },
    select: { id: true },
  });

  const storeIds = stores.map((s) => s.id);

  if (storeIds.length === 0) {
    return [];
  }

  const where: any = {
    storeId: storeId ? storeId : { in: storeIds },
  };

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (auctionId) {
    where.auctionId = auctionId;
  }

  return await prisma.lot.findMany({
    where,
    include: {
      auction: {
        select: {
          title: true,
          status: true,
        },
      },
      store: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          items: true,
        //   bids: true,
        },
      },
    //   winningBid: {
    //     select: {
    //       amount: true,
    //     },
    //   },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getSellerStoresForLots(sellerId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== "SELLER") {
    redirect("/sign-in");
  }

  return await prisma.store.findMany({
    where: {
      ownerId: sellerId,
      status: "ACTIVE",  // Only approved stores
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { auctions: true, lots: true } },
    },
  });
}
