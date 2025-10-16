-- Update existing tour rating cache data
-- Run this if columns already exist from Hibernate auto-ddl

-- Temporarily disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Populate existing data
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

-- Verify the update
SELECT 
    id,
    name,
    average_rating,
    review_count
FROM tours
WHERE review_count > 0
ORDER BY average_rating DESC
LIMIT 10;

-- Show statistics
SELECT 
    COUNT(*) as total_tours,
    COUNT(CASE WHEN review_count > 0 THEN 1 END) as tours_with_reviews,
    ROUND(AVG(average_rating), 2) as overall_avg_rating,
    SUM(review_count) as total_reviews
FROM tours;

