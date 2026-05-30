-- Pivot categories to farm marketplace categories while preserving existing rows.
CREATE TYPE "Category_new" AS ENUM ('FRUITS_VEGETABLES', 'HONEY', 'DAIRY', 'HERBS', 'NATURAL_BEAUTY');

ALTER TABLE "stores" ALTER COLUMN "category" TYPE "Category_new" USING (
  CASE
    WHEN "category"::text IN ('FOOD', 'HOME', 'OTHER') THEN 'FRUITS_VEGETABLES'
    WHEN "category"::text = 'BEAUTY' THEN 'NATURAL_BEAUTY'
    WHEN "category"::text = 'COFFEE' THEN 'HERBS'
    ELSE 'FRUITS_VEGETABLES'
  END
)::"Category_new";

ALTER TABLE "products" ALTER COLUMN "category" TYPE "Category_new" USING (
  CASE
    WHEN "category"::text IN ('FOOD', 'HOME', 'OTHER') THEN 'FRUITS_VEGETABLES'
    WHEN "category"::text = 'BEAUTY' THEN 'NATURAL_BEAUTY'
    WHEN "category"::text = 'COFFEE' THEN 'HERBS'
    ELSE 'FRUITS_VEGETABLES'
  END
)::"Category_new";

DROP TYPE "Category";
ALTER TYPE "Category_new" RENAME TO "Category";

CREATE TYPE "CertificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'CONFIRMED');
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "stores"
  ADD COLUMN "galleryUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "certificationUrl" TEXT,
  ADD COLUMN "certificationStatus" "CertificationStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "certificationNotes" TEXT,
  ADD COLUMN "trustedBadge" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "cart_items" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "addresses" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "recipient" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "line1" TEXT NOT NULL,
  "line2" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "orders" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "addressId" TEXT,
  "subtotal" DECIMAL(10,2) NOT NULL,
  "deliveryFee" DECIMAL(10,2) NOT NULL,
  "total" DECIMAL(10,2) NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "deliveryEtaMinutes" INTEGER NOT NULL,
  "deliveryAddress" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "order_items" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "storeId" TEXT,
  "productName" TEXT NOT NULL,
  "storeName" TEXT NOT NULL,
  "unitPrice" DECIMAL(10,2) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "lineTotal" DECIMAL(10,2) NOT NULL,
  CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reviews" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "productId" TEXT,
  "storeId" TEXT,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "status" "ReviewStatus" NOT NULL DEFAULT 'APPROVED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cart_items_userId_productId_key" ON "cart_items"("userId", "productId");
CREATE INDEX "cart_items_userId_idx" ON "cart_items"("userId");
CREATE INDEX "cart_items_productId_idx" ON "cart_items"("productId");
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");
CREATE INDEX "orders_userId_idx" ON "orders"("userId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");
CREATE INDEX "order_items_productId_idx" ON "order_items"("productId");
CREATE INDEX "order_items_storeId_idx" ON "order_items"("storeId");
CREATE INDEX "reviews_productId_idx" ON "reviews"("productId");
CREATE INDEX "reviews_storeId_idx" ON "reviews"("storeId");
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId");

ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
