-- AlterTable
ALTER TABLE `Product` ADD COLUMN `buttonColor` ENUM('GREEN', 'BLUE') NOT NULL DEFAULT 'BLUE',
    ADD COLUMN `height` INTEGER NULL,
    ADD COLUMN `iconButton` VARCHAR(191) NULL,
    ADD COLUMN `textButton` VARCHAR(191) NULL;