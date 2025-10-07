-- Add recipient_type column to notifications table
ALTER TABLE notifications 
ADD COLUMN recipient_type VARCHAR(20) DEFAULT 'ALL' AFTER link;

-- Update existing notifications to have ALL as default
UPDATE notifications 
SET recipient_type = 'ALL' 
WHERE recipient_type IS NULL;
