/*
  Warnings:

  - You are about to drop the column `label` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `previewImage` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `item` on the `urlSettings` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `urlSettings` table. All the data in the column will be lost.
  - You are about to alter the column `sections` on the `urlSettings` table. The data in that column could be lost. The data in that column will be cast from `LongText` to `Json`.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `label`,
    DROP COLUMN `previewImage`;

-- AlterTable
ALTER TABLE `urlSettings` DROP COLUMN `item`,
    DROP COLUMN `name`,
    MODIFY `icon` LONGTEXT NULL,
    MODIFY `sections` JSON NULL,
    MODIFY `isHaveSidebar` BOOLEAN NULL;
