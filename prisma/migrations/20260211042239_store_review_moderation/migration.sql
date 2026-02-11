/*
  Warnings:

  - A unique constraint covering the columns `[orderId]` on the table `StoreReview` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orderId` to the `StoreReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StoreReview` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StoreReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "StoreReview" DROP CONSTRAINT "StoreReview_storeId_fkey";

-- DropForeignKey
ALTER TABLE "StoreReview" DROP CONSTRAINT "StoreReview_userId_fkey";

-- AlterTable
ALTER TABLE "StoreReview" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderatedById" TEXT,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "rejectReason" TEXT,
ADD COLUMN     "status" "StoreReviewStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StoreReview_orderId_key" ON "StoreReview"("orderId");

-- CreateIndex
CREATE INDEX "StoreReview_storeId_status_idx" ON "StoreReview"("storeId", "status");

-- CreateIndex
CREATE INDEX "StoreReview_status_idx" ON "StoreReview"("status");

-- AddForeignKey
ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_moderatedById_fkey" FOREIGN KEY ("moderatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
