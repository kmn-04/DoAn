-- =====================================================
-- DATABASE INDEXING OPTIMIZATION
-- Tạo indexes cho các trường thường xuyên được query
-- Mục tiêu: Tăng tốc độ truy vấn từ vài giây xuống vài milliseconds
-- =====================================================

-- =====================================================
-- TOURS TABLE
-- =====================================================

-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_tours_status ON tours(status);
CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_category_id ON tours(category_id);
CREATE INDEX IF NOT EXISTS idx_tours_destination_id ON tours(destination_id);
CREATE INDEX IF NOT EXISTS idx_tours_departure_location_id ON tours(departure_location_id);
CREATE INDEX IF NOT EXISTS idx_tours_featured ON tours(is_featured);
CREATE INDEX IF NOT EXISTS idx_tours_price ON tours(price);
CREATE INDEX IF NOT EXISTS idx_tours_departure_date ON tours(departure_date);
CREATE INDEX IF NOT EXISTS idx_tours_average_rating ON tours(average_rating);
CREATE INDEX IF NOT EXISTS idx_tours_created_at ON tours(created_at);

-- Composite indexes cho filter phức tạp
CREATE INDEX IF NOT EXISTS idx_tours_status_featured ON tours(status, is_featured);
CREATE INDEX IF NOT EXISTS idx_tours_status_category ON tours(status, category_id);
CREATE INDEX IF NOT EXISTS idx_tours_status_price ON tours(status, price);
CREATE INDEX IF NOT EXISTS idx_tours_status_departure ON tours(status, departure_date);
CREATE INDEX IF NOT EXISTS idx_tours_category_price ON tours(category_id, price);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================

-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_schedule_id ON bookings(schedule_id);
CREATE INDEX IF NOT EXISTS idx_bookings_promotion_id ON bookings(promotion_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_user_payment_status ON bookings(user_id, payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_status ON bookings(tour_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings(status, booking_date);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_code ON payments(payment_code);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_transaction_id ON payments(provider_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_payment_provider ON payments(payment_provider);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_reviews_tour_id ON reviews(tour_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_reviews_tour_status ON reviews(tour_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_tour_rating ON reviews(tour_id, rating);
CREATE INDEX IF NOT EXISTS idx_reviews_user_status ON reviews(user_id, status);

-- =====================================================
-- USERS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);

-- =====================================================
-- NEWSLETTER_SUBSCRIBERS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscribers(subscribed_at);

-- =====================================================
-- PROMOTIONS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_status ON promotions(status);
CREATE INDEX IF NOT EXISTS idx_promotions_type ON promotions(type);
CREATE INDEX IF NOT EXISTS idx_promotions_valid_from ON promotions(valid_from);
CREATE INDEX IF NOT EXISTS idx_promotions_valid_to ON promotions(valid_to);

-- Composite indexes cho date range queries
CREATE INDEX IF NOT EXISTS idx_promotions_status_dates ON promotions(status, valid_from, valid_to);

-- =====================================================
-- USER_ACTIVITIES TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_user_activities_user_type ON user_activities(user_id, activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_date ON user_activities(user_id, created_at);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- =====================================================
-- DESTINATIONS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_destinations_slug ON destinations(slug);
CREATE INDEX IF NOT EXISTS idx_destinations_status ON destinations(status);
CREATE INDEX IF NOT EXISTS idx_destinations_country_id ON destinations(country_id);
CREATE INDEX IF NOT EXISTS idx_destinations_name ON destinations(name);

-- =====================================================
-- PARTNERS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_partners_slug ON partners(slug);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(type);
CREATE INDEX IF NOT EXISTS idx_partners_name ON partners(name);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_partners_type_status ON partners(type, status);

-- =====================================================
-- TOUR_SCHEDULES TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tour_schedules_tour_id ON tour_schedules(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_schedules_departure_date ON tour_schedules(departure_date);
CREATE INDEX IF NOT EXISTS idx_tour_schedules_return_date ON tour_schedules(return_date);
CREATE INDEX IF NOT EXISTS idx_tour_schedules_status ON tour_schedules(status);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_tour_schedules_tour_date ON tour_schedules(tour_id, departure_date);
CREATE INDEX IF NOT EXISTS idx_tour_schedules_tour_status ON tour_schedules(tour_id, status);

-- =====================================================
-- TOUR_ITINERARIES TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tour_itineraries_tour_id ON tour_itineraries(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_itineraries_day_number ON tour_itineraries(day_number);

-- =====================================================
-- TOUR_IMAGES TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tour_images_tour_id ON tour_images(tour_id);
CREATE INDEX IF NOT EXISTS idx_tour_images_is_primary ON tour_images(is_primary);

-- Composite index
CREATE INDEX IF NOT EXISTS idx_tour_images_tour_primary ON tour_images(tour_id, is_primary);

-- =====================================================
-- WISHLISTS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_tour_id ON wishlists(tour_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_created_at ON wishlists(created_at);

-- Composite index để tìm wishlist của user cho tour cụ thể
CREATE INDEX IF NOT EXISTS idx_wishlists_user_tour ON wishlists(user_id, tour_id);

-- =====================================================
-- BOOKING_CANCELLATIONS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cancellations_booking_id ON booking_cancellations(booking_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_policy_id ON booking_cancellations(cancellation_policy_id);
CREATE INDEX IF NOT EXISTS idx_cancellations_status ON booking_cancellations(cancellation_status);
CREATE INDEX IF NOT EXISTS idx_cancellations_refund_status ON booking_cancellations(refund_status);
CREATE INDEX IF NOT EXISTS idx_cancellations_requested_at ON booking_cancellations(requested_at);

-- =====================================================
-- CANCELLATION_POLICIES TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cancellation_policies_tour_id ON cancellation_policies(tour_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_policies_is_active ON cancellation_policies(is_active);

-- =====================================================
-- LOYALTY_POINTS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_booking_id ON loyalty_points(booking_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_transaction_type ON loyalty_points(transaction_type);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_created_at ON loyalty_points(created_at);

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_type ON loyalty_points(user_id, transaction_type);

-- =====================================================
-- LOYALTY_LEVEL_HISTORY TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_loyalty_history_user_id ON loyalty_level_history(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_history_changed_at ON loyalty_level_history(changed_at);

-- =====================================================
-- BLACKLISTED_TOKENS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_token ON blacklisted_tokens(token(255));
CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_expiry ON blacklisted_tokens(expiry_date);
CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_email ON blacklisted_tokens(user_email);

-- =====================================================
-- REFRESH_TOKENS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token(255));
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expiry ON refresh_tokens(expiry_date);

-- =====================================================
-- VERIFICATION_TOKENS TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_email ON verification_tokens(email);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expiry ON verification_tokens(expiry_date);

-- =====================================================
-- COUNTRIES TABLE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_name ON countries(name);

-- =====================================================
-- BANNERS TABLE (nếu có)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_start_date ON banners(start_date);
CREATE INDEX IF NOT EXISTS idx_banners_end_date ON banners(end_date);

-- =====================================================
-- KẾT QUẢ MONG ĐỢI
-- =====================================================

-- Trước khi thêm indexes:
-- - Query danh sách tours: 500ms - 2s
-- - Query bookings của user: 300ms - 1s
-- - Search tours: 1s - 3s
-- - Load tour details: 400ms - 800ms

-- Sau khi thêm indexes:
-- - Query danh sách tours: 20ms - 50ms (nhanh hơn 10-40 lần)
-- - Query bookings của user: 10ms - 30ms (nhanh hơn 30-100 lần)
-- - Search tours: 50ms - 100ms (nhanh hơn 20-60 lần)
-- - Load tour details: 30ms - 60ms (nhanh hơn 10-20 lần)

-- =====================================================
-- KIỂM TRA INDEXES
-- =====================================================

-- Xem tất cả indexes của bảng tours
-- SHOW INDEX FROM tours;

-- Kiểm tra query có dùng index không
-- EXPLAIN SELECT * FROM tours WHERE status = 'ACTIVE';
-- EXPLAIN SELECT * FROM bookings WHERE user_id = 1;

-- Xem index usage statistics
-- SELECT * FROM information_schema.STATISTICS 
-- WHERE table_schema = 'doan' ORDER BY table_name, index_name;

