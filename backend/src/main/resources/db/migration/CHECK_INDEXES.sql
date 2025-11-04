-- =====================================================
-- KIỂM TRA VÀ TEST DATABASE INDEXES
-- Chạy các query này để verify indexes đã được tạo và hoạt động
-- =====================================================

-- =====================================================
-- 1. XEM TẤT CẢ INDEXES TRONG DATABASE
-- =====================================================

-- Xem tổng quan tất cả indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    NON_UNIQUE,
    INDEX_TYPE
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'doan' 
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Đếm số indexes theo bảng
SELECT 
    TABLE_NAME,
    COUNT(DISTINCT INDEX_NAME) as INDEX_COUNT
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'doan'
GROUP BY TABLE_NAME
ORDER BY INDEX_COUNT DESC;

-- =====================================================
-- 2. KIỂM TRA INDEXES CỦA TỪNG BẢNG QUAN TRỌNG
-- =====================================================

-- Tours table indexes
SHOW INDEX FROM tours;

-- Bookings table indexes
SHOW INDEX FROM bookings;

-- Payments table indexes
SHOW INDEX FROM payments;

-- Reviews table indexes
SHOW INDEX FROM reviews;

-- Users table indexes
SHOW INDEX FROM users;

-- =====================================================
-- 3. TEST QUERY PERFORMANCE VỚI EXPLAIN
-- =====================================================

-- Test 1: Query tours by status (nên dùng idx_tours_status)
EXPLAIN SELECT * FROM tours WHERE status = 'ACTIVE';

-- Test 2: Query tours by slug (nên dùng idx_tours_slug hoặc UNIQUE index)
EXPLAIN SELECT * FROM tours WHERE slug = 'ha-noi-city-tour';

-- Test 3: Query bookings by user (nên dùng idx_bookings_user_id)
EXPLAIN SELECT * FROM bookings WHERE user_id = 1;

-- Test 4: Query bookings by user and status (nên dùng idx_bookings_user_status)
EXPLAIN SELECT * FROM bookings WHERE user_id = 1 AND status = 'CONFIRMED';

-- Test 5: Query payments by booking (nên dùng idx_payments_booking_id)
EXPLAIN SELECT * FROM payments WHERE booking_id = 1;

-- Test 6: Query reviews by tour (nên dùng idx_reviews_tour_id)
EXPLAIN SELECT * FROM reviews WHERE tour_id = 1;

-- Test 7: Search tours by category and price (nên dùng idx_tours_category_price)
EXPLAIN SELECT * FROM tours 
WHERE category_id = 1 
  AND price BETWEEN 1000000 AND 5000000;

-- Test 8: Query notifications by user (nên dùng idx_notifications_user_id)
EXPLAIN SELECT * FROM notifications 
WHERE user_id = 1 
ORDER BY created_at DESC 
LIMIT 10;

-- Test 9: Query active promotions (nên dùng idx_promotions_status_dates)
EXPLAIN SELECT * FROM promotions 
WHERE status = 'ACTIVE' 
  AND valid_from <= NOW() 
  AND valid_to >= NOW();

-- Test 10: Query wishlists (nên dùng idx_wishlists_user_tour)
EXPLAIN SELECT * FROM wishlists 
WHERE user_id = 1 AND tour_id = 1;

-- =====================================================
-- 4. SO SÁNH HIỆU SUẤT TRƯỚC VÀ SAU KHI CÓ INDEX
-- =====================================================

-- Bật profiling
SET profiling = 1;

-- Chạy query test
SELECT * FROM bookings WHERE user_id = 1;
SELECT * FROM tours WHERE status = 'ACTIVE' AND category_id = 1;
SELECT * FROM reviews WHERE tour_id = 1;

-- Xem kết quả profiling
SHOW PROFILES;

-- Xem chi tiết query gần nhất
SHOW PROFILE FOR QUERY 1;

-- Tắt profiling
SET profiling = 0;

-- =====================================================
-- 5. KIỂM TRA INDEX CARDINALITY
-- Cardinality cao = index hiệu quả
-- =====================================================

SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    CARDINALITY,
    CASE 
        WHEN CARDINALITY IS NULL THEN 'No statistics'
        WHEN CARDINALITY < 10 THEN 'Low (may not be useful)'
        WHEN CARDINALITY < 100 THEN 'Medium'
        ELSE 'High (good)'
    END as EFFECTIVENESS
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'doan'
  AND INDEX_NAME != 'PRIMARY'
ORDER BY TABLE_NAME, INDEX_NAME;

-- =====================================================
-- 6. TÌM INDEXES KHÔNG ĐƯỢC SỬ DỤNG (MySQL 5.7+)
-- =====================================================

-- Kiểm tra table statistics
SELECT 
    TABLE_SCHEMA,
    TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH,
    ROUND(INDEX_LENGTH / DATA_LENGTH, 2) as INDEX_RATIO
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'doan'
  AND TABLE_ROWS > 0
ORDER BY TABLE_ROWS DESC;

-- =====================================================
-- 7. BENCHMARK QUERIES PHỔ BIẾN
-- =====================================================

-- Benchmark 1: Load user dashboard
SET @start_time = NOW(6);
SELECT 
    b.id,
    b.booking_code,
    b.status,
    t.name as tour_name,
    ts.departure_date
FROM bookings b
JOIN tours t ON b.tour_id = t.id
JOIN tour_schedules ts ON b.schedule_id = ts.id
WHERE b.user_id = 1
ORDER BY b.created_at DESC
LIMIT 10;
SELECT TIMESTAMPDIFF(MICROSECOND, @start_time, NOW(6)) as execution_time_microseconds;

-- Benchmark 2: Tour listing page
SET @start_time = NOW(6);
SELECT 
    t.id,
    t.name,
    t.slug,
    t.price,
    t.average_rating,
    c.name as category_name
FROM tours t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.status = 'ACTIVE'
ORDER BY t.is_featured DESC, t.created_at DESC
LIMIT 12;
SELECT TIMESTAMPDIFF(MICROSECOND, @start_time, NOW(6)) as execution_time_microseconds;

-- Benchmark 3: Tour search
SET @start_time = NOW(6);
SELECT *
FROM tours
WHERE status = 'ACTIVE'
  AND (name LIKE '%ha noi%' OR description LIKE '%ha noi%')
ORDER BY average_rating DESC
LIMIT 10;
SELECT TIMESTAMPDIFF(MICROSECOND, @start_time, NOW(6)) as execution_time_microseconds;

-- =====================================================
-- 8. UPDATE TABLE STATISTICS (nên chạy sau khi thêm indexes)
-- =====================================================

-- Analyze tables để update statistics
ANALYZE TABLE tours;
ANALYZE TABLE bookings;
ANALYZE TABLE payments;
ANALYZE TABLE reviews;
ANALYZE TABLE users;
ANALYZE TABLE notifications;
ANALYZE TABLE wishlists;
ANALYZE TABLE tour_schedules;
ANALYZE TABLE promotions;

-- =====================================================
-- 9. XÓA INDEXES KHÔNG CẦN THIẾT (nếu có)
-- =====================================================

-- Chỉ chạy nếu phát hiện duplicate indexes
-- DROP INDEX index_name ON table_name;

-- Ví dụ: Nếu có 2 indexes giống nhau
-- DROP INDEX idx_old_tours_status ON tours;

-- =====================================================
-- 10. KẾT QUẢ MONG ĐỢI
-- =====================================================

/*
EXPLAIN OUTPUT - Các trường quan trọng:

1. type: Loại scan
   - system/const: Tốt nhất (1 row)
   - eq_ref: Rất tốt (unique index lookup)
   - ref: Tốt (non-unique index lookup)
   - range: Khá tốt (index range scan)
   - index: Không tốt (full index scan)
   - ALL: Tệ nhất (full table scan)

2. possible_keys: Indexes có thể dùng
3. key: Index thực sự được dùng
4. rows: Số rows ước tính phải scan (càng ít càng tốt)

VÍ DỤ OUTPUT TỐT:
+----+-------------+----------+------+------------------+------------------+
| id | select_type | table    | type | possible_keys    | key              |
+----+-------------+----------+------+------------------+------------------+
|  1 | SIMPLE      | bookings | ref  | idx_bookings_... | idx_bookings_... |
+----+-------------+----------+------+------------------+------------------+

VÍ DỤ OUTPUT XẤU (cần optimize):
+----+-------------+----------+------+---------------+------+
| id | select_type | table    | type | possible_keys | key  |
+----+-------------+----------+------+---------------+------+
|  1 | SIMPLE      | bookings | ALL  | NULL          | NULL |
+----+-------------+----------+------+---------------+------+
*/

