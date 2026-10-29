-- AlterTable
ALTER TABLE `Article`
    ADD COLUMN `numericId` INTEGER NOT NULL AUTO_INCREMENT,
    ADD UNIQUE INDEX `Article_numericId_key` (`numericId`);
