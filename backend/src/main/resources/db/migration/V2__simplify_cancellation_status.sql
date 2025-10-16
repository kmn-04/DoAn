-- Migration: Simplify cancellation status from 5 to 3 statuses
-- Date: 2025-10-15
-- Author: System

-- Update existing statuses to new simplified statuses
UPDATE booking_cancellations 
SET status = 'PENDING' 
WHERE status IN ('REQUESTED', 'UNDER_REVIEW');

UPDATE booking_cancellations 
SET status = 'APPROVED' 
WHERE status = 'COMPLETED';

-- Note: APPROVED and REJECTED statuses remain unchanged

-- Verify the migration
SELECT status, COUNT(*) as count 
FROM booking_cancellations 
GROUP BY status;

