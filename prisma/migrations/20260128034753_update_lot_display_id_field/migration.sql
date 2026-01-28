/*
  Warnings:

  - You are about to drop the column `LotDisplayId` on the `Lot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lotDisplayId]` on the table `Lot` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Lot_LotDisplayId_key";

-- AlterTable
ALTER TABLE "Lot" DROP COLUMN "LotDisplayId",
ADD COLUMN     "lotDisplayId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lot_lotDisplayId_key" ON "Lot"("lotDisplayId");
