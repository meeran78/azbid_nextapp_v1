-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "averageRating" DOUBLE PRECISION,
ADD COLUMN     "ratingsCount" INTEGER,
ADD COLUMN     "responseRate" DOUBLE PRECISION,
ADD COLUMN     "responseTimeMins" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "StoreFavourite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreFavourite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreReview" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreFavourite_storeId_idx" ON "StoreFavourite"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "StoreFavourite_userId_storeId_key" ON "StoreFavourite"("userId", "storeId");

-- CreateIndex
CREATE INDEX "StoreReview_storeId_idx" ON "StoreReview"("storeId");

-- CreateIndex
CREATE INDEX "StoreReview_userId_idx" ON "StoreReview"("userId");

-- AddForeignKey
ALTER TABLE "StoreFavourite" ADD CONSTRAINT "StoreFavourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreFavourite" ADD CONSTRAINT "StoreFavourite_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreReview" ADD CONSTRAINT "StoreReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
