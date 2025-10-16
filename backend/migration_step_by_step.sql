-- ============================================
-- EMAIL VERIFICATION MIGRATION
-- Step-by-step guide (safe for all MySQL versions)
-- ============================================

-- ============================================
-- STEP 1: Check if column already exists
-- ============================================
-- Run this first to see if migration is needed
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'email_verified_at';

-- If result is empty (0 rows), proceed to STEP 2
-- If result shows the column, skip to STEP 4


-- ============================================
-- STEP 2: Add email_verified_at column
-- ============================================
-- ONLY run this if STEP 1 returned 0 rows
ALTER TABLE users
ADD COLUMN email_verified_at DATETIME COMMENT 'Timestamp when email was verified';


-- ============================================
-- STEP 3: Create index for performance
-- ============================================
-- Run after STEP 2
CREATE INDEX idx_users_email_verified ON users(email_verified_at);


-- ============================================
-- STEP 4: Update existing users (backward compatibility)
-- ============================================
-- This sets all existing users as "verified" 
-- so they can continue to login without email verification
SET SQL_SAFE_UPDATES = 0;

UPDATE users
SET email_verified_at = created_at
WHERE email_verified_at IS NULL;

SET SQL_SAFE_UPDATES = 1;


-- ============================================
-- STEP 5: Verify the migration
-- ============================================
-- Check column exists
DESCRIBE users;

-- Check data
SELECT 
    id, 
    email, 
    status,
    created_at,
    email_verified_at
FROM users
LIMIT 10;

-- Count verified vs unverified
SELECT 
    CASE 
        WHEN email_verified_at IS NULL THEN 'Not Verified'
        ELSE 'Verified'
    END as verification_status,
    COUNT(*) as count
FROM users
GROUP BY verification_status;


-- ============================================
-- STEP 6: Create email_verification_tokens table
-- ============================================
-- Safe to run multiple times
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


-- ============================================
-- STEP 7: Verify email_verification_tokens table
-- ============================================
DESCRIBE email_verification_tokens;

-- Check foreign key
SHOW CREATE TABLE email_verification_tokens;


-- ============================================
-- DONE! ✅
-- ============================================
-- You can now restart the backend application

