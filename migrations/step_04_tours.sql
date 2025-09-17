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
    short_description VARCHAR(500),
    description TEXT,
    departure_location VARCHAR(100),
    category_id BIGINT,
    target_audience JSON,
    duration_days INT NOT NULL,
    duration_nights INT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    discounted_price DECIMAL(12,2),
    min_participants INT,
    max_participants INT,
    gallery_images JSON,
    included_services TEXT,
    excluded_services TEXT,
    terms_and_policies TEXT,
    status ENUM(''DRAFT'', ''ACTIVE'', ''INACTIVE'') DEFAULT ''DRAFT'',
    is_featured BOOLEAN DEFAULT FALSE,
    difficulty_level ENUM(''EASY'', ''MEDIUM'', ''HARD'') DEFAULT ''EASY'',
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Tạo bảng tour_itinerary
CREATE TABLE IF NOT EXISTS tour_itinerary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tour_id BIGINT NOT NULL,
    day_number INT NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
);

-- Tạo bảng tour_itinerary_partners
CREATE TABLE IF NOT EXISTS tour_itinerary_partners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    itinerary_id BIGINT NOT NULL,
    partner_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (itinerary_id) REFERENCES tour_itinerary(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE
);

-- Tạo indexes
CREATE INDEX idx_tours_title ON tours(title);
CREATE INDEX idx_tours_price ON tours(price);
CREATE INDEX idx_tours_category ON tours(category_id);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_featured ON tours(is_featured);
CREATE INDEX idx_tour_itinerary_tour ON tour_itinerary(tour_id);
CREATE INDEX idx_tour_itinerary_day ON tour_itinerary(day_number);
CREATE INDEX idx_tour_itinerary_partners_itinerary ON tour_itinerary_partners(itinerary_id);
CREATE INDEX idx_tour_itinerary_partners_partner ON tour_itinerary_partners(partner_id);

-- Ghi log migration
INSERT INTO migrations (step, description) VALUES (''step_04_tours'', ''Tour management system'');
', 'SELECT ''STEP 4: Tours already exists'' AS status;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'STEP 4: Tours system completed' AS status;
