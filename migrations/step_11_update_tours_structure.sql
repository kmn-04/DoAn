-- ================================
-- MIGRATION: STEP 11 - UPDATE TOURS STRUCTURE
-- Date: 2024-12-19
-- Description: Simplify tours table structure
-- ================================

USE doan;

-- Kiểm tra xem step này đã chạy chưa
SELECT COUNT(*) INTO @already_executed FROM migrations WHERE step = 'step_11_update_tours_structure';

-- Chỉ chạy nếu chưa được thực hiện
SET @sql = IF(@already_executed = 0, '
-- Xóa các cột không cần thiết
ALTER TABLE tours 
    DROP COLUMN IF EXISTS excluded_services,
    DROP COLUMN IF EXISTS terms_and_policies,
    DROP COLUMN IF EXISTS meta_title,
    DROP COLUMN IF EXISTS meta_description,
    DROP COLUMN IF EXISTS meta_keywords;

-- Cập nhật enum status - chỉ giữ ACTIVE và INACTIVE
ALTER TABLE tours 
    MODIFY COLUMN status ENUM(''ACTIVE'', ''INACTIVE'') DEFAULT ''ACTIVE'';

-- Cập nhật các tour có status DRAFT thành ACTIVE
UPDATE tours SET status = ''ACTIVE'' WHERE status = ''DRAFT'';

-- Đổi tên cột departure_location thành location
ALTER TABLE tours 
    CHANGE COLUMN departure_location location VARCHAR(100);

-- Tạo index cho location
CREATE INDEX IF NOT EXISTS idx_tours_location ON tours(location);

-- Ghi log migration
INSERT INTO migrations (step, description) VALUES (''step_11_update_tours_structure'', ''Simplify tours table structure'');
', 'SELECT ''STEP 11: Tours structure already updated'' AS status;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'STEP 11: Tours structure update completed' AS status;
