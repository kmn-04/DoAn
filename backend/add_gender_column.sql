-- Add gender column to users table
-- Run this script in MySQL Workbench

-- Step 1: Check if column exists
SELECT COUNT(*) as column_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME = 'gender';

-- Step 2: Add gender column (only if result from Step 1 is 0)
ALTER TABLE users
ADD COLUMN gender ENUM('MALE', 'FEMALE', 'OTHER') NULL
COMMENT 'User gender for auto-fill booking forms';

-- Step 3: Verify
DESCRIBE users;

-- Step 4: Sample query to see new column
SELECT id, name, email, gender, dob
FROM users
LIMIT 5;

