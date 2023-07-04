/*
  Warnings:

  - Added the required column `reactiviationDelaySeconds` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Product` ADD COLUMN `reactiviationDelaySeconds` INTEGER NOT NULL;
