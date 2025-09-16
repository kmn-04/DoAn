-- Script để bỏ cột slug khỏi bảng categories
USE doan;

-- Kiểm tra xem cột slug có tồn tại không
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'doan'
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'slug'
);

-- Xóa cột slug nếu tồn tại
SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE categories DROP COLUMN slug;', 
    'SELECT "slug column does not exist" AS status;'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Xóa index slug nếu tồn tại
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = 'doan'
    AND TABLE_NAME = 'categories'
    AND INDEX_NAME = 'idx_categories_slug'
);

SET @sql = IF(@index_exists > 0, 
    'DROP INDEX idx_categories_slug ON categories;', 
    'SELECT "slug index does not exist" AS status;'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Slug column and index removed successfully' AS status;
