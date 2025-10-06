-- Add helpful_user_ids to track who voted
ALTER TABLE reviews 
ADD COLUMN helpful_user_ids TEXT DEFAULT NULL 
COMMENT 'Comma-separated list of user IDs who voted helpful';

-- Example: helpful_user_ids = "1,5,12,99" means users 1, 5, 12, 99 voted

