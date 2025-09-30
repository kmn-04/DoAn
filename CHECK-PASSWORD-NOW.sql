-- ==========================================
-- KIỂM TRA PASSWORD HIỆN TẠI
-- ==========================================
USE doan;

-- Xem toàn bộ thông tin user
SELECT 
    id, 
    name,
    email, 
    password,
    role_id,
    status,
    LENGTH(password) as password_length,
    CASE 
        WHEN password = '$2a$10$eImiTXuWVxfm37uY4JANjQ1xjToMZFLmAiLhGOXjqb6Fn6r/LqDOK' 
        THEN '✅ CORRECT HASH for "password"'
        ELSE '❌ WRONG HASH'
    END as hash_check
FROM users 
WHERE email IN ('customer@test.com', 'admin@travelbooking.vn', 'staff@travelbooking.vn')
ORDER BY id;
