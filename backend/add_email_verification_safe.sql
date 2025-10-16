-- Safe migration for email verification
-- Works with all MySQL versions

-- Step 1: Create email_verification_tokens table (safe to run multiple times)
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    expires_at DATETIME NOT NULL,
    verified_at DATETIME,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Check if email_verified_at column exists
SELECT COUNT(*) as column_exists
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'email_verified_at';

-- Step 3: Add email_verified_at column if not exists
-- Copy and run this ONLY if the above query returns 0
-- If it returns 1, skip this step

-- ONLY RUN THIS IF COLUMN DOESN'T EXIST:
-- ALTER TABLE users
-- ADD COLUMN email_verified_at DATETIME COMMENT 'Timestamp when email was verified';

-- Step 4: Create index on email_verified_at (safe - creates only if not exists)
-- Run this after Step 3
-- CREATE INDEX idx_users_email_verified ON users(email_verified_at);

-- Step 5: Update existing users to have verified emails (for backward compatibility)
-- Run this ONLY ONCE after adding the column
-- UPDATE users
-- SET email_verified_at = created_at
-- WHERE email_verified_at IS NULL;

-- Step 6: Verify the table structure
DESCRIBE email_verification_tokens;

-- Step 7: Check users table
DESCRIBE users;

