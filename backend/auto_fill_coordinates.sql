-- Script tự động điền coordinates cho TẤT CẢ tours dựa vào destination
-- Chỉ cần chạy 1 lần, tất cả tours sẽ có thời tiết!

-- Tắt Safe Update Mode để có thể UPDATE
SET SQL_SAFE_UPDATES = 0;

-- Cập nhật theo pattern LIKE cho các biến thể tên
-- Tours có "Hạ Long" hoặc "Halong" trong destination
UPDATE tours 
SET latitude = 20.9599, longitude = 107.0431, weather_enabled = TRUE
WHERE (destination LIKE '%Hạ Long%' OR destination LIKE '%Ha Long%' OR destination LIKE '%Halong%')
AND latitude IS NULL;

-- Tours có "Hà Nội" trong destination
UPDATE tours 
SET latitude = 21.0285, longitude = 105.8542, weather_enabled = TRUE
WHERE (destination LIKE '%Hà Nội%' OR destination LIKE '%Ha Noi%' OR destination LIKE '%Hanoi%')
AND latitude IS NULL;

-- Tours có "Ninh Bình" trong destination
UPDATE tours 
SET latitude = 20.2506, longitude = 105.9745, weather_enabled = TRUE
WHERE (destination LIKE '%Ninh Bình%' OR destination LIKE '%Ninh Binh%')
AND latitude IS NULL;

-- Tours có "Đà Nẵng" trong destination
UPDATE tours 
SET latitude = 16.0544, longitude = 108.2022, weather_enabled = TRUE
WHERE (destination LIKE '%Đà Nẵng%' OR destination LIKE '%Da Nang%' OR destination LIKE '%Danang%')
AND latitude IS NULL;

-- Tours có "Hội An" trong destination
UPDATE tours 
SET latitude = 15.8801, longitude = 108.3380, weather_enabled = TRUE
WHERE (destination LIKE '%Hội An%' OR destination LIKE '%Hoi An%')
AND latitude IS NULL;

-- Tours có "Huế" trong destination
UPDATE tours 
SET latitude = 16.4637, longitude = 107.5909, weather_enabled = TRUE
WHERE (destination LIKE '%Huế%' OR destination LIKE '%Hue%')
AND latitude IS NULL;

-- Tours có "Sài Gòn" hoặc "TP.HCM" trong destination
UPDATE tours 
SET latitude = 10.8231, longitude = 106.6297, weather_enabled = TRUE
WHERE (destination LIKE '%Sài Gòn%' OR destination LIKE '%Saigon%' 
   OR destination LIKE '%Hồ Chí Minh%' OR destination LIKE '%Ho Chi Minh%'
   OR destination LIKE '%TP.HCM%' OR destination LIKE '%TPHCM%')
AND latitude IS NULL;

-- Tours có "Nha Trang" trong destination
UPDATE tours 
SET latitude = 12.2388, longitude = 109.1967, weather_enabled = TRUE
WHERE destination LIKE '%Nha Trang%'
AND latitude IS NULL;

-- Tours có "Đà Lạt" trong destination
UPDATE tours 
SET latitude = 11.9404, longitude = 108.4583, weather_enabled = TRUE
WHERE (destination LIKE '%Đà Lạt%' OR destination LIKE '%Da Lat%' OR destination LIKE '%Dalat%')
AND latitude IS NULL;

-- Tours có "Phú Quốc" trong destination
UPDATE tours 
SET latitude = 10.2897, longitude = 103.9837, weather_enabled = TRUE
WHERE (destination LIKE '%Phú Quốc%' OR destination LIKE '%Phu Quoc%')
AND latitude IS NULL;

-- Tours có "Sapa" trong destination
UPDATE tours 
SET latitude = 22.3364, longitude = 103.8438, weather_enabled = TRUE
WHERE (destination LIKE '%Sapa%' OR destination LIKE '%Sa Pa%')
AND latitude IS NULL;

-- Tours có "Cần Thơ" trong destination
UPDATE tours 
SET latitude = 10.0452, longitude = 105.7469, weather_enabled = TRUE
WHERE (destination LIKE '%Cần Thơ%' OR destination LIKE '%Can Tho%')
AND latitude IS NULL;

-- Tours có "Vũng Tàu" trong destination
UPDATE tours 
SET latitude = 10.3459, longitude = 107.0843, weather_enabled = TRUE
WHERE (destination LIKE '%Vũng Tàu%' OR destination LIKE '%Vung Tau%')
AND latitude IS NULL;

-- Thêm các điểm đến khác
-- Côn Đảo
UPDATE tours 
SET latitude = 8.6833, longitude = 106.6000, weather_enabled = TRUE
WHERE (destination LIKE '%Côn Đảo%' OR destination LIKE '%Con Dao%')
AND latitude IS NULL;

-- Mũi Né
UPDATE tours 
SET latitude = 10.9333, longitude = 108.1000, weather_enabled = TRUE
WHERE (destination LIKE '%Mũi Né%' OR destination LIKE '%Mui Ne%')
AND latitude IS NULL;

-- Quy Nhơn
UPDATE tours 
SET latitude = 13.7830, longitude = 109.2196, weather_enabled = TRUE
WHERE (destination LIKE '%Quy Nhơn%' OR destination LIKE '%Quy Nhon%')
AND latitude IS NULL;

-- Hà Giang
UPDATE tours 
SET latitude = 22.8236, longitude = 104.9784, weather_enabled = TRUE
WHERE (destination LIKE '%Hà Giang%' OR destination LIKE '%Ha Giang%')
AND latitude IS NULL;

-- Mai Châu
UPDATE tours 
SET latitude = 20.6783, longitude = 105.0642, weather_enabled = TRUE
WHERE (destination LIKE '%Mai Châu%' OR destination LIKE '%Mai Chau%')
AND latitude IS NULL;

-- Cát Bà
UPDATE tours 
SET latitude = 20.7272, longitude = 106.9802, weather_enabled = TRUE
WHERE (destination LIKE '%Cát Bà%' OR destination LIKE '%Cat Ba%')
AND latitude IS NULL;

-- Tam Cốc
UPDATE tours 
SET latitude = 20.2333, longitude = 105.9000, weather_enabled = TRUE
WHERE (destination LIKE '%Tam Cốc%' OR destination LIKE '%Tam Coc%')
AND latitude IS NULL;

-- KIỂM TRA KẾT QUẢ
SELECT 
    COUNT(*) as total_tours,
    SUM(CASE WHEN latitude IS NOT NULL THEN 1 ELSE 0 END) as with_coordinates,
    SUM(CASE WHEN latitude IS NULL THEN 1 ELSE 0 END) as without_coordinates,
    ROUND(SUM(CASE WHEN latitude IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as percentage
FROM tours;

-- Xem các tour CHƯA có coordinates
SELECT id, name, destination, departure_location
FROM tours 
WHERE latitude IS NULL
LIMIT 10;

-- Bật lại Safe Update Mode
SET SQL_SAFE_UPDATES = 1;

