ALTER TABLE "products"
ADD COLUMN "inventoryQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Preserve availability for listings created before inventory tracking existed.
UPDATE "products" SET "inventoryQuantity" = 100;

CREATE INDEX "products_isActive_inventoryQuantity_idx"
ON "products"("isActive", "inventoryQuantity");
