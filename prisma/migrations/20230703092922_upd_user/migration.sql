/*
  Warnings:

  - A unique constraint covering the columns `[steamID]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `steamID` VARCHAR(191) NOT NULL,
    MODIFY `bonusBalance` INTEGER NOT NULL DEFAULT 0,
    MODIFY `firstDateAuth` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `lvl` INTEGER NOT NULL DEFAULT 1,
    MODIFY `experience` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX `User_steamID_key` ON `User`(`steamID`);
