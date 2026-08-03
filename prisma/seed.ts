import { config } from "dotenv";

// Node scripts (unlike Next.js itself) don't auto-load .env.local, and this
// project keeps DATABASE_URL there rather than in a plain .env.
config({ path: ".env.local" });
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hashPassword } from "../src/lib/argon2";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = "Password123!";

const buyers = [
  { name: "Buyer One", email: "buyer1@example.com" },
  { name: "Buyer Two", email: "buyer2@example.com" },
  { name: "Buyer Three", email: "buyer3@example.com" },
  { name: "Buyer Four", email: "buyer4@example.com" },
  { name: "Buyer Five", email: "buyer5@example.com" },
];

const sellers = [
  { name: "Seller One", email: "seller1@example.com" },
  { name: "Seller Two", email: "seller2@example.com" },
  { name: "Seller Three", email: "seller3@example.com" },
  { name: "Seller Four", email: "seller4@example.com" },
  { name: "Seller Five", email: "seller5@example.com" },
];

// One store location per seller, spread across VA / MD / DC — mirrors the
// address fields collected on a real SellerAccountRequest.
const storeLocations = [
  {
    companyName: "Richmond Estate Liquidators",
    companyRegistrationNumber: "VA-REG-10001",
    addressLine1: "100 E Broad St",
    city: "Richmond",
    state: "VA",
    zipcode: "23219",
  },
  {
    companyName: "Arlington Surplus Auctions",
    companyRegistrationNumber: "VA-REG-10002",
    addressLine1: "2200 Clarendon Blvd",
    city: "Arlington",
    state: "VA",
    zipcode: "22201",
  },
  {
    companyName: "Baltimore Harbor Auction Co.",
    companyRegistrationNumber: "MD-REG-20001",
    addressLine1: "300 W Pratt St",
    city: "Baltimore",
    state: "MD",
    zipcode: "21201",
  },
  {
    companyName: "Silver Spring Estate Sales",
    companyRegistrationNumber: "MD-REG-20002",
    addressLine1: "8500 Georgia Ave",
    city: "Silver Spring",
    state: "MD",
    zipcode: "20910",
  },
  {
    companyName: "Capital City Auction House",
    companyRegistrationNumber: "DC-REG-30001",
    addressLine1: "1400 K St NW",
    city: "Washington",
    state: "DC",
    zipcode: "20001",
  },
] as const;

async function seedUsers(hashedPassword: string, now: Date) {
  for (const u of [...buyers, ...sellers]) {
    const role = buyers.some((b) => b.email === u.email) ? "BUYER" : "SELLER";
    const user = await prisma.user.upsert({
      where: { email: u.email },
      create: {
        name: u.name,
        email: u.email,
        emailVerified: true,
        role,
        acceptedTerms: true,
        acceptedTermsAt: now,
      },
      update: {
        emailVerified: true,
        role,
      },
    });

    const existing = await prisma.account.findFirst({
      where: { userId: user.id, providerId: "credential" },
    });
    if (!existing) {
      await prisma.account.create({
        data: {
          userId: user.id,
          accountId: user.email,
          providerId: "credential",
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        },
      });
    }
  }
}

function buildLongLotDescription(lotNum: number, storeName: string): string {
  const base = `Seed lot ${lotNum} for ${storeName}. This lot is part of the development seed data used to simulate realistic auction inventory and bidding activity within the application. It contains a variety of mixed items in different cosmetic and functional conditions, intended to exercise list rendering, detail pages, bidding flows, and checkout logic across the platform. Buyers can browse images, read descriptions, place bids, and track their orders across multiple devices and sessions without affecting production data.`;

  const extra =
    " The text continues with additional explanatory and filler information to ensure that the overall description length comfortably exceeds five hundred characters. Having long-form copy here also helps verify that the UI truncation behaviour, “read more” toggles, tooltips, and responsive layouts behave correctly when content is larger than a single short paragraph. In a real deployment this text would highlight inspection dates, pickup and removal terms, payment deadlines, buyer premiums, tax rules, disclaimers, and any special notes or conditions provided by the seller so that bidders fully understand what they are purchasing before placing a bid.";

  return `${base}${extra}`;
}

async function getOrCreateAdmin(hashedPassword: string, now: Date): Promise<string> {
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    create: {
      name: "Admin",
      email: "admin@example.com",
      emailVerified: true,
      role: "ADMIN",
      acceptedTerms: true,
      acceptedTermsAt: now,
    },
    update: { emailVerified: true, role: "ADMIN" },
  });

  const existing = await prisma.account.findFirst({
    where: { userId: admin.id, providerId: "credential" },
  });
  if (!existing) {
    await prisma.account.create({
      data: {
        userId: admin.id,
        accountId: admin.email,
        providerId: "credential",
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    });
  }
  return admin.id;
}

/**
 * Mirrors approveSellerAccountRequestAction: creates an already-APPROVED
 * SellerAccountRequest and copies its address fields onto the seller's User,
 * so seed sellers look exactly like a real seller who cleared the admin
 * approval flow (not just a store flipped to ACTIVE behind the scenes).
 */
async function seedApprovedSellerAccountRequest(
  seller: { id: string; email: string; name: string },
  location: (typeof storeLocations)[number],
  now: Date
) {
  const displayLocation = `${location.city}, ${location.state}`;

  const existingRequest = await prisma.sellerAccountRequest.findFirst({
    where: { userId: seller.id },
  });
  const requestData = {
    userId: seller.id,
    requesterName: seller.name,
    requesterEmail: seller.email,
    companyName: location.companyName,
    companyRegistrationNumber: location.companyRegistrationNumber,
    addressLine1: location.addressLine1,
    city: location.city,
    state: location.state,
    zipcode: location.zipcode,
    country: "USA",
    status: "APPROVED" as const,
    contractSentAt: now,
    acknowledgedAt: now,
    approvedAt: now,
  };
  if (existingRequest) {
    await prisma.sellerAccountRequest.update({
      where: { id: existingRequest.id },
      data: requestData,
    });
  } else {
    await prisma.sellerAccountRequest.create({ data: requestData });
  }

  await prisma.user.update({
    where: { id: seller.id },
    data: {
      role: "SELLER",
      companyName: location.companyName,
      companyRegistrationNumber: location.companyRegistrationNumber,
      addressLine1: location.addressLine1,
      city: location.city,
      state: location.state,
      zipcode: location.zipcode,
      country: "USA",
      displayLocation,
    },
  });
}

function futureDate(daysFromNow: number, hour = 18): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  const hashedPassword = await hashPassword(SEED_PASSWORD);
  const now = new Date();

  // 1. Seed users (buyers + sellers)
  await seedUsers(hashedPassword, now);
  console.log("Users: 5 buyers and 5 sellers created/updated.");

  // 2. Get or create admin for store approval
  const adminId = await getOrCreateAdmin(hashedPassword, now);
  console.log("Admin user ready (admin@example.com).");

  // 3. Get seller user IDs
  const sellerEmails = sellers.map((s) => s.email);
  const sellerUsers = await prisma.user.findMany({
    where: { email: { in: sellerEmails }, role: "SELLER" },
    select: { id: true, email: true, name: true },
  });

  if (sellerUsers.length === 0) {
    console.log("No seller users found. Run user seed first.");
    return;
  }

  const LOTS_PER_STORE = 5;
  const ITEMS_PER_LOT = 20;
  const AUCTIONS_PER_STORE = 3;

  for (let sIdx = 0; sIdx < sellerUsers.length; sIdx++) {
    const seller = sellerUsers[sIdx];
    const location = storeLocations[sIdx % storeLocations.length];
    const storeName = location.companyName;

    // Run the seller through the same admin-approval trail a real seller
    // account request would leave behind (SellerAccountRequest -> APPROVED,
    // address copied onto the User), before the store itself is approved.
    await seedApprovedSellerAccountRequest(seller, location, now);

    let store = await prisma.store.findFirst({
      where: { ownerId: seller.id },
    });
    if (store) {
      store = await prisma.store.update({
        where: { id: store.id },
        data: {
          name: storeName,
          description: `Seed store for ${seller.name}, based in ${location.city}, ${location.state}. Admin-approved.`,
          status: "ACTIVE",
          approvedById: adminId,
          approvedAt: now,
          updatedAt: now,
        },
      });
    } else {
      store = await prisma.store.create({
        data: {
          ownerId: seller.id,
          name: storeName,
          description: `Seed store for ${seller.name}, based in ${location.city}, ${location.state}. Admin-approved.`,
          status: "ACTIVE",
          approvedById: adminId,
          approvedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    const storeId = store.id;

    // Count only LIVE lots so we always end up with exactly 5 active lots per active store
    const existingLots = await prisma.lot.count({
      where: { storeId, status: "LIVE" },
    });
    const lotsToCreate = Math.max(0, LOTS_PER_STORE - existingLots);

    for (let lIdx = 0; lIdx < lotsToCreate; lIdx++) {
      const lotNum = sIdx * LOTS_PER_STORE + existingLots + lIdx + 1;
      const closesAt = futureDate(lotNum + 7);

      const lot = await prisma.lot.create({
        data: {
          storeId,
          title: `Seed Lot ${lotNum} - ${storeName}`,
          // Description intentionally long (500+ characters) to test UI handling of large text blocks
          description: buildLongLotDescription(lotNum, storeName),
          status: "LIVE",
          closesAt,
          inspectionAt: futureDate(lotNum + 5, 10),
          removalStartAt: futureDate(lotNum + 14, 9),
          createdAt: now,
          updatedAt: now,
        },
      });

      for (let iIdx = 0; iIdx < ITEMS_PER_LOT; iIdx++) {
        const itemNum = (lotNum - 1) * ITEMS_PER_LOT + iIdx + 1;
        await prisma.item.create({
          data: {
            lotId: lot.id,
            title: `Seed Item ${itemNum}`,
            description: `Seed item ${itemNum} in lot ${lotNum}.`,
            condition: "Used – Good",
            imageUrls: [],
            startPrice: 10 + (itemNum % 50) * 5,
            reservePrice: 15 + (itemNum % 50) * 5,
            retailPrice: 20 + (itemNum % 50) * 10,
            createdAt: now,
          },
        });
      }
    }

    // Seed auctions for this store so seller dashboard "Auctions" tab has data
    const existingAuctions = await prisma.auction.count({ where: { storeId } });
    const auctionsToCreate = Math.max(0, AUCTIONS_PER_STORE - existingAuctions);
    const statuses: Array<"DRAFT" | "SCHEDULED" | "LIVE"> = ["DRAFT", "SCHEDULED", "LIVE"];
    for (let aIdx = 0; aIdx < auctionsToCreate; aIdx++) {
      const auctionNum = existingAuctions + aIdx + 1;
      const status = statuses[aIdx % statuses.length];
      const startAt = futureDate(auctionNum + 1, 9);
      const endAt = futureDate(auctionNum + 8, 18);
      await prisma.auction.create({
        data: {
          storeId,
          title: `Seed Auction ${auctionNum} - ${storeName}`,
          description: `Development auction ${auctionNum} for ${storeName}. Use this to test the seller dashboard auctions list and admin auction management.`,
          status,
          startAt,
          endAt,
          auctionDisplayId: `FL-${new Date().getFullYear()}-${String(sIdx * 100 + auctionNum).padStart(6, "0")}`,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    console.log(
      `Store "${storeName}" (${location.city}, ${location.state}): ${existingLots >= LOTS_PER_STORE ? "already has 5 lots" : `created ${lotsToCreate} lots (20 items each)`}. Auctions: ${existingAuctions >= AUCTIONS_PER_STORE ? "already has 3" : `created ${auctionsToCreate}`}.`
    );
  }

  console.log("\nSeed completed.");
  console.log("- 5 buyers, 5 sellers, 1 admin. Password for all: " + SEED_PASSWORD);
  console.log(
    "- 5 sellers approved via SellerAccountRequest (VA/MD/DC addresses), 5 stores (ACTIVE, admin-approved), 5 lots per store, 20 items per lot, 3 auctions per store."
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
