/*
  Warnings:

  - You are about to drop the column `address1` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `address2` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Address` table. All the data in the column will be lost.
  - Added the required column `address` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ward` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "address1",
DROP COLUMN "address2",
DROP COLUMN "city",
DROP COLUMN "postalCode",
DROP COLUMN "state",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "apartment" TEXT,
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "ward" TEXT NOT NULL;
