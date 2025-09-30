-- ============================================
-- RESET DATABASE HOÀN TOÀN - XÓA TẤT CẢ DỮ LIỆU CŨ
-- ============================================
-- Chạy script này trong MySQL Workbench để xóa sạch database cũ
-- và tạo lại từ đầu với schema mới
-- ============================================

USE doan;

-- Tắt foreign key checks để có thể drop tables
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa tất cả các bảng (theo thứ tự ngược lại với dependencies)
DROP TABLE IF EXISTS `wishlists`;
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `user_activities`;
DROP TABLE IF EXISTS `tour_schedules`;
DROP TABLE IF EXISTS `tour_prices`;
DROP TABLE IF EXISTS `tour_itineraries`;
DROP TABLE IF EXISTS `tour_images`;
DROP TABLE IF EXISTS `tour_faqs`;
DROP TABLE IF EXISTS `tour_target_audiences`;
DROP TABLE IF EXISTS `tour_target_audience`; -- Bảng cũ
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `booking_participants`;
DROP TABLE IF EXISTS `booking_modifications`;
DROP TABLE IF EXISTS `booking_cancellations`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `tours`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `target_audiences`;
DROP TABLE IF EXISTS `partner_images`;
DROP TABLE IF EXISTS `partners`;
DROP TABLE IF EXISTS `promotions`;
DROP TABLE IF EXISTS `countries`;
DROP TABLE IF EXISTS `cancellation_policies`;
DROP TABLE IF EXISTS `password_reset_tokens`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

-- Xóa các bảng cũ còn sót lại
DROP TABLE IF EXISTS `contact_requests`; -- Có thể tên đầy đủ là contact_requests
DROP TABLE IF EXISTS `contact_re`; -- Hoặc bảng bị cắt tên
DROP TABLE IF EXISTS `logs`;
DROP TABLE IF EXISTS `log`;
DROP TABLE IF EXISTS `notifications`;

-- Bật lại foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- BÂY GIỜ CHẠY FILE CSDL-REFACTORED.sql
-- Sau đó chạy MIGRATION-DATA.sql
-- ============================================
