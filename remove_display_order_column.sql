-- ================================
-- MIGRATION: Remove display_order column from categories table
-- Date: 2024-12-17
-- Description: Remove display_order column as it's no longer needed
-- ================================

USE doan;

-- Check if the column exists before attempting to drop it
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'doan'
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'display_order'
);

-- Drop the column if it exists
SET @sql = IF(@column_exists > 0,
    'ALTER TABLE categories DROP COLUMN display_order;',
    'SELECT "Column display_order does not exist in categories table" AS status;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the column has been removed
SELECT 'display_order column removal completed' AS status;
