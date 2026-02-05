import "dotenv/config";
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

  for (let sIdx = 0; sIdx < sellerUsers.length; sIdx++) {
    const seller = sellerUsers[sIdx];
    const storeName = `${seller.name}'s Store`;

    let store = await prisma.store.findFirst({
      where: { ownerId: seller.id },
    });
    if (store) {
      store = await prisma.store.update({
        where: { id: store.id },
        data: {
          name: storeName,
          description: `Seed store for ${seller.name} with admin approval.`,
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
          description: `Seed store for ${seller.name} with admin approval.`,
          status: "ACTIVE",
          approvedById: adminId,
          approvedAt: now,
          createdAt: now,
          updatedAt: now,
        },
      });
    }

    const storeId = store.id;

    const existingLots = await prisma.lot.count({ where: { storeId } });
    const lotsToCreate = Math.max(0, LOTS_PER_STORE - existingLots);

    for (let lIdx = 0; lIdx < lotsToCreate; lIdx++) {
      const lotNum = sIdx * LOTS_PER_STORE + existingLots + lIdx + 1;
      const closesAt = futureDate(lotNum + 7);

      const lot = await prisma.lot.create({
        data: {
          storeId,
          title: `Seed Lot ${lotNum} - ${storeName}`,
          description: `Seed lot ${lotNum} with 20 items for ${storeName}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
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

    console.log(
      `Store "${storeName}": ${existingLots >= LOTS_PER_STORE ? "already has 5 lots" : `created ${lotsToCreate} lots (20 items each)`}.`
    );
  }

  console.log("\nSeed completed.");
  console.log("- 5 buyers, 5 sellers, 1 admin. Password for all: " + SEED_PASSWORD);
  console.log("- 5 stores (ACTIVE, admin-approved), 5 lots per store, 20 items per lot.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
