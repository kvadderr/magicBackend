-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `steamName` LONGTEXT NOT NULL,
    `steamID` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `steamAvatar` LONGTEXT NOT NULL,
    `mainBalance` INTEGER NOT NULL,
    `bonusBalance` INTEGER NOT NULL DEFAULT 0,
    `firstDateAuth` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lvl` INTEGER NOT NULL DEFAULT 1,
    `experience` INTEGER NOT NULL DEFAULT 0,
    `sumOfDeposits` INTEGER NOT NULL DEFAULT 0,
    `sumOfRefunds` INTEGER NOT NULL DEFAULT 0,
    `discordLink` LONGTEXT NULL,
    `VKLink` LONGTEXT NULL,
    `TGLink` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastActivity` DATETIME(3) NULL,
    `role` ENUM('CLIENT', 'ADMINISTRATOR') NOT NULL DEFAULT 'CLIENT',

    UNIQUE INDEX `User_steamID_key`(`steamID`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `method` LONGTEXT NOT NULL,
    `amount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('SUCCESS', 'FALSE', 'DENIED') NOT NULL DEFAULT 'FALSE',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Purchase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `amount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lostMainBalance` INTEGER NOT NULL,
    `lostBonusBalance` INTEGER NOT NULL,
    `refund` BOOLEAN NOT NULL,
    `productId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transfers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `senderId` INTEGER NOT NULL,
    `receiverId` INTEGER NOT NULL,
    `amount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NOT NULL,
    `status` ENUM('INVENTORY', 'ON_SERVER') NOT NULL DEFAULT 'INVENTORY',
    `dateOfReceive` DATETIME(3) NULL,
    `historyOfPurchaseId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `serverTypeId` INTEGER NOT NULL,
    `serverId` INTEGER NOT NULL,
    `serverName` LONGTEXT NULL,
    `productId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServerType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` LONGTEXT NOT NULL,
    `description` LONGTEXT NOT NULL,
    `number` INTEGER NOT NULL,
    `hidden` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Server` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serverTypeId` INTEGER NOT NULL,
    `IP` LONGTEXT NOT NULL,
    `port` LONGTEXT NOT NULL,
    `apiKey` LONGTEXT NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT 'SERVER',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` LONGTEXT NOT NULL,
    `description` LONGTEXT NULL,
    `image` LONGTEXT NULL,
    `type` ENUM('GAME_ITEM', 'SERVICE', 'SETS_OF_PRODUCTS', 'HTTP_REQUEST', 'CURRENCY', 'CARDS') NOT NULL DEFAULT 'GAME_ITEM',
    `productContent` JSON NULL,
    `serverTypeId` INTEGER NULL,
    `amount` INTEGER NOT NULL DEFAULT 1,
    `isChangeAmount` BOOLEAN NOT NULL DEFAULT false,
    `price` INTEGER NOT NULL,
    `discount` INTEGER NULL,
    `saleDiscount` INTEGER NULL,
    `saleDeadline` DATETIME(3) NULL,
    `maxCountOfSale` INTEGER NULL,
    `hidden` BOOLEAN NOT NULL DEFAULT false,
    `number` INTEGER NULL,
    `autoactivation` BOOLEAN NOT NULL DEFAULT false,
    `isBackground` BOOLEAN NOT NULL DEFAULT false,
    `previewImage` VARCHAR(191) NULL,
    `blockSize` INTEGER NOT NULL DEFAULT 1,
    `label` INTEGER NOT NULL DEFAULT 1,
    `isBackgroundImage` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Promocodes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` LONGTEXT NOT NULL,
    `countOfActivation` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `discountAmount` INTEGER NULL,
    `depositBonus` INTEGER NULL,
    `plusBonusBalance` INTEGER NULL,
    `limitActivation` INTEGER NOT NULL,
    `groupId` LONGTEXT NOT NULL,
    `itemSet` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `baseSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `header` LONGTEXT NOT NULL,
    `saleMode` BOOLEAN NOT NULL DEFAULT false,
    `startBalance` INTEGER NOT NULL,
    `mainPage` LONGTEXT NOT NULL,
    `apiKey` LONGTEXT NOT NULL,
    `IPWhiteList` LONGTEXT NOT NULL,
    `panelURLs` JSON NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `urlSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `icon` LONGTEXT NOT NULL,
    `text` LONGTEXT NOT NULL,
    `typeUrl` ENUM('SITE_SECTION', 'CUSTOM_PAGE', 'EXTERNAL_LINK', 'DROPDOWN_LIST') NOT NULL,
    `url` LONGTEXT NOT NULL,
    `hidden` BOOLEAN NOT NULL DEFAULT false,
    `name` LONGTEXT NULL,
    `sections` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Token` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` LONGTEXT NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transfers` ADD CONSTRAINT `Transfers_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transfers` ADD CONSTRAINT `Transfers_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_historyOfPurchaseId_fkey` FOREIGN KEY (`historyOfPurchaseId`) REFERENCES `Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_serverTypeId_fkey` FOREIGN KEY (`serverTypeId`) REFERENCES `ServerType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_serverId_fkey` FOREIGN KEY (`serverId`) REFERENCES `Server`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Server` ADD CONSTRAINT `Server_serverTypeId_fkey` FOREIGN KEY (`serverTypeId`) REFERENCES `ServerType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_serverTypeId_fkey` FOREIGN KEY (`serverTypeId`) REFERENCES `ServerType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Token` ADD CONSTRAINT `Token_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
