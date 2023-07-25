-- DropForeignKey
ALTER TABLE `Inventory` DROP FOREIGN KEY `Inventory_serverTypeId_fkey`;

-- AlterTable
ALTER TABLE `Inventory` MODIFY `serverTypeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_serverTypeId_fkey` FOREIGN KEY (`serverTypeId`) REFERENCES `ServerType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
