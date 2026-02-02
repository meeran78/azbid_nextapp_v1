-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "buyerPremium" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- Add lotId to Order (from Item.lotId)
ALTER TABLE "Order" ADD COLUMN "lotId" TEXT;

-- Migrate: set lotId from Item for each Order
UPDATE "Order" SET "lotId" = (SELECT "lotId" FROM "Item" WHERE "Item"."id" = "Order"."itemId");

-- Migrate: create OrderItem for each existing Order
INSERT INTO "OrderItem" ("id", "orderId", "itemId", "subtotal", "buyerPremium", "tax", "total", "createdAt", "updatedAt")
SELECT gen_random_uuid(), "Order"."id", "Order"."itemId", "Order"."subtotal", "Order"."buyerPremium", "Order"."tax", "Order"."total", "Order"."createdAt", "Order"."updatedAt"
FROM "Order";

-- Merge duplicate Orders (same buyerId+lotId): keep first, move OrderItems, update Invoice, delete duplicates
DO $$
DECLARE
  r RECORD;
  keep_id TEXT;
BEGIN
  FOR r IN
    SELECT "buyerId", "lotId", (array_agg("id" ORDER BY "id"))[1] as keep_id, (array_agg("id" ORDER BY "id"))[2:999] as dup_ids
    FROM "Order"
    WHERE "lotId" IS NOT NULL
    GROUP BY "buyerId", "lotId"
    HAVING count(*) > 1
  LOOP
    keep_id := r.keep_id;
    -- Move OrderItems from duplicate Orders to kept Order
    UPDATE "OrderItem" SET "orderId" = keep_id WHERE "orderId" = ANY(r.dup_ids);
    -- Disconnect Invoices from duplicate Orders (Invoice.orderId unique - only one Invoice per Order; duplicates get orderId=null)
    UPDATE "Invoice" SET "orderId" = NULL WHERE "orderId" = ANY(r.dup_ids);
    -- Delete duplicate Orders
    DELETE FROM "Order" WHERE "id" = ANY(r.dup_ids);
    -- Update kept Order totals (sum of OrderItems)
    UPDATE "Order" SET
      "subtotal" = (SELECT coalesce(sum("subtotal"), 0) FROM "OrderItem" WHERE "orderId" = keep_id),
      "buyerPremium" = (SELECT coalesce(sum("buyerPremium"), 0) FROM "OrderItem" WHERE "orderId" = keep_id),
      "tax" = (SELECT coalesce(sum("tax"), 0) FROM "OrderItem" WHERE "orderId" = keep_id),
      "total" = (SELECT coalesce(sum("total"), 0) FROM "OrderItem" WHERE "orderId" = keep_id)
    WHERE "id" = keep_id;
  END LOOP;
END $$;

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_itemId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "Order_buyerId_itemId_key";
DROP INDEX IF EXISTS "Order_itemId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "itemId";
ALTER TABLE "Order" ALTER COLUMN "lotId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_itemId_key" ON "OrderItem"("orderId", "itemId");
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_itemId_idx" ON "OrderItem"("itemId");

-- CreateIndex
-- Note: If existing Orders have duplicate (buyerId, lotId), this will fail. Run a data merge script first.
CREATE UNIQUE INDEX "Order_buyerId_lotId_key" ON "Order"("buyerId", "lotId");
CREATE INDEX "Order_lotId_idx" ON "Order"("lotId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
