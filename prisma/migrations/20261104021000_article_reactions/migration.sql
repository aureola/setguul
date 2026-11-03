CREATE TABLE `ArticleReaction` (
    `id` VARCHAR(191) NOT NULL,
    `voterId` VARCHAR(36) NOT NULL,
    `emoji` VARCHAR(16) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `articleId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ArticleReaction_articleId_voterId_key`(`articleId`, `voterId`),
    INDEX `ArticleReaction_articleId_emoji_idx`(`articleId`, `emoji`),
    PRIMARY KEY (`id`),
    CONSTRAINT `ArticleReaction_articleId_fkey` FOREIGN KEY (`articleId`) REFERENCES `Article`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
