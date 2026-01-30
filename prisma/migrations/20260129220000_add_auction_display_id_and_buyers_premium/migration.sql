-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "auctionDisplayId" TEXT,
ADD COLUMN     "buyersPremium" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Auction_auctionDisplayId_key" ON "Auction"("auctionDisplayId");
