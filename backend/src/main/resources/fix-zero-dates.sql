-- Fix zero date values in cancellation_policies table
UPDATE cancellation_policies 
SET effective_from = CURRENT_TIMESTAMP 
WHERE effective_from = '0000-00-00 00:00:00' OR effective_from IS NULL;

-- Set default created_by for existing policies
UPDATE cancellation_policies 
SET created_by = 1 
WHERE created_by IS NULL;

-- Verify the fixes
SELECT id, name, effective_from, created_by FROM cancellation_policies;
