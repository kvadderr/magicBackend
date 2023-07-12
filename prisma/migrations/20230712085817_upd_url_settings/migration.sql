/*
  Warnings:

  - Added the required column `isHaveSidebar` to the `urlSettings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `item` to the `urlSettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `urlSettings` ADD COLUMN `isHaveSidebar` BOOLEAN NOT NULL,
    ADD COLUMN `item` JSON NOT NULL,
    MODIFY `text` LONGTEXT NULL;
