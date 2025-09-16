-- Kiểm tra database và users
USE doan;

-- Kiểm tra có database không
SHOW TABLES;

-- Kiểm tra có users không
SELECT COUNT(*) as total_users FROM users;

-- Xem tất cả users
SELECT id, username, email, full_name, role, is_active FROM users;

-- Kiểm tra user admin cụ thể
SELECT * FROM users WHERE username = 'admin';



