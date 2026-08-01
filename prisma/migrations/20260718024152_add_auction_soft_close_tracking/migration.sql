-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "extendedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastExtendedAt" TIMESTAMP(3);
