/*
  Warnings:

  - You are about to drop the column `activationDelaySeconds` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `cooldownDate` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `reactiviationDelaySeconds` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `saleDelaySeconds` on the `Product` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_serverTypeId_fkey`;

-- AlterTable
ALTER TABLE `Product` DROP COLUMN `activationDelaySeconds`,
    DROP COLUMN `cooldownDate`,
    DROP COLUMN `reactiviationDelaySeconds`,
    DROP COLUMN `saleDelaySeconds`,
    ADD COLUMN `blockSize` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `isBackground` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isBackgroundImage` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `label` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `previewImage` VARCHAR(191) NULL,
    MODIFY `description` LONGTEXT NULL,
    MODIFY `type` ENUM('GAME_ITEM', 'SERVICE', 'SETS_OF_PRODUCTS', 'HTTP_REQUEST', 'CURRENCY', 'CARDS') NOT NULL DEFAULT 'GAME_ITEM',
    MODIFY `productContent` JSON NULL,
    MODIFY `serverTypeId` VARCHAR(191) NULL,
    MODIFY `amount` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `baseSettings` ADD COLUMN `panelURLs` JSON NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_serverTypeId_fkey` FOREIGN KEY (`serverTypeId`) REFERENCES `ServerType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
