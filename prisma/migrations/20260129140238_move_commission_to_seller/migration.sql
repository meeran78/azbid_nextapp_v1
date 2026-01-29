/*
  Warnings:

  - The values [OPEN] on the enum `InvoiceStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `number` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `commissionPct` on the `Store` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invoiceDisplayId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `buyerId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyerPremiumPct` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invoiceTotal` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lotId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winningBidAmount` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InvoiceStatus_new" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED', 'VOID');
ALTER TABLE "public"."Invoice" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Invoice" ALTER COLUMN "status" TYPE "InvoiceStatus_new" USING ("status"::text::"InvoiceStatus_new");
ALTER TYPE "InvoiceStatus" RENAME TO "InvoiceStatus_old";
ALTER TYPE "InvoiceStatus_new" RENAME TO "InvoiceStatus";
DROP TYPE "public"."InvoiceStatus_old";
ALTER TABLE "Invoice" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_orderId_fkey";

-- DropIndex
DROP INDEX "Invoice_number_key";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "number",
ADD COLUMN     "buyerId" TEXT NOT NULL,
ADD COLUMN     "buyerPremiumPct" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "invoiceDisplayId" TEXT,
ADD COLUMN     "invoiceTotal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lotId" TEXT NOT NULL,
ADD COLUMN     "sellerId" TEXT NOT NULL,
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "tax" DOUBLE PRECISION,
ADD COLUMN     "winningBidAmount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "orderId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "commissionPct";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "commissionPct" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "InvoiceItem_itemId_idx" ON "InvoiceItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceItem_invoiceId_itemId_key" ON "InvoiceItem"("invoiceId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceDisplayId_key" ON "Invoice"("invoiceDisplayId");

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
