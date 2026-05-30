ALTER TABLE "products" ADD COLUMN "originAddressText" TEXT;
ALTER TABLE "products" ADD COLUMN "originCity" TEXT;
ALTER TABLE "products" ADD COLUMN "originLatitude" DOUBLE PRECISION;
ALTER TABLE "products" ADD COLUMN "originLongitude" DOUBLE PRECISION;

CREATE INDEX "products_originCity_idx" ON "products"("originCity");
