/*
  Warnings:

  - A unique constraint covering the columns `[LotDisplayId]` on the table `Lot` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Lot" ADD COLUMN     "LotDisplayId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lot_LotDisplayId_key" ON "Lot"("LotDisplayId");
