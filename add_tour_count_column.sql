-- Script để thêm cột tour_count vào bảng categories
USE doan;

-- Kiểm tra xem cột tour_count có tồn tại không
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = 'doan'
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'tour_count'
);

-- Thêm cột tour_count nếu chưa tồn tại
SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE categories ADD COLUMN tour_count INT DEFAULT 0;', 
    'SELECT "tour_count column already exists" AS status;'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Cập nhật số lượng tour cho mỗi danh mục
UPDATE categories 
SET tour_count = (
    SELECT COUNT(*) 
    FROM tours 
    WHERE tours.category_id = categories.id
)
WHERE tour_count IS NULL OR tour_count = 0;

SELECT 'Tour count column added and updated successfully' AS status;

-- Hiển thị kết quả
SELECT 
    id,
    name,
    tour_count,
    (SELECT COUNT(*) FROM tours WHERE category_id = categories.id) as actual_count
FROM categories
ORDER BY name;
