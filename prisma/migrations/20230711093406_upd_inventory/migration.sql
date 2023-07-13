-- DropForeignKey
ALTER TABLE `Inventory` DROP FOREIGN KEY `Inventory_serverId_fkey`;

-- AlterTable
ALTER TABLE `Inventory` MODIFY `serverId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `Server`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
