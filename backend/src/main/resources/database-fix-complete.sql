-- Complete database fix for cancellation system
-- Fix 1: Remove policy_name column if exists (schema mismatch)
ALTER TABLE cancellation_policies DROP COLUMN IF EXISTS policy_name;

-- Fix 2: Fix zero dates in existing data
UPDATE cancellation_policies 
SET effective_from = CURRENT_TIMESTAMP 
WHERE effective_from = '0000-00-00 00:00:00' OR effective_from IS NULL;

UPDATE cancellation_policies 
SET created_at = CURRENT_TIMESTAMP 
WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL;

UPDATE cancellation_policies 
SET updated_at = CURRENT_TIMESTAMP 
WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL;

-- Fix 3: Set default created_by for existing policies
UPDATE cancellation_policies 
SET created_by = 1 
WHERE created_by IS NULL;

-- Fix 4: Update invalid policy_type values
UPDATE cancellation_policies 
SET policy_type = 'STANDARD' 
WHERE policy_type NOT IN ('STANDARD', 'FLEXIBLE', 'STRICT', 'CUSTOM');

-- Fix 5: Ensure we have at least one valid default policy
INSERT IGNORE INTO cancellation_policies 
(name, description, policy_type, hours_before_departure_full_refund, hours_before_departure_partial_refund, 
 hours_before_departure_no_refund, full_refund_percentage, partial_refund_percentage, no_refund_percentage,
 cancellation_fee, processing_fee, minimum_notice_hours, status, is_active, effective_from, created_by, priority)
VALUES 
('System Default Policy', 'Default cancellation policy for all tours', 'STANDARD', 
 48, 24, 12, 100.00, 50.00, 0.00, 50000, 25000, 1, 'ACTIVE', true, CURRENT_TIMESTAMP, 1, 1);

-- Verify the fixes
SELECT 'Policies after fix:' as status;
SELECT id, name, effective_from, created_by, status FROM cancellation_policies LIMIT 5;
