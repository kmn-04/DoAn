-- Migration: Add cached rating fields to tours table
-- This improves performance by avoiding repeated queries to reviews table

-- Step 1: Add new columns
ALTER TABLE tours 
ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Cached average rating from approved reviews',
ADD COLUMN review_count BIGINT DEFAULT 0 COMMENT 'Cached count of approved reviews';

-- Step 2: Create index for faster queries
CREATE INDEX idx_tours_rating ON tours(average_rating DESC);

-- Step 3: Populate existing data
-- Temporarily disable safe update mode for this migration
SET SQL_SAFE_UPDATES = 0;

UPDATE tours t
LEFT JOIN (
    SELECT 
        tour_id,
        ROUND(AVG(rating), 2) as avg_rating,
        COUNT(*) as total_reviews
    FROM reviews
    WHERE status = 'APPROVED'
    GROUP BY tour_id
) r ON t.id = r.tour_id
SET 
    t.average_rating = COALESCE(r.avg_rating, 0.00),
    t.review_count = COALESCE(r.total_reviews, 0);

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Step 4: Verify the migration
SELECT 
    id,
    name,
    average_rating,
    review_count
FROM tours
WHERE review_count > 0
ORDER BY average_rating DESC
LIMIT 10;

-- Step 5: Show statistics
SELECT 
    COUNT(*) as total_tours,
    COUNT(CASE WHEN review_count > 0 THEN 1 END) as tours_with_reviews,
    ROUND(AVG(average_rating), 2) as overall_avg_rating,
    SUM(review_count) as total_reviews
FROM tours;

