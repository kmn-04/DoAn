-- Fix old CancellationStatus enum values
-- Change 'REQUESTED' to 'PENDING' to match the current enum definition

UPDATE booking_cancellations 
SET status = 'PENDING' 
WHERE status = 'REQUESTED';

