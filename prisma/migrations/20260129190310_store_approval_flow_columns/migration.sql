-- AlterTable
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "approvedById" TEXT,
ADD COLUMN IF NOT EXISTS "suspendedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "suspendedById" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AddForeignKey (only if columns don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Store_approvedById_fkey'
  ) THEN
    ALTER TABLE "Store" ADD CONSTRAINT "Store_approvedById_fkey" 
    FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Store_suspendedById_fkey'
  ) THEN
    ALTER TABLE "Store" ADD CONSTRAINT "Store_suspendedById_fkey" 
    FOREIGN KEY ("suspendedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;