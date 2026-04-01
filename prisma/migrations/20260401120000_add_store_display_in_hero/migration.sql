-- AlterTable
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "displayInHero" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Store_displayInHero_status_idx" ON "Store"("displayInHero", "status");
