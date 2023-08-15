/*
  Warnings:

  - Added the required column `sortedMonth` to the `Visitors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Visitors` ADD COLUMN `sortedMonth` VARCHAR(191) NOT NULL;
