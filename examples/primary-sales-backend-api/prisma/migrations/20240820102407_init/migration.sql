-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('crypto', 'fiat');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('reserved', 'completed', 'expired', 'failed');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "collectionAddress" TEXT NOT NULL,
    "contractType" TEXT NOT NULL,
    "stockQuantity" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "name" TEXT NOT NULL,
    "type" "CurrencyType" NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "ProductPrice" (
    "product_id" TEXT NOT NULL,
    "currency_name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("product_id","currency_name")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transactionHash" TEXT,
    "recipientAddress" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderLineItem" (
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "OrderLineItem_pkey" PRIMARY KEY ("order_id","product_id")
);

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPrice" ADD CONSTRAINT "ProductPrice_currency_name_fkey" FOREIGN KEY ("currency_name") REFERENCES "Currency"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderLineItem" ADD CONSTRAINT "OrderLineItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
