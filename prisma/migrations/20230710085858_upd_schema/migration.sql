/*
  Warnings:

  - You are about to drop the `_InventoryToProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_InventoryToProduct` DROP FOREIGN KEY `_InventoryToProduct_A_fkey`;

-- DropForeignKey
ALTER TABLE `_InventoryToProduct` DROP FOREIGN KEY `_InventoryToProduct_B_fkey`;

-- AlterTable
ALTER TABLE `Server` ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT 'SERVER';

-- DropTable
DROP TABLE `_InventoryToProduct`;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
