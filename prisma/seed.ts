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

async function main() {
  const hashedPassword = await hashPassword(SEED_PASSWORD);
  const now = new Date();

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

  console.log("Seed completed: 5 buyers and 5 sellers created/updated.");
  console.log("All users have emailVerified: true. Password for all: " + SEED_PASSWORD);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
