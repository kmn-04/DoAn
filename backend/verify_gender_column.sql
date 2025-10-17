-- Verify gender column exists and check its structure
-- Run this in MySQL Workbench

-- Check column details
SELECT 
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'gender';

-- View table structure
DESCRIBE users;

-- Sample data with gender column
SELECT 
    id, 
    name, 
    email, 
    phone,
    dob as date_of_birth,
    gender,
    status,
    created_at
FROM users
ORDER BY id DESC
LIMIT 10;

