/*
  Warnings:

  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - Added the required column `name_en` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name_ru` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Product` RENAME COLUMN `description` TO `description_ru`,
    RENAME COLUMN `name` TO  `name_ru`,
    ADD COLUMN `description_en` LONGTEXT NULL,
    ADD COLUMN `name_en` LONGTEXT NOT NULL;
