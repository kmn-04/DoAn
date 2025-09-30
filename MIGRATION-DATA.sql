-- =============================
-- MIGRATION DATA SCRIPT
-- Database: doan
-- Migrate từ CSDL cũ sang CSDL-REFACTORED
-- =============================

USE doan;

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;

-- =============================
-- BƯỚC 1: BACKUP DATA CŨ (Optional - để an toàn)
-- =============================

-- Tạo bảng backup nếu cần rollback
-- CREATE TABLE tours_backup AS SELECT * FROM tours;
-- CREATE TABLE bookings_backup AS SELECT * FROM bookings;
-- CREATE TABLE categories_backup AS SELECT * FROM categories;

-- =============================
-- BƯỚC 2: DROP CÁC BẢNG CŨ (nếu rebuild từ đầu)
-- =============================

-- Nếu bạn muốn rebuild hoàn toàn, uncomment các dòng dưới:
-- DROP TABLE IF EXISTS user_sessions;
-- DROP TABLE IF EXISTS user_activities;
-- DROP TABLE IF EXISTS logs;
-- DROP TABLE IF EXISTS notifications;
-- DROP TABLE IF EXISTS contact_requests;
-- DROP TABLE IF EXISTS tour_target_audience;
-- DROP TABLE IF EXISTS target_audiences;
-- DROP TABLE IF EXISTS tour_faqs;
-- DROP TABLE IF EXISTS wishlists;
-- DROP TABLE IF EXISTS tour_images;
-- DROP TABLE IF EXISTS partners;
-- DROP TABLE IF EXISTS tour_itineraries;
-- DROP TABLE IF EXISTS reviews;
-- DROP TABLE IF EXISTS payments;
-- DROP TABLE IF EXISTS booking_participants;
-- DROP TABLE IF EXISTS bookings;
-- DROP TABLE IF EXISTS tour_prices;
-- DROP TABLE IF EXISTS tour_schedules;
-- DROP TABLE IF EXISTS promotions;
-- DROP TABLE IF EXISTS tours;
-- DROP TABLE IF EXISTS categories;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS roles;

-- Sau đó chạy: SOURCE CSDL-REFACTORED.sql;

-- =============================
-- BƯỚC 3: INSERT CATEGORIES MỚI (Theme-based)
-- =============================

-- Xóa categories cũ (location-based)
TRUNCATE TABLE categories;

-- Insert categories mới (theme-based)
INSERT INTO categories (id, name, slug, description, icon, display_order, is_featured, status, created_at, updated_at) VALUES
(1, 'Du lịch biển đảo', 'du-lich-bien-dao', 'Tận hưởng không gian biển xanh cát trắng với những bãi biển đẹp nhất Việt Nam và thế giới', '🏖️', 1, TRUE, 'Active', NOW(), NOW()),
(2, 'Du lịch núi rừng', 'du-lich-nui-rung', 'Khám phá thiên nhiên hùng vĩ, chinh phục đỉnh núi và thác nước', '⛰️', 2, TRUE, 'Active', NOW(), NOW()),
(3, 'Du lịch văn hóa', 'du-lich-van-hoa', 'Tìm hiểu lịch sử, di sản văn hóa và kiến trúc cổ kính', '🏛️', 3, TRUE, 'Active', NOW(), NOW()),
(4, 'Du lịch tâm linh', 'du-lich-tam-linh', 'Hành trình tâm linh thanh tịnh đến các danh lam thắng cảnh', '🙏', 4, FALSE, 'Active', NOW(), NOW()),
(5, 'Du lịch nghỉ dưỡng', 'du-lich-nghi-duong', 'Thư giãn và chăm sóc sức khỏe tại các resort cao cấp', '💆', 5, TRUE, 'Active', NOW(), NOW()),
(6, 'Du lịch khám phá', 'du-lich-kham-pha', 'Trải nghiệm và khám phá những điều mới lạ, độc đáo', '🧭', 6, FALSE, 'Active', NOW(), NOW()),
(7, 'Du lịch ẩm thực', 'du-lich-am-thuc', 'Thưởng thức đặc sản địa phương và khám phá văn hóa ẩm thực', '🍜', 7, FALSE, 'Active', NOW(), NOW()),
(8, 'Du lịch mạo hiểm', 'du-lich-mao-hiem', 'Thử thách bản thân với các hoạt động phiêu lưu mạo hiểm', '🪂', 8, FALSE, 'Active', NOW(), NOW()),
(9, 'Du lịch MICE', 'du-lich-mice', 'Hội nghị, sự kiện, team building và du lịch kết hợp công tác', '🎯', 9, FALSE, 'Active', NOW(), NOW()),
(10, 'Du lịch cao cấp', 'du-lich-cao-cap', 'Trải nghiệm sang trọng đẳng cấp với dịch vụ 5 sao', '💎', 10, TRUE, 'Active', NOW(), NOW());

-- =============================
-- BƯỚC 4: INSERT TARGET AUDIENCES
-- =============================

-- Xóa data cũ nếu có
TRUNCATE TABLE target_audiences;

INSERT INTO target_audiences (id, name, description, icon) VALUES
(1, 'Gia đình', 'Phù hợp cho gia đình có trẻ em', '👨‍👩‍👧‍👦'),
(2, 'Cặp đôi', 'Lý tưởng cho cặp đôi, honeymoon', '💑'),
(3, 'Nhóm bạn', 'Thích hợp cho nhóm bạn đi chơi', '👥'),
(4, 'Người cao tuổi', 'Tour nhẹ nhàng cho người cao tuổi', '👴'),
(5, 'Du khách solo', 'Phù hợp cho người đi một mình', '🧳'),
(6, 'Doanh nghiệp', 'Tour MICE và team building', '🏢');

-- =============================
-- BƯỚC 5: MIGRATE TOURS DATA
-- =============================

-- Xóa tours cũ
TRUNCATE TABLE tours;

-- =============================
-- TOURS TRONG NƯỚC - BIỂN ĐẢO (Category 1)
-- =============================
INSERT INTO tours (
    name, slug, short_description, description, highlights,
    price, sale_price, child_price, infant_price,
    duration, min_people, max_people,
    category_id, tour_type,
    departure_location, destination, destinations, region, country, country_code,
    transportation, accommodation, meals_included,
    included_services, excluded_services,
    visa_required, visa_info, flight_included,
    cancellation_policy, note, suitable_for,
    main_image, status, is_featured, view_count
) VALUES
-- Tour 1: Phú Quốc
('Phú Quốc - Đảo Ngọc 3N2Đ', 'phu-quoc-dao-ngoc-3n2d',
'Thiên đường biển đảo với bãi cát trắng mịn',
'Khám phá đảo ngọc Phú Quốc với những bãi biển đẹp nhất Việt Nam. Tham quan VinWonders, Safari, Grand World, check-in cáp treo Hòn Thơm dài nhất thế giới. Thưởng thức hải sản tươi sống và khám phá chợ đêm sôi động.',
'["Cáp treo Hòn Thơm dài nhất thế giới", "VinWonders Phú Quốc", "Safari động vật hoang dã", "Grand World check-in sống ảo", "Bãi Sao - bãi biển đẹp nhất", "Chợ đêm Phú Quốc", "Tour câu cá - lặn ngắm san hô"]',
3890000, 3490000, 2790000, 890000,
3, 2, 30,
1, 'DOMESTIC',
'TP. Hồ Chí Minh', 'Phú Quốc', '["Phú Quốc", "VinWonders", "Hòn Thơm", "Grand World"]', 'Miền Nam', 'Việt Nam', 'VN',
'Máy bay + Xe du lịch', 'Khách sạn 3 sao', '2 bữa/ngày (Sáng, Trưa)',
'["Vé máy bay khứ hồi", "Khách sạn 3 sao", "Xe đưa đón sân bay", "Hướng dẫn viên chuyên nghiệp", "Vé tham quan theo chương trình", "Bảo hiểm du lịch", "Nước suối trên xe"]',
'["Chi phí cá nhân", "Đồ uống trong bữa ăn", "Tip HDV và tài xế", "Vé tham quan ngoài chương trình", "Thuế VAT"]',
FALSE, NULL, TRUE,
'Hủy trước 15 ngày: hoàn 80% | Hủy trước 7 ngày: hoàn 50% | Hủy trong 7 ngày: không hoàn tiền',
'Mang theo CMND/Passport, kem chống nắng, thuốc cá nhân',
'Gia đình có trẻ em, Cặp đôi, Nhóm bạn',
'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', 'Active', TRUE, 1245),

-- Tour 2: Nha Trang
('Nha Trang - Biển Xanh Cát Trắng 3N2Đ', 'nha-trang-bien-xanh-cat-trang-3n2d',
'Thành phố biển năng động với bãi biển đẹp',
'Du lịch Nha Trang với bãi biển đẹp nhất miền Trung. Tham quan Vinpearl Land, tắm bùn I-Resort, check-in cầu Trần Phú, hòn Chồng. Thưởng thức hải sản tươi ngon và tham quan chợ Đầm.',
'["Vinpearl Land Nha Trang", "Tắm bùn I-Resort", "Tour 4 đảo", "Hòn Chồng - Hòn Vợ", "Tháp Bà Ponagar", "Nhà thờ Núi Nha Trang", "Chợ Đầm"]',
3590000, 3190000, 2590000, 790000,
3, 2, 35,
1, 'DOMESTIC',
'TP. Hồ Chí Minh', 'Nha Trang', '["Nha Trang", "Vinpearl", "Hòn Chồng", "Tháp Bà"]', 'Miền Trung', 'Việt Nam', 'VN',
'Máy bay + Xe du lịch', 'Khách sạn 3 sao view biển', '2 bữa/ngày',
'["Vé máy bay khứ hồi", "Khách sạn 3 sao", "Tour 4 đảo", "Vé Vinpearl Land", "Bảo hiểm du lịch"]',
'["Tắm bùn I-Resort", "Chi phí cá nhân", "Tip HDV"]',
FALSE, NULL, TRUE,
'Hủy trước 10 ngày: hoàn 70% | Hủy trong 10 ngày: không hoàn',
'Mang đồ bơi, kem chống nắng, mũ/nón',
'Gia đình, Cặp đôi, Nhóm bạn',
'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800', 'Active', TRUE, 892),

-- Tour 3: Vũng Tàu
('Vũng Tàu - Biển Gần 2N1Đ', 'vung-tau-bien-gan-2n1d',
'Biển Vũng Tàu gần Sài Gòn, lý tưởng cuối tuần',
'Tour Vũng Tàu 2 ngày 1 đêm lý tưởng cho gia đình. Tham quan tượng Chúa Kitô, ngọn hải đăng, bãi Sau, bãi Trước. Thưởng thức hải sản tươi sống giá rẻ.',
'["Tượng Chúa Kitô", "Ngọn hải đăng cổ", "Bãi Sau - Bãi Trước", "Bạch Dinh", "Thích Cà Phê Vọt", "Chợ đêm Vũng Tàu"]',
1890000, 1690000, 1290000, 490000,
2, 4, 40,
1, 'DOMESTIC',
'TP. Hồ Chí Minh', 'Vũng Tàu', '["Vũng Tàu", "Bãi Sau", "Bãi Trước", "Tượng Chúa"]', 'Miền Nam', 'Việt Nam', 'VN',
'Xe khách limousine', 'Khách sạn 3 sao view biển', 'Ăn sáng',
'["Xe limousine đưa đón", "Khách sạn 3 sao", "HDV chuyên nghiệp", "Bảo hiểm"]',
'["Các bữa ăn trưa/tối", "Vé tham quan", "Chi phí cá nhân"]',
FALSE, NULL, FALSE,
'Hủy trước 3 ngày: hoàn 50% | Hủy trong 3 ngày: không hoàn',
'Tour ngắn ngày, phù hợp cuối tuần',
'Gia đình có trẻ nhỏ, Người cao tuổi',
'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800', 'Active', FALSE, 456);

-- =============================
-- TOURS TRONG NƯỚC - NÚI RỪNG (Category 2)
-- =============================
INSERT INTO tours (
    name, slug, short_description, description, highlights,
    price, sale_price, child_price, infant_price,
    duration, min_people, max_people,
    category_id, tour_type,
    departure_location, destination, destinations, region, country, country_code,
    transportation, accommodation, meals_included,
    included_services, excluded_services,
    visa_required, flight_included,
    cancellation_policy, suitable_for,
    main_image, status, is_featured, view_count
) VALUES
-- Tour 4: Sapa
('Sapa - Fansipan 3N2Đ', 'sapa-fansipan-3n2d',
'Chinh phục nóc nhà Đông Dương',
'Khám phá Sapa mùa lúa chín với ruộng bậc thang tuyệt đẹp. Chinh phục đỉnh Fansipan bằng cáp treo hiện đại. Tham quan bản Cát Cát, thác Tình Yêu, check-in cổng trời.',
'["Cáp treo Fansipan", "Ruộng bậc thang mùa lúa chín", "Bản Cát Cát", "Thác Tình Yêu", "Cổng Trời", "Chợ tình Sapa", "Làng dệt thổ cẩm"]',
2890000, 2490000, 1990000, 590000,
3, 4, 25,
2, 'DOMESTIC',
'Hà Nội', 'Sapa', '["Sapa", "Fansipan", "Cát Cát", "Hàm Rồng"]', 'Miền Bắc', 'Việt Nam', 'VN',
'Xe limousine + Cáp treo', 'Khách sạn 3 sao trung tâm', '3 bữa/ngày',
'["Xe limousine đưa đón", "Khách sạn 3 sao", "Vé cáp treo Fansipan", "3 bữa ăn/ngày", "HDV tiếng Việt", "Bảo hiểm"]',
'["Chi phí cá nhân", "Thuê xe máy", "Mua quà lưu niệm"]',
FALSE, FALSE,
'Hủy trước 7 ngày: hoàn 60%',
'Gia đình, Nhóm bạn, Người yêu thiên nhiên',
'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', 'Active', TRUE, 1567),

-- Tour 5: Đà Lạt
('Đà Lạt - Thành Phố Ngàn Hoa 3N2Đ', 'da-lat-thanh-pho-ngan-hoa-3n2d',
'Lãng mạn thành phố sương mù',
'Tour Đà Lạt khám phá thành phố ngàn hoa với khí hậu mát mẻ quanh năm. Tham quan thác Datanla, Hồ Tuyền Lâm, check-in cà phê đẹp, đi dạo Hồ Xuân Hương.',
'["Thác Datanla", "Hồ Tuyền Lâm", "Cà phê view đẹp", "Hồ Xuân Hương", "Chợ đêm Đà Lạt", "Nông trại dâu tây", "Làng hoa Vạn Thành"]',
2790000, 2390000, 1890000, 490000,
3, 4, 30,
2, 'DOMESTIC',
'TP. Hồ Chí Minh', 'Đà Lạt', '["Đà Lạt", "Datanla", "Tuyền Lâm", "Xuân Hương"]', 'Miền Nam', 'Việt Nam', 'VN',
'Xe khách giường nằm', 'Khách sạn 3 sao trung tâm', '2 bữa/ngày',
'["Xe giường nằm VIP", "Khách sạn 3 sao", "2 bữa ăn/ngày", "Vé tham quan", "HDV", "Bảo hiểm"]',
'["Thuê xe máy", "Chi phí cá nhân"]',
FALSE, FALSE,
'Hủy trước 5 ngày: hoàn 50%',
'Cặp đôi, Gia đình, Nhóm bạn',
'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', 'Active', TRUE, 2134);

-- =============================
-- TOURS TRONG NƯỚC - VĂN HÓA (Category 3)
-- =============================
INSERT INTO tours (
    name, slug, short_description, description, highlights,
    price, sale_price, child_price,
    duration, min_people, max_people,
    category_id, tour_type,
    departure_location, destination, destinations, region, country, country_code,
    transportation, accommodation, meals_included,
    included_services, excluded_services,
    visa_required, flight_included,
    suitable_for,
    main_image, status, is_featured, view_count
) VALUES
-- Tour 6: Hà Nội - Hạ Long - Ninh Bình
('Hà Nội - Hạ Long - Ninh Bình 3N2Đ', 'ha-noi-ha-long-ninh-binh-3n2d',
'Ba điểm đến nổi tiếng miền Bắc',
'Khám phá ba điểm đến văn hóa miền Bắc: Hà Nội ngàn năm văn hiến, Vịnh Hạ Long kỳ vĩ, Tràng An Ninh Bình thơ mộng. Tham quan các di tích lịch sử, thưởng thức ẩm thực đặc sản.',
'["Vịnh Hạ Long - Di sản thế giới", "Tràng An Ninh Bình", "Phố cổ Hà Nội", "Lăng Bác", "Văn Miếu Quốc Tử Giám", "Chùa Bái Đính", "Bún chả Hà Nội"]',
2890000, 2490000, 1990000,
3, 6, 30,
3, 'DOMESTIC',
'Hà Nội', 'Hà Nội - Hạ Long - Ninh Bình', '["Hà Nội", "Hạ Long", "Ninh Bình", "Tràng An"]', 'Miền Bắc', 'Việt Nam', 'VN',
'Xe du lịch + Du thuyền', 'Khách sạn 3 sao', '3 bữa/ngày',
'["Xe du lịch đời mới", "Du thuyền Hạ Long", "Khách sạn 3 sao", "3 bữa ăn/ngày", "Vé tham quan", "HDV chuyên nghiệp", "Bảo hiểm"]',
'["Chi phí cá nhân", "Đồ uống ngoài bữa ăn"]',
FALSE, FALSE,
'Gia đình, Người cao tuổi, Nhóm bạn',
'https://images.unsplash.com/photo-1528127269322-539801943592?w=800', 'Active', TRUE, 3421),

-- Tour 7: Huế - Hội An - Đà Nẵng
('Huế - Hội An - Đà Nẵng 4N3Đ', 'hue-hoi-an-da-nang-4n3d',
'Di sản văn hóa miền Trung',
'Hành trình khám phá di sản văn hóa miền Trung: Cố đô Huế với hoàng cung, lăng tẩm. Phố cổ Hội An với đèn lồng. Đà Nẵng với cầu Rồng, Bà Nà Hills.',
'["Đại Nội Huế", "Lăng Khải Định", "Phố cổ Hội An", "Chùa Cầu", "Cầu Rồng Đà Nẵng", "Bà Nà Hills", "Cố đô Huế"]',
4290000, 3890000, 2890000,
4, 6, 30,
3, 'DOMESTIC',
'TP. Hồ Chí Minh', 'Huế - Hội An - Đà Nẵng', '["Huế", "Hội An", "Đà Nẵng", "Bà Nà"]', 'Miền Trung', 'Việt Nam', 'VN',
'Máy bay + Xe du lịch', 'Khách sạn 4 sao', '3 bữa/ngày',
'["Vé máy bay", "Khách sạn 4 sao", "3 bữa/ngày", "Vé tham quan", "HDV", "Bảo hiểm"]',
'["Vé cáp treo Bà Nà", "Chi phí cá nhân"]',
FALSE, TRUE,
'Gia đình, Nhóm bạn, Người yêu lịch sử',
'https://images.unsplash.com/photo-1555618254-74e3f7d4f9b8?w=800', 'Active', TRUE, 2876);

-- =============================
-- TOURS QUỐC TẾ - BIỂN ĐẢO (Category 1)
-- =============================
INSERT INTO tours (
    name, slug, short_description, description, highlights,
    price, sale_price, child_price,
    duration, min_people, max_people,
    category_id, tour_type,
    departure_location, destination, destinations, region, country, country_code,
    transportation, accommodation, meals_included,
    included_services, excluded_services,
    visa_required, visa_info, flight_included,
    cancellation_policy, suitable_for,
    main_image, status, is_featured, view_count
) VALUES
-- Tour 8: Phuket - Thái Lan
('Phuket - Krabi - Phi Phi 5N4Đ', 'phuket-krabi-phi-phi-5n4d',
'Thiên đường biển đảo Thái Lan',
'Tour biển đảo Phuket - Krabi với bãi biển tuyệt đẹp. Lặn ngắm san hô Phi Phi, tắm biển Patong, James Bond Island, chùa Big Buddha, Phuket Old Town.',
'["Vịnh Phang Nga - James Bond Island", "Đảo Phi Phi", "Patong Beach", "Big Buddha Phuket", "Lặn ngắm san hô", "Phuket Old Town", "Show Phuket Fantasea"]',
12900000, 11490000, 9890000,
5, 10, 30,
1, 'INTERNATIONAL',
'TP. Hồ Chí Minh', 'Phuket', '["Phuket", "Krabi", "Phi Phi", "Phang Nga"]', 'Đông Nam Á', 'Thái Lan', 'TH',
'Máy bay + Speedboat + Xe du lịch', 'Khách sạn 4 sao gần biển', '3 bữa/ngày',
'["Vé máy bay khứ hồi", "Khách sạn 4 sao", "3 bữa/ngày", "Tour đảo Phi Phi", "Vé tham quan", "HDV tiếng Việt", "Bảo hiểm quốc tế"]',
'["Chi phí visa", "Chi phí cá nhân", "Show Phuket Fantasea", "Tip HDV"]',
FALSE, 'Miễn visa 30 ngày cho hộ chiếu phổ thông', TRUE,
'Hủy trước 20 ngày: hoàn 70% | Hủy 10-20 ngày: hoàn 50% | Hủy trong 10 ngày: không hoàn',
'Cặp đôi, Gia đình, Nhóm bạn',
'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800', 'Active', TRUE, 1876),

-- Tour 9: Bali - Indonesia
('Bali - Đảo Của Các Vị Thần 5N4Đ', 'bali-dao-cua-cac-vi-than-5n4d',
'Thiên đường nhiệt đới Bali',
'Khám phá Bali với những bãi biển tuyệt đẹp, đền thờ linh thiêng, ruộng bậc thang xanh mướt. Tham quan Tanah Lot, Ubud, Tegalalang, tắm biển Kuta, Seminyak.',
'["Tanah Lot sunset", "Ubud Monkey Forest", "Ruộng bậc thang Tegalalang", "Kuta Beach", "Seminyak", "Uluwatu Temple", "Lặn biển Nusa Penida"]',
14900000, 13490000, 10890000,
5, 10, 25,
1, 'INTERNATIONAL',
'TP. Hồ Chí Minh', 'Bali', '["Bali", "Ubud", "Kuta", "Seminyak", "Nusa Penida"]', 'Đông Nam Á', 'Indonesia', 'ID',
'Máy bay + Xe du lịch', 'Resort 4 sao view biển', '3 bữa/ngày',
'["Vé máy bay", "Resort 4 sao", "3 bữa/ngày", "Vé tham quan", "HDV tiếng Việt", "Bảo hiểm"]',
'["Visa Indonesia 500k", "Chi phí cá nhân", "Spa massage"]',
TRUE, 'Visa on arrival 500.000 VNĐ tại sân bay', TRUE,
'Hủy trước 15 ngày: hoàn 60%',
'Cặp đôi, Honeymoon, Gia đình',
'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'Active', TRUE, 1234);

-- =============================
-- TOURS QUỐC TẾ - VĂN HÓA (Category 3)
-- =============================
INSERT INTO tours (
    name, slug, short_description, description, highlights,
    price, sale_price, child_price,
    duration, min_people, max_people,
    category_id, tour_type,
    departure_location, destination, destinations, region, country, country_code,
    transportation, accommodation, meals_included,
    included_services, excluded_services,
    visa_required, visa_info, flight_included,
    cancellation_policy, suitable_for,
    main_image, status, is_featured, view_count
) VALUES
-- Tour 10: Tokyo - Osaka
('Tokyo - Kyoto - Osaka 7N6Đ', 'tokyo-kyoto-osaka-7n6d',
'Hành trình khám phá Nhật Bản',
'Tour trọn gói khám phá Tokyo hiện đại, Kyoto cổ kính với đền chùa, Osaka sầm uất. Tham quan núi Phú Sĩ, check-in cổng Torii đỏ, thưởng thức sushi, ramen.',
'["Núi Phú Sĩ", "Cổng Torii Fushimi Inari", "Chùa Vàng Kinkakuji", "Shibuya Crossing", "Osaka Castle", "Nara Park - hươu thân thiện", "Thưởng thức Sushi, Ramen"]',
35900000, 32900000, 28900000,
7, 10, 25,
3, 'INTERNATIONAL',
'Hà Nội', 'Tokyo - Kyoto - Osaka', '["Tokyo", "Kyoto", "Osaka", "Nara", "Phú Sĩ"]', 'Đông Bắc Á', 'Nhật Bản', 'JP',
'Máy bay + Shinkansen + Xe du lịch', 'Khách sạn 4 sao', '3 bữa/ngày',
'["Vé máy bay", "Khách sạn 4 sao", "3 bữa/ngày", "Vé Shinkansen", "Vé tham quan", "HDV tiếng Việt", "Bảo hiểm quốc tế", "Wifi cá nhân"]',
'["Visa Nhật 1.2tr", "Chi phí cá nhân", "Tip HDV"]',
TRUE, 'Hỗ trợ làm visa Nhật Bản. Thời gian: 15 ngày. Chi phí: 1.200.000 VNĐ', TRUE,
'Hủy trước 30 ngày: hoàn 80% | Hủy 15-30 ngày: hoàn 50% | Hủy trong 15 ngày: không hoàn',
'Gia đình, Nhóm bạn, Người yêu văn hóa',
'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'Active', TRUE, 4521),

-- Tour 11: Seoul - Jeju
('Seoul - Jeju 6N5Đ', 'seoul-jeju-6n5d',
'Trải nghiệm văn hóa K-pop',
'Tour Seoul sôi động với Gangnam, Myeongdong, cung điện Gyeongbokgung, đảo Jeju lãng mạn với bãi biển đẹp, núi Hallasan, làng dân gian.',
'["Cung điện Gyeongbokgung", "Myeongdong shopping", "N Seoul Tower", "Đảo Jeju", "Núi Hallasan", "Loveland Jeju", "Thử hanbok truyền thống"]',
18900000, 16900000, 13900000,
6, 10, 30,
3, 'INTERNATIONAL',
'Hà Nội', 'Seoul - Jeju', '["Seoul", "Jeju", "Gyeongbokgung", "Myeongdong"]', 'Đông Bắc Á', 'Hàn Quốc', 'KR',
'Máy bay + Xe du lịch', 'Khách sạn 3-4 sao', '3 bữa/ngày',
'["Vé máy bay", "Khách sạn 3-4 sao", "3 bữa/ngày", "Vé tham quan", "HDV tiếng Việt", "Bảo hiểm"]',
'["Visa Hàn 800k", "Chi phí cá nhân", "Shopping"]',
TRUE, 'Hỗ trợ làm visa Hàn Quốc. Thời gian: 7-10 ngày. Chi phí: 800.000 VNĐ', TRUE,
'Hủy trước 20 ngày: hoàn 70%',
'Gia đình, Cặp đôi, Fan K-pop',
'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800', 'Active', TRUE, 3876),

-- Tour 12: Bangkok - Pattaya
('Bangkok - Pattaya 4N3Đ', 'bangkok-pattaya-4n3d',
'Thái Lan sôi động và biển đẹp',
'Tour Bangkok - Pattaya giá tốt: Hoàng cung Bangkok, chùa Phật Vàng, buffet 86 tầng Baiyoke Sky, biển Pattaya, show Tiffany, Safari World.',
'["Hoàng cung Bangkok", "Chùa Phật Vàng", "Buffet Baiyoke 86 tầng", "Biển Pattaya", "Show Tiffany", "Safari World", "Nanta Show"]',
8900000, 7490000, 5990000,
4, 10, 35,
3, 'INTERNATIONAL',
'TP. Hồ Chí Minh', 'Bangkok - Pattaya', '["Bangkok", "Pattaya", "Hoàng Cung", "Safari"]', 'Đông Nam Á', 'Thái Lan', 'TH',
'Máy bay + Xe du lịch', 'Khách sạn 3 sao', '3 bữa/ngày',
'["Vé máy bay", "Khách sạn 3 sao", "3 bữa/ngày", "Buffet Baiyoke", "Show Tiffany", "Vé tham quan", "HDV tiếng Việt", "Bảo hiểm"]',
'["Safari World 600k", "Chi phí cá nhân", "Nanta Show"]',
FALSE, 'Miễn visa 30 ngày', TRUE,
'Hủy trước 7 ngày: hoàn 50%',
'Gia đình, Nhóm bạn, Giá tốt',
'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800', 'Active', TRUE, 5234);

-- =============================
-- TOURS QUỐC TẾ - CAO CẤP (Category 10)
-- =============================
INSERT INTO tours (
    name, slug, short_description, description, highlights,
    price, child_price,
    duration, min_people, max_people,
    category_id, tour_type,
    departure_location, destination, destinations, region, country, country_code,
    transportation, accommodation, meals_included,
    included_services, excluded_services,
    visa_required, visa_info, flight_included,
    cancellation_policy, suitable_for,
    main_image, status, is_featured, view_count
) VALUES
-- Tour 13: Maldives
('Maldives - Thiên Đường Biển 5N4Đ', 'maldives-thien-duong-bien-5n4d',
'Resort sang trọng giữa biển xanh',
'Tour Maldives cao cấp với resort 5 sao overwater villa. Trải nghiệm lặn biển, thưởng thức bữa tối lãng mạn trên biển, spa thư giãn, hoàng hôn tuyệt đẹp.',
'["Overwater Villa 5 sao", "Lặn ngắm san hô", "Spa thư giãn", "Bữa tối lãng mạn trên biển", "Hoàng hôn tuyệt đẹp", "Câu cá biển", "Chèo kayak"]',
45900000, 38900000,
5, 2, 12,
10, 'INTERNATIONAL',
'TP. Hồ Chí Minh', 'Maldives', '["Maldives", "Male", "Resort"]', 'Nam Á', 'Maldives', 'MV',
'Máy bay + Speedboat/Seaplane', 'Resort 5 sao overwater villa', 'All inclusive',
'["Vé máy bay business", "Resort 5 sao all inclusive", "Speedboat/Seaplane", "Spa 1 session", "Hoạt động water sports", "Bảo hiểm cao cấp"]',
'["Visa Maldives miễn phí", "Chi phí cá nhân", "Lặn biển chuyên sâu"]',
FALSE, 'Miễn visa 30 ngày', TRUE,
'Hủy trước 45 ngày: hoàn 70% | Hủy 30-45 ngày: hoàn 40% | Hủy trong 30 ngày: không hoàn',
'Cặp đôi, Honeymoon, Cao cấp',
'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', 'Active', TRUE, 2876),

-- Tour 14: Dubai
('Dubai - Thành Phố Xa Hoa 6N5Đ', 'dubai-thanh-pho-xa-hoa-6n5d',
'Trải nghiệm Dubai xa hoa và hiện đại',
'Tour Dubai cao cấp khám phá thành phố xa hoa nhất thế giới. Burj Khalifa, Dubai Mall, sa mạc Safari, bãi biển Jumeirah, chợ vàng, chợ gia vị.',
'["Burj Khalifa - tòa nhà cao nhất TG", "Dubai Mall shopping", "Safari sa mạc", "Jumeirah Beach", "Atlantis The Palm", "Dubai Marina", "Chợ vàng - chợ gia vị"]',
38900000, 32900000,
6, 10, 20,
10, 'INTERNATIONAL',
'TP. Hồ Chí Minh', 'Dubai', '["Dubai", "Burj Khalifa", "Dubai Mall", "Jumeirah"]', 'Tây Á', 'UAE', 'AE',
'Máy bay + Xe du lịch luxury', 'Khách sạn 5 sao', '3 bữa/ngày',
'["Vé máy bay", "Khách sạn 5 sao", "3 bữa/ngày", "Vé Burj Khalifa", "Safari sa mạc", "Vé tham quan", "HDV tiếng Việt", "Bảo hiểm quốc tế"]',
'["Visa UAE 1.5tr", "Chi phí cá nhân", "Shopping"]',
TRUE, 'Hỗ trợ làm visa UAE. Chi phí: 1.500.000 VNĐ', TRUE,
'Hủy trước 30 ngày: hoàn 60%',
'Gia đình, Nhóm bạn, Cao cấp',
'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 'Active', TRUE, 3421);

-- =============================
-- BƯỚC 6: INSERT TOUR SCHEDULES
-- =============================

-- Lịch khởi hành cho Tour 1: Phú Quốc (ID=1)
INSERT INTO tour_schedules (tour_id, departure_date, return_date, total_seats, available_seats, adult_price, child_price, status, note) VALUES
(1, '2025-10-15', '2025-10-17', 30, 15, 3490000, 2790000, 'Available', 'Lịch cao điểm'),
(1, '2025-10-22', '2025-10-24', 30, 28, 3490000, 2790000, 'Available', NULL),
(1, '2025-10-29', '2025-10-31', 30, 12, 3490000, 2790000, 'Available', NULL),
(1, '2025-11-05', '2025-11-07', 30, 5, 3790000, 3090000, 'Available', 'Lịch lễ - giá tăng'),
(1, '2025-11-12', '2025-11-14', 30, 30, 3490000, 2790000, 'Available', NULL);

-- Lịch cho Tour 2: Nha Trang (ID=2)
INSERT INTO tour_schedules (tour_id, departure_date, return_date, total_seats, available_seats, adult_price, child_price, status) VALUES
(2, '2025-10-18', '2025-10-20', 35, 20, 3190000, 2590000, 'Available'),
(2, '2025-10-25', '2025-10-27', 35, 30, 3190000, 2590000, 'Available'),
(2, '2025-11-01', '2025-11-03', 35, 8, 3490000, 2890000, 'Available');

-- Lịch cho Tour 10: Tokyo (ID=10)
INSERT INTO tour_schedules (tour_id, departure_date, return_date, total_seats, available_seats, adult_price, child_price, status, note) VALUES
(10, '2025-11-10', '2025-11-16', 25, 18, 32900000, 28900000, 'Available', 'Mùa lá vàng'),
(10, '2025-12-15', '2025-12-21', 25, 10, 35900000, 31900000, 'Available', 'Giáng sinh - giá cao điểm');

-- =============================
-- BƯỚC 7: INSERT PROMOTIONS
-- =============================

-- Xóa data cũ nếu có
TRUNCATE TABLE promotions;

INSERT INTO promotions (code, name, description, type, value, max_discount, min_order_amount, usage_limit, per_user_limit, start_date, end_date, status) VALUES
('SUMMER2025', 'Khuyến mãi mùa hè', 'Giảm giá tour hè', 'Percentage', 15.00, 2000000, 5000000, 100, 1, '2025-05-01', '2025-08-31', 'Active'),
('NEWUSER50', 'Ưu đãi khách hàng mới', 'Giảm 50k đơn đầu tiên', 'Fixed', 50000, 50000, 1000000, 500, 1, '2025-01-01', '2025-12-31', 'Active'),
('BLACKFRIDAY', 'Black Friday Sale', 'Giảm 20% mọi tour', 'Percentage', 20.00, 5000000, 10000000, 200, 1, '2025-11-20', '2025-11-30', 'Active');

-- =============================
-- BƯỚC 8: INSERT PARTNERS
-- =============================

-- Xóa data cũ nếu có
TRUNCATE TABLE partners;

INSERT INTO partners (name, type, address, phone, email, website, description, rating, status) VALUES
('Vinpearl Hotels & Resorts', 'Hotel', 'Toàn quốc', '1900 23 23 28', 'info@vinpearl.com', 'https://vinpearl.com', 'Chuỗi khách sạn resort 5 sao hàng đầu VN', 4.8, 'Active'),
('Muong Thanh Hotel Group', 'Hotel', 'Toàn quốc', '1900 2638', 'contact@muongthanh.vn', 'https://muongthanh.com', 'Chuỗi khách sạn 3-4 sao', 4.2, 'Active'),
('Vietnam Airlines', 'Transport', 'Hà Nội', '1900 1100', 'callcenter@vietnamairlines.com', 'https://vietnamairlines.com', 'Hãng hàng không quốc gia', 4.5, 'Active'),
('Vietravel Airlines', 'Transport', 'TP.HCM', '1900 8288', 'info@vietravelairlines.vn', 'https://vietravelairlines.com', 'Hãng hàng không du lịch', 4.3, 'Active'),
('Nhà hàng Ẩm Thực Việt', 'Restaurant', 'Hà Nội', '024 3826 7890', 'info@amthucviet.vn', NULL, 'Nhà hàng đặc sản Việt Nam', 4.6, 'Active');

-- =============================
-- BƯỚC 9: TẠO TÀI KHOẢN MẶC ĐỊNH
-- =============================

-- Xóa users test cũ nếu có
DELETE FROM user_sessions WHERE user_id IN (1, 2, 999);
DELETE FROM user_activities WHERE user_id IN (1, 2, 999);
DELETE FROM payments WHERE booking_id IN (SELECT id FROM bookings WHERE user_id IN (1, 2, 999));
DELETE FROM booking_participants WHERE booking_id IN (SELECT id FROM bookings WHERE user_id IN (1, 2, 999));
DELETE FROM bookings WHERE user_id IN (1, 2, 999);
DELETE FROM reviews WHERE user_id IN (1, 2, 999);
DELETE FROM wishlists WHERE user_id IN (1, 2, 999);
DELETE FROM notifications WHERE user_id IN (1, 2, 999);
DELETE FROM contact_requests WHERE assigned_to IN (1, 2);
DELETE FROM logs WHERE user_id IN (1, 2, 999);
DELETE FROM users WHERE id IN (1, 2, 999);

-- Tạo tài khoản Admin
-- Password: admin123 (simple for testing)
INSERT INTO users (id, name, email, password, role_id, status, phone, address, created_at) VALUES
(1, 'Admin System', 'admin@travelbooking.vn', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'Active', '0901234567', 'Hà Nội', NOW());

-- Tạo tài khoản Staff  
-- Password: staff123 (simple for testing)
INSERT INTO users (id, name, email, password, role_id, status, phone, address, created_at) VALUES
(2, 'Nhân Viên Support', 'staff@travelbooking.vn', '$2a$10$7NP0U4ELmQ4F5pjhE9z.dOKqrjzOjqYqzP5MhNj2h1JxYzV1VqYHu', 2, 'Active', '0901234568', 'TP. Hồ Chí Minh', NOW());

-- Tạo tài khoản Customer test
-- Password: customer123 (simple for testing)
INSERT INTO users (id, name, email, password, role_id, status, phone, address, created_at) VALUES
(999, 'Nguyễn Văn A', 'customer@test.com', '$2a$10$UBYqZ4l2YBJqUK9qFHEqVOJfBHNhWZHvL0NnL5Zk.E5JwYc5YJH5G', 3, 'Active', '0912345678', 'Hà Nội', NOW());

-- =============================
-- BƯỚC 10: INSERT SAMPLE BOOKING
-- =============================

-- Booking mẫu 1: Tour Phú Quốc
INSERT INTO bookings (
    booking_code, user_id, tour_id, schedule_id,
    customer_name, customer_email, customer_phone,
    start_date, num_adults, num_children,
    unit_price, total_price, discount_amount, final_amount,
    confirmation_status, payment_status,
    created_at
) VALUES
('BK2025100001', 999, 1, 1,
'Nguyễn Văn A', 'customer@test.com', '0912345678',
'2025-10-15', 2, 1,
3490000, 9770000, 0, 9770000,
'Confirmed', 'Paid',
NOW());

-- Thông tin hành khách cho booking trên
INSERT INTO booking_participants (booking_id, full_name, gender, dob, id_number, id_type, nationality, participant_type) VALUES
(1, 'Nguyễn Văn A', 'Male', '1985-05-15', '079085001234', 'CCCD', 'Việt Nam', 'Adult'),
(1, 'Trần Thị B', 'Female', '1988-08-20', '079088005678', 'CCCD', 'Việt Nam', 'Adult'),
(1, 'Nguyễn Văn C', 'Male', '2018-03-10', '079018001111', 'CCCD', 'Việt Nam', 'Child');

-- Payment cho booking trên
INSERT INTO payments (
    booking_id, payment_code, amount, payment_method, payment_provider,
    transaction_id, provider_transaction_id,
    status, paid_at
) VALUES
(1, 'PAY2025100001', 9770000, 'MoMo', 'MoMo E-Wallet',
'TXN1234567890', 'MOMO1234567890',
'Completed', NOW());

-- =============================
-- BƯỚC 11: INSERT TOUR FAQS
-- =============================

-- Xóa FAQs cũ nếu có
TRUNCATE TABLE tour_faqs;

-- FAQs cho Tour Phú Quốc
INSERT INTO tour_faqs (tour_id, question, answer, display_order) VALUES
(1, 'Tour có bao gồm vé máy bay không?', 'Có, tour đã bao gồm vé máy bay khứ hồi TP.HCM - Phú Quốc.', 1),
(1, 'Trẻ em dưới 2 tuổi có được miễn phí không?', 'Trẻ em dưới 2 tuổi được miễn phí tour, chỉ đóng vé máy bay (khoảng 890.000đ).', 2),
(1, 'Khách sạn có view biển không?', 'Khách sạn 3 sao, 1 số phòng có view biển (tùy tình trạng lúc check-in).', 3),
(1, 'Có thể ở lại Phú Quốc sau khi tour kết thúc không?', 'Có thể, quý khách vui lòng thông báo trước để được hỗ trợ đổi vé máy bay.', 4);

-- FAQs cho Tour Tokyo
INSERT INTO tour_faqs (tour_id, question, answer, display_order) VALUES
(10, 'Tour có hỗ trợ làm visa Nhật Bản không?', 'Có, chúng tôi hỗ trợ làm visa Nhật Bản. Chi phí: 1.200.000đ. Thời gian: 15-20 ngày.', 1),
(10, 'Tiền tệ sử dụng ở Nhật là gì?', 'Đồng Yên Nhật (JPY). Tỷ giá tham khảo: 1 JPY = 170 VNĐ. Nên đổi tiền trước khi đi.', 2),
(10, 'Tour có mùa hoa anh đào không?', 'Tour tháng 3-4 là mùa hoa anh đào. Cần đặt sớm do rất đông khách.', 3);

-- =============================
-- BƯỚC 12: INSERT TOUR IMAGES
-- =============================

-- Xóa images cũ nếu có
TRUNCATE TABLE tour_images;

-- Images cho Tour Phú Quốc
INSERT INTO tour_images (tour_id, image_url, caption, display_order, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', 'Bãi biển Phú Quốc', 1, TRUE),
(1, 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', 'Cáp treo Hòn Thơm', 2, FALSE),
(1, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'VinWonders Phú Quốc', 3, FALSE),
(1, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', 'Hoàng hôn biển Phú Quốc', 4, FALSE);

-- Images cho Tour Tokyo
INSERT INTO tour_images (tour_id, image_url, caption, display_order, is_primary) VALUES
(10, 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'Tokyo Tower', 1, TRUE),
(10, 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800', 'Núi Phú Sĩ', 2, FALSE),
(10, 'https://images.unsplash.com/photo-1555618254-74e3f7d4f9b8?w=800', 'Chùa Vàng Kyoto', 3, FALSE);

-- =============================
-- BƯỚC 13: LINK TOURS VỚI TARGET AUDIENCES
-- =============================

-- Xóa links cũ nếu có
TRUNCATE TABLE tour_target_audience;

-- Tour Phú Quốc phù hợp với: Gia đình, Cặp đôi, Nhóm bạn
INSERT INTO tour_target_audience (tour_id, target_audience_id) VALUES
(1, 1), (1, 2), (1, 3);

-- Tour Vũng Tàu phù hợp với: Gia đình, Người cao tuổi
INSERT INTO tour_target_audience (tour_id, target_audience_id) VALUES
(3, 1), (3, 4);

-- Tour Sapa phù hợp với: Gia đình, Nhóm bạn
INSERT INTO tour_target_audience (tour_id, target_audience_id) VALUES
(4, 1), (4, 3);

-- Tour Tokyo phù hợp với: Gia đình, Nhóm bạn
INSERT INTO tour_target_audience (tour_id, target_audience_id) VALUES
(10, 1), (10, 3);

-- Tour Maldives phù hợp với: Cặp đôi
INSERT INTO tour_target_audience (tour_id, target_audience_id) VALUES
(13, 2);

-- =============================
-- BƯỚC 14: INSERT SAMPLE REVIEWS
-- =============================

-- Xóa reviews cũ nếu có
TRUNCATE TABLE reviews;

-- Reviews cho Tour Phú Quốc
INSERT INTO reviews (user_id, tour_id, booking_id, rating, comment, status, created_at) VALUES
(999, 1, 1, 5, 'Tour rất tuyệt vời! Biển đẹp, hướng dẫn viên nhiệt tình. Gia đình mình rất hài lòng.', 'Approved', NOW()),
(999, 1, NULL, 4, 'Tour ổn, nhưng khách sạn hơi xa trung tâm. Tổng thể vẫn ok!', 'Approved', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- =============================
-- BƯỚC 15: UPDATE VIEW COUNT (simulate)
-- =============================

UPDATE tours SET view_count = FLOOR(RAND() * 5000) + 500 WHERE id BETWEEN 1 AND 14;

-- =============================
-- BƯỚC 16: VERIFY DATA
-- =============================

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- Verify categories
SELECT '=== CATEGORIES ===' AS '';
SELECT id, name, slug, is_featured FROM categories ORDER BY display_order;

-- Verify tours count
SELECT '=== TOURS SUMMARY ===' AS '';
SELECT 
    tour_type,
    COUNT(*) as total_tours,
    SUM(CASE WHEN is_featured = TRUE THEN 1 ELSE 0 END) as featured_tours
FROM tours
GROUP BY tour_type;

-- Verify tour schedules
SELECT '=== SCHEDULES SUMMARY ===' AS '';
SELECT 
    COUNT(*) as total_schedules,
    SUM(available_seats) as total_available_seats
FROM tour_schedules;

-- Verify bookings
SELECT '=== BOOKINGS SUMMARY ===' AS '';
SELECT 
    confirmation_status,
    payment_status,
    COUNT(*) as count
FROM bookings
GROUP BY confirmation_status, payment_status;

SELECT '✅ MIGRATION COMPLETED SUCCESSFULLY!' AS '';
SELECT 'Total tours inserted:' as info, COUNT(*) as value FROM tours
UNION ALL
SELECT 'Total schedules:', COUNT(*) FROM tour_schedules
UNION ALL
SELECT 'Total categories:', COUNT(*) FROM categories
UNION ALL
SELECT 'Total partners:', COUNT(*) FROM partners
UNION ALL
SELECT 'Total promotions:', COUNT(*) FROM promotions
UNION ALL
SELECT 'Total FAQs:', COUNT(*) FROM tour_faqs
UNION ALL
SELECT 'Total images:', COUNT(*) FROM tour_images;

-- =============================
-- KẾT THÚC MIGRATION
-- =============================
