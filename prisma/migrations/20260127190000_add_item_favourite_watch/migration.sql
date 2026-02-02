-- CreateTable
CREATE TABLE "ItemFavourite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemFavourite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemWatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemWatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItemFavourite_userId_itemId_key" ON "ItemFavourite"("userId", "itemId");
CREATE INDEX "ItemFavourite_userId_idx" ON "ItemFavourite"("userId");
CREATE INDEX "ItemFavourite_itemId_idx" ON "ItemFavourite"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemWatch_userId_itemId_key" ON "ItemWatch"("userId", "itemId");
CREATE INDEX "ItemWatch_userId_idx" ON "ItemWatch"("userId");
CREATE INDEX "ItemWatch_itemId_idx" ON "ItemWatch"("itemId");

-- AddForeignKey
ALTER TABLE "ItemFavourite" ADD CONSTRAINT "ItemFavourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ItemFavourite" ADD CONSTRAINT "ItemFavourite_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemWatch" ADD CONSTRAINT "ItemWatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ItemWatch" ADD CONSTRAINT "ItemWatch_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
