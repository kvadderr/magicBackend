/*
  Warnings:

  - You are about to drop the column `date` on the `Visitors` table. All the data in the column will be lost.
  - Added the required column `sortDate` to the `Visitors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Visitors` DROP COLUMN `date`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `sortDate` VARCHAR(191) NOT NULL;
