/*
  Warnings:

  - A unique constraint covering the columns `[readableId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[readableId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[readableId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[readableId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[readableId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "readableId" TEXT;

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "readableId" TEXT;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "readableId" TEXT;

-- AlterTable
ALTER TABLE "public"."Review" ADD COLUMN     "readableId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "readableId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_readableId_key" ON "public"."Category"("readableId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_readableId_key" ON "public"."Order"("readableId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_readableId_key" ON "public"."Product"("readableId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_readableId_key" ON "public"."Review"("readableId");

-- CreateIndex
CREATE UNIQUE INDEX "User_readableId_key" ON "public"."User"("readableId");
