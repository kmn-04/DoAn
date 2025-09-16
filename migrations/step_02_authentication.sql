-- ================================
-- MIGRATION: STEP 2 - AUTHENTICATION
-- Date: 2024-12-12
-- Description: User authentication system
-- ================================

USE doan;

-- Kiểm tra xem step này đã chạy chưa
SELECT COUNT(*) INTO @already_executed FROM migrations WHERE step = 'step_02_authentication';

-- Chỉ chạy nếu chưa được thực hiện
SET @sql = IF(@already_executed = 0, '
-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM(''ADMIN'', ''CUSTOMER'', ''USER'') NOT NULL DEFAULT ''USER'',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Thêm dữ liệu mẫu
INSERT INTO users (username, email, password, full_name, role) VALUES 
(''admin'', ''admin@tourism.com'', ''$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lXZ2hPymu5ws2QLiq'', ''System Administrator'', ''ADMIN'');

INSERT INTO users (username, email, password, full_name, phone, address, role) VALUES 
(''customer1'', ''customer@example.com'', ''$2a$10$8ZYJqWf5VwgMZI4XpCr7RO8GZQr9KhQh6k5GjUABrCh7IwSTFd5gG'', ''Nguyễn Văn A'', ''0901234567'', ''123 Đường ABC, Quận 1, TP.HCM'', ''CUSTOMER'');

INSERT INTO users (username, email, password, full_name, phone, address, role) VALUES 
(''user1'', ''user@example.com'', ''$2a$10$9ZYJqWf5VwgMZI4XpCr7RO8GZQr9KhQh6k5GjUABrCh7IwSTFd5gH'', ''Trần Thị B'', ''0987654321'', ''456 Đường XYZ, Quận 2, TP.HCM'', ''USER'');

-- Ghi log migration
INSERT INTO migrations (step, description) VALUES (''step_02_authentication'', ''User authentication system'');
', 'SELECT ''STEP 2: Authentication already exists'' AS status;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'STEP 2: Authentication system completed' AS status;
