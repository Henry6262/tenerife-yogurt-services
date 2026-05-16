-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "comparePrice" REAL,
    "imageUrl" TEXT,
    "isSubscription" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionInterval" TEXT,
    "isBundle" BOOLEAN NOT NULL DEFAULT false,
    "bundleItems" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Product" ("bundleItems", "comparePrice", "createdAt", "description", "id", "imageUrl", "isActive", "isBundle", "isSubscription", "name", "price", "slug", "sortOrder", "subscriptionInterval") SELECT "bundleItems", "comparePrice", "createdAt", "description", "id", "imageUrl", "isActive", "isBundle", "isSubscription", "name", "price", "slug", "sortOrder", "subscriptionInterval" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
