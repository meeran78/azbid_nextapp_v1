/*
  Warnings:

  - You are about to drop the column `lotId` on the `Bid` table. All the data in the column will be lost.
  - You are about to drop the column `currentPrice` on the `Lot` table. All the data in the column will be lost.
  - You are about to drop the column `reservePrice` on the `Lot` table. All the data in the column will be lost.
  - You are about to drop the column `startPrice` on the `Lot` table. All the data in the column will be lost.
  - You are about to drop the column `winningBidId` on the `Lot` table. All the data in the column will be lost.
  - You are about to drop the column `lotId` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[winningBidId]` on the table `Item` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[buyerId,itemId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemId` to the `Bid` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startPrice` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `itemId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bid" DROP CONSTRAINT "Bid_lotId_fkey";

-- DropForeignKey
ALTER TABLE "Lot" DROP CONSTRAINT "Lot_winningBidId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_lotId_fkey";

-- DropIndex
DROP INDEX "Bid_lotId_amount_idx";

-- DropIndex
DROP INDEX "Lot_winningBidId_key";

-- DropIndex
DROP INDEX "Order_buyerId_lotId_key";

-- AlterTable
ALTER TABLE "Bid" DROP COLUMN "lotId",
ADD COLUMN     "itemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "currentPrice" DOUBLE PRECISION,
ADD COLUMN     "reservePrice" DOUBLE PRECISION,
ADD COLUMN     "retailPrice" DOUBLE PRECISION,
ADD COLUMN     "startPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "winningBidAmount" DOUBLE PRECISION,
ADD COLUMN     "winningBidId" TEXT;

-- AlterTable
ALTER TABLE "Lot" DROP COLUMN "currentPrice",
DROP COLUMN "reservePrice",
DROP COLUMN "startPrice",
DROP COLUMN "winningBidId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "lotId",
ADD COLUMN     "itemId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Bid_itemId_amount_idx" ON "Bid"("itemId", "amount");

-- CreateIndex
CREATE INDEX "Bid_userId_idx" ON "Bid"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Item_winningBidId_key" ON "Item"("winningBidId");

-- CreateIndex
CREATE INDEX "Item_winningBidId_idx" ON "Item"("winningBidId");

-- CreateIndex
CREATE INDEX "Order_itemId_idx" ON "Order"("itemId");

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_buyerId_itemId_key" ON "Order"("buyerId", "itemId");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_winningBidId_fkey" FOREIGN KEY ("winningBidId") REFERENCES "Bid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
