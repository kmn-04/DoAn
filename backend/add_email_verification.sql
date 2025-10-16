-- Add email verification table
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

-- Add email_verified_at column to users table if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified_at DATETIME COMMENT 'Timestamp when email was verified';

-- Create index on email_verified_at for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified_at);

-- Update existing users to have verified emails (for backward compatibility)
-- You can comment this out if you want to force all existing users to verify
UPDATE users
SET email_verified_at = created_at
WHERE email_verified_at IS NULL;

-- Verify the changes
SELECT 
    id, 
    email, 
    status,
    email_verified_at,
    created_at
FROM users
LIMIT 10;

-- Check the new table structure
DESCRIBE email_verification_tokens;

