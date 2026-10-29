-- Start the Article.numericId sequence at 1000 instead of 1.
-- (No-op on a database that already has rows with numericId >= 1000 — MySQL
-- never lowers AUTO_INCREMENT below the current max + 1.)
ALTER TABLE `Article` AUTO_INCREMENT = 1000;
