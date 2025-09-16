-- ================================
-- MIGRATION: STEP 3 - CATEGORIES
-- Date: 2024-12-12
-- Description: Tour categories management
-- ================================

USE doan;

-- Kiểm tra xem step này đã chạy chưa
SELECT COUNT(*) INTO @already_executed FROM migrations WHERE step = 'step_03_categories';

-- Chỉ chạy nếu chưa được thực hiện
SET @sql = IF(@already_executed = 0, '
-- Tạo bảng categories
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo indexes
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Thêm dữ liệu mẫu
INSERT INTO categories (name, description) VALUES 
(''Du lịch biển'', ''Các tour du lịch nghỉ dưỡng tại bãi biển''),
(''Du lịch núi'', ''Các tour khám phá thiên nhiên và leo núi''),
(''Du lịch văn hóa'', ''Các tour tìm hiểu văn hóa và lịch sử''),
(''Du lịch ẩm thực'', ''Các tour khám phá ẩm thực địa phương''),
(''Du lịch phiêu lưu'', ''Các tour thể thao mạo hiểm và phiêu lưu'');

-- Ghi log migration
INSERT INTO migrations (step, description) VALUES (''step_03_categories'', ''Tour categories management'');
', 'SELECT ''STEP 3: Categories already exists'' AS status;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'STEP 3: Categories system completed' AS status;
