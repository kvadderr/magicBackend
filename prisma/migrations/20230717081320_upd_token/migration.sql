/*
  Warnings:

  - Added the required column `browser` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientIp` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceName` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceType` to the `Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `os` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Token` ADD COLUMN `browser` VARCHAR(191) NOT NULL,
    ADD COLUMN `clientIp` VARCHAR(191) NOT NULL,
    ADD COLUMN `deviceName` VARCHAR(191) NOT NULL,
    ADD COLUMN `deviceType` VARCHAR(191) NOT NULL,
    ADD COLUMN `os` VARCHAR(191) NOT NULL;
