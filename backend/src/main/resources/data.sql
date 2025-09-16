-- Sample data will be automatically loaded when Spring Boot starts
-- Only inserts if data doesn't exist (using INSERT IGNORE)

-- Tạo admin mặc định (password: admin123) - có thể login bằng email hoặc phone
INSERT IGNORE INTO users (username, email, phone, password, full_name, role, is_active) VALUES 
('admin', 'admin@tourism.com', '0909999999', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lXZ2hPymu5ws2QLiq', 'System Administrator', 'ADMIN', true);

-- Tạo staff mẫu (password: staff123)  
INSERT IGNORE INTO users (username, email, password, full_name, phone, address, role, is_active) VALUES 
('staff1', 'staff@example.com', '$2a$10$8ZYJqWf5VwgMZI4XpCr7RO8GZQr9KhQh6k5GjUABrCh7IwSTFd5gG', 'Nguyễn Văn A', '0901234567', '123 Đường ABC, Quận 1, TP.HCM', 'STAFF', true);

-- Tạo user thường mẫu (password: user123)
INSERT IGNORE INTO users (username, email, password, full_name, phone, address, role, is_active) VALUES 
('user1', 'user@example.com', '$2a$10$9ZYJqWf5VwgMZI4XpCr7RO8GZQr9KhQh6k5GjUABrCh7IwSTFd5gH', 'Trần Thị B', '0987654321', '456 Đường XYZ, Quận 2, TP.HCM', 'USER', true);

-- Tạo user demo Google (sẽ được link khi test social login)
INSERT IGNORE INTO users (username, email, password, full_name, role, is_active, google_id) VALUES 
('googledemo', 'user@gmail.com', '$2a$10$9ZYJqWf5VwgMZI4XpCr7RO8GZQr9KhQh6k5GjUABrCh7IwSTFd5gH', 'Google User', 'USER', true, 'google_user_123');

-- Tạo user demo Facebook (sẽ được link khi test social login)
INSERT IGNORE INTO users (username, email, password, full_name, role, is_active, facebook_id) VALUES 
('facebookdemo', 'user@facebook.com', '$2a$10$9ZYJqWf5VwgMZI4XpCr7RO8GZQr9KhQh6k5GjUABrCh7IwSTFd5gH', 'Facebook User', 'USER', true, 'facebook_user_123');
