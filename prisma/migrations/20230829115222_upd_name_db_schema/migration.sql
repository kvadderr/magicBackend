/*
  Warnings:

  - You are about to drop the `baseSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `urlSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
ALTER TABLE `baseSettings` RENAME TO `BaseSettings`;
ALTER TABLE `urlSettings` RENAME TO `UrlSettings`;
