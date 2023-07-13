/*
  Warnings:

  - Added the required column `serverID` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Server` ADD COLUMN `serverID` INTEGER NOT NULL;
