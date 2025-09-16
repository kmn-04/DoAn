-- ================================
-- MIGRATION: CATEGORIES UPDATE - ADD DISPLAY ORDER AND SLUG
-- Date: 2024-12-12
-- Description: Add display_order, slug, and gallery_images to categories
-- ================================

USE doan;

-- Kiểm tra xem cột display_order đã tồn tại chưa
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'doan'
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'display_order'
);

-- Thêm cột display_order nếu chưa tồn tại
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE categories ADD COLUMN display_order INT DEFAULT 0 AFTER description;', 
    'SELECT "display_order column already exists" AS status;'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Kiểm tra xem cột slug đã tồn tại chưa
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'doan'
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'slug'
);

-- Thêm cột slug nếu chưa tồn tại
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE categories ADD COLUMN slug VARCHAR(100) UNIQUE AFTER name;', 
    'SELECT "slug column already exists" AS status;'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Kiểm tra xem cột gallery_images đã tồn tại chưa
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'doan'
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'gallery_images'
);

-- Thêm cột gallery_images nếu chưa tồn tại
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE categories ADD COLUMN gallery_images JSON AFTER image_url;', 
    'SELECT "gallery_images column already exists" AS status;'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Cập nhật display_order cho các danh mục hiện tại
UPDATE categories SET display_order = id WHERE display_order = 0;

-- Cập nhật slug cho các danh mục hiện tại nếu chưa có
UPDATE categories SET slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), 'ư', 'u'), 'ă', 'a')) WHERE slug IS NULL;

-- Tạo index cho display_order và slug
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

SELECT 'Categories table updated successfully' AS status;
