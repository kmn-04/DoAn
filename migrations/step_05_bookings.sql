-- ================================
-- MIGRATION: STEP 5 - BOOKINGS
-- Date: 2024-12-12
-- Description: Tour booking system
-- ================================

USE doan;

-- Kiểm tra xem step này đã chạy chưa
SELECT COUNT(*) INTO @already_executed FROM migrations WHERE step = 'step_05_bookings';

-- Chỉ chạy nếu chưa được thực hiện
SET @sql = IF(@already_executed = 0, '
-- Tạo bảng bookings
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    tour_id BIGINT NOT NULL,
    participants INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    travel_date DATE NOT NULL,
    status ENUM(''PENDING'', ''CONFIRMED'', ''CANCELLED'', ''COMPLETED'') DEFAULT ''PENDING'',
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tour_id) REFERENCES tours(id)
);

-- Tạo indexes
CREATE INDEX idx_bookings_code ON bookings(booking_code);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_tour ON bookings(tour_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(travel_date);

-- Ghi log migration
INSERT INTO migrations (step, description) VALUES (''step_05_bookings'', ''Tour booking system'');
', 'SELECT ''STEP 5: Bookings already exists'' AS status;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'STEP 5: Bookings system completed' AS status;
