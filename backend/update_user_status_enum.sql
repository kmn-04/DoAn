-- Update User status enum to include PENDING
-- This must be run BEFORE using the email verification feature

-- Step 1: Check current enum values
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'tour_booking_db'  -- Change to your database name if different
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'status';

-- Step 2: Modify the enum to include PENDING
-- Note: MySQL requires listing ALL enum values when modifying
ALTER TABLE users
MODIFY COLUMN status ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'BANNED') 
NOT NULL 
DEFAULT 'ACTIVE';

-- Step 3: Verify the change
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'tour_booking_db'  -- Change to your database name if different
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'status';

-- Step 4: Check existing users - they should all still be ACTIVE
SELECT id, email, status, email_verified_at
FROM users
LIMIT 10;

SELECT 
    status, 
    COUNT(*) as count
FROM users
GROUP BY status;

