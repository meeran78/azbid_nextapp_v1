-- CreateEnum
CREATE TYPE "SellerAccountRequestStatus" AS ENUM ('PENDING', 'CONTRACT_SENT', 'ACKNOWLEDGED', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "SellerAccountRequest" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "requesterName" TEXT NOT NULL,
  "requesterEmail" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "companyRegistrationNumber" TEXT NOT NULL,
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zipcode" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "status" "SellerAccountRequestStatus" NOT NULL DEFAULT 'PENDING',
  "adminNotes" TEXT,
  "contractDetails" TEXT,
  "acknowledgementName" TEXT,
  "acknowledgementToken" TEXT,
  "contractSentAt" TIMESTAMP(3),
  "acknowledgedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SellerAccountRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerAccountRequest_acknowledgementToken_key" ON "SellerAccountRequest"("acknowledgementToken");
CREATE INDEX "SellerAccountRequest_status_createdAt_idx" ON "SellerAccountRequest"("status", "createdAt");
CREATE INDEX "SellerAccountRequest_requesterEmail_idx" ON "SellerAccountRequest"("requesterEmail");
CREATE INDEX "SellerAccountRequest_userId_idx" ON "SellerAccountRequest"("userId");

-- AddForeignKey
ALTER TABLE "SellerAccountRequest"
ADD CONSTRAINT "SellerAccountRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
