ALTER TABLE "stores" ADD COLUMN "city" TEXT;

CREATE INDEX "stores_city_idx" ON "stores"("city");
