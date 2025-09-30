-- =============================
-- RESET TOÀN BỘ DATABASE
-- (Xóa tất cả tables và tạo lại)
-- =============================

USE travelbooking;

-- Tắt foreign key check
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa các bảng theo thứ tự (từ child đến parent)
DROP TABLE IF EXISTS tour_images;
DROP TABLE IF EXISTS tour_itineraries;
DROP TABLE IF EXISTS tour_target_audience;
DROP TABLE IF EXISTS target_audiences;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS categories;

-- Bật lại foreign key check
SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ Đã xóa tất cả tables liên quan đến tours' AS Status;
SELECT 'ℹ️  Bây giờ hãy chạy lại backend để JPA tự động tạo tables' AS NextStep;
