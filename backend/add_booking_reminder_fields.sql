-- Migration: Add reminder tracking fields to bookings table
-- This enables automated reminder email system

-- Add reminder tracking columns
ALTER TABLE bookings 
ADD COLUMN reminder_sent BOOLEAN DEFAULT false COMMENT 'Whether reminder email has been sent',
ADD COLUMN reminder_sent_at DATETIME NULL COMMENT 'When reminder email was sent';

-- Create index for efficient querying
CREATE INDEX idx_bookings_reminder ON bookings(reminder_sent, start_date);

-- Verify the migration
SELECT 
    id,
    booking_code,
    start_date,
    confirmation_status,
    reminder_sent,
    reminder_sent_at
FROM bookings
LIMIT 10;

-- Show statistics
SELECT 
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN reminder_sent = true THEN 1 END) as reminders_sent,
    COUNT(CASE WHEN reminder_sent = false AND confirmation_status = 'CONFIRMED' THEN 1 END) as pending_reminders
FROM bookings;

