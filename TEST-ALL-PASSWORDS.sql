-- ==========================================
-- KIỂM TRA PASSWORD HASH TRONG DATABASE
-- ==========================================
USE doan;

SELECT 
    id,
    email,
    password as full_password_hash,
    SUBSTRING(password, 1, 20) as hash_start,
    CHAR_LENGTH(password) as hash_length,
    role_id,
    status
FROM users 
WHERE id IN (1, 2, 999)
ORDER BY id;

-- ==========================================
-- SO SÁNH VỚI CÁC HASH PHỔ BIẾN:
-- ==========================================
-- "password"  → $2a$10$eImiTXuWVxfm37uY4JANjQ1xjToMZFLmAiLhGOXjqb6Fn6r/LqDOK
-- "admin123"  → $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- "Admin@123" → $2a$10$N9qo8uLOickgx2ZMRZoMye7I6IFYLm5l9Y4E.3XmJJ5AKp5BgHEK2
-- ==========================================
