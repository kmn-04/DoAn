-- ================================
-- MIGRATION: STEP 4 - TOURS
-- Date: 2024-12-12
-- Description: Tour management system
-- ================================

USE doan;

-- Kiểm tra xem step này đã chạy chưa
SELECT COUNT(*) INTO @already_executed FROM migrations WHERE step = 'step_04_tours';

-- Chỉ chạy nếu chưa được thực hiện
SET @sql = IF(@already_executed = 0, '
-- Tạo bảng tours
CREATE TABLE IF NOT EXISTS tours (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    max_participants INT NOT NULL,
    departure_location VARCHAR(100),
    destination VARCHAR(100),
    category_id BIGINT,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tạo bảng tour_images
CREATE TABLE IF NOT EXISTS tour_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tour_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- Tạo indexes
CREATE INDEX idx_tours_title ON tours(title);
CREATE INDEX idx_tours_price ON tours(price);
CREATE INDEX idx_tours_category ON tours(category_id);
CREATE INDEX idx_tours_active ON tours(is_active);
CREATE INDEX idx_tour_images_tour ON tour_images(tour_id);

-- Ghi log migration
INSERT INTO migrations (step, description) VALUES (''step_04_tours'', ''Tour management system'');
', 'SELECT ''STEP 4: Tours already exists'' AS status;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'STEP 4: Tours system completed' AS status;
