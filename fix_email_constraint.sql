-- Fix Email Constraint to Allow Reusing Emails from Deleted Users

-- Step 1: Drop existing UNIQUE constraint on email
ALTER TABLE users DROP INDEX email;

-- Step 2: Remove the UNIQUE constraint entirely
-- We will rely on application-level validation instead
-- The backend already checks existsByEmailAndNotDeleted()

-- Note: MySQL doesn't support partial indexes like PostgreSQL
-- So we cannot create: CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL
-- Therefore, we remove the database constraint and use application validation.
