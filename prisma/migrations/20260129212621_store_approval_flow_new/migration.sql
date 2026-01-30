-- AlterEnum
ALTER TYPE "LotStatus" ADD VALUE 'RESEND';

-- AlterTable
ALTER TABLE "Lot" ADD COLUMN     "adminNotes" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
