/*
  Warnings:

  - You are about to alter the column `discount` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `saleDiscount` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `nameID` VARCHAR(191) NULL,
    MODIFY `discount` DOUBLE NULL DEFAULT 1,
    MODIFY `saleDiscount` DOUBLE NULL DEFAULT 1;
