-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripeConnectAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_stripeConnectAccountId_key" ON "users"("stripeConnectAccountId");
