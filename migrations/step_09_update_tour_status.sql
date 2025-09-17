-- Migration: Update tour status from DRAFT to ACTIVE
-- This migration handles existing tours that might have DRAFT status

USE tourism_db;

-- Update existing tours with DRAFT status to ACTIVE
UPDATE tours SET status = 'ACTIVE' WHERE status = 'DRAFT';

-- Verify the update
SELECT 'Tours updated successfully' as message, COUNT(*) as total_tours FROM tours;
SELECT status, COUNT(*) as count FROM tours GROUP BY status;
