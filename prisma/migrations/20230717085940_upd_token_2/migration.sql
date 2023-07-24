-- AlterTable
ALTER TABLE `Token` MODIFY `browser` VARCHAR(191) NULL DEFAULT 'postman',
    MODIFY `clientIp` VARCHAR(191) NULL,
    MODIFY `deviceName` VARCHAR(191) NULL,
    MODIFY `deviceType` VARCHAR(191) NULL,
    MODIFY `os` VARCHAR(191) NULL;
