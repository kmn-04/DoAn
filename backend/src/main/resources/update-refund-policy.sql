-- Update existing policies to new refund rates
UPDATE cancellation_policies 
SET 
    hours_before_departure_full_refund = 72,    -- 3 days = 100%
    hours_before_departure_partial_refund = 24, -- 1 day = 80% 
    hours_before_departure_no_refund = 6,       -- 6 hours = 0%
    full_refund_percentage = 100.00,
    partial_refund_percentage = 80.00,          -- Changed from 50% to 80%
    no_refund_percentage = 0.00,
    cancellation_fee = 100000.00,               -- 100k VND
    processing_fee = 50000.00,                  -- 50k VND
    is_active = TRUE,
    effective_from = CURRENT_TIMESTAMP
WHERE is_active = TRUE;

-- Insert new default policy if none exists
INSERT IGNORE INTO cancellation_policies
(name, description, policy_type, hours_before_departure_full_refund, 
 hours_before_departure_partial_refund, hours_before_departure_no_refund,
 full_refund_percentage, partial_refund_percentage, no_refund_percentage,
 cancellation_fee, processing_fee, minimum_notice_hours, status, 
 is_active, effective_from, created_by, priority)
VALUES
('Updated Standard Policy', 'Updated policy with better refund rates', 'STANDARD', 
 72, 24, 6, 100.00, 80.00, 0.00, 100000.00, 50000.00, 1, 'ACTIVE', 
 TRUE, CURRENT_TIMESTAMP, 1, 1);

-- Verify the update
SELECT id, name, hours_before_departure_full_refund, hours_before_departure_partial_refund,
       full_refund_percentage, partial_refund_percentage, cancellation_fee, processing_fee
FROM cancellation_policies 
WHERE is_active = TRUE;
