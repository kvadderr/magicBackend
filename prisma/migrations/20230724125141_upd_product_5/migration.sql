/*
  Warnings:

  - You are about to drop the column `isBackground` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `isBackground`,
    ADD COLUMN `isBackgroundColor` BOOLEAN NOT NULL DEFAULT false;
