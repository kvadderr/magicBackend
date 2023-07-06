/*
  Warnings:

  - Added the required column `activationDelaySeconds` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `text` to the `urlSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `activationDelaySeconds` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `urlSettings` ADD COLUMN `text` LONGTEXT NOT NULL;
