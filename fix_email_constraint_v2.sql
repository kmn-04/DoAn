-- Fix Email Constraint - Final Solution

-- Step 1: Drop the problematic functional index
-- Note: If index doesn't exist, this will error - it's okay, just continue
DROP INDEX unique_email_active ON users;

-- Step 2: Drop the original UNIQUE constraint on email
-- Note: If index doesn't exist, this will error - it's okay
DROP INDEX email ON users;

-- Step 3: Done!
-- Now the backend validation (existsByEmailAndNotDeleted) will handle email uniqueness
-- This allows reusing emails from soft-deleted users
