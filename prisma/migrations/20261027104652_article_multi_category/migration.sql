-- CreateTable: implicit many-to-many join table between Article and Category
CREATE TABLE `_ArticleToCategory` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_ArticleToCategory_AB_unique`(`A`, `B`),
    INDEX `_ArticleToCategory_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ArticleToCategory` ADD CONSTRAINT `_ArticleToCategory_A_fkey` FOREIGN KEY (`A`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ArticleToCategory` ADD CONSTRAINT `_ArticleToCategory_B_fkey` FOREIGN KEY (`B`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill existing single-category assignments into the join table
INSERT INTO `_ArticleToCategory` (`A`, `B`)
SELECT `id`, `categoryId` FROM `Article`;

-- Drop the old single-category column and its constraints
ALTER TABLE `Article` DROP FOREIGN KEY `Article_categoryId_fkey`;
ALTER TABLE `Article` DROP INDEX `Article_categoryId_idx`;
ALTER TABLE `Article` DROP COLUMN `categoryId`;
