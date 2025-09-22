-- =============================
-- Initial Data for Tour Booking System
-- =============================

-- Insert default roles
INSERT INTO roles (name) VALUES 
('Admin'), 
('Staff'), 
('Customer')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert sample categories
INSERT INTO categories (name, slug, description, status) VALUES 
('Du lịch biển', 'du-lich-bien', 'Các tour du lịch biển đảo tuyệt đẹp', 'Active'),
('Du lịch núi', 'du-lich-nui', 'Khám phá vẻ đẹp của núi rừng', 'Active'),
('Du lịch thành phố', 'du-lich-thanh-pho', 'Trải nghiệm văn hóa thành phố', 'Active'),
('Du lịch văn hóa', 'du-lich-van-hoa', 'Tìm hiểu di sản văn hóa', 'Active'),
('Du lịch phiêu lưu', 'du-lich-phieu-luu', 'Những chuyến phiêu lưu thú vị', 'Active')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description),
    status = VALUES(status);

-- Insert sample target audiences
INSERT INTO target_audiences (name) VALUES 
('Gia đình'),
('Cặp đôi'),
('Nhóm bạn'),
('Du khách cá nhân'),
('Doanh nghiệp'),
('Học sinh - Sinh viên')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert countries data
INSERT INTO countries (name, code, continent, currency, visa_required, flag_url) VALUES
-- Asia
('Nhật Bản', 'JP', 'ASIA', 'JPY', false, 'https://flagcdn.com/jp.svg'),
('Hàn Quốc', 'KR', 'ASIA', 'KRW', false, 'https://flagcdn.com/kr.svg'),
('Thái Lan', 'TH', 'ASIA', 'THB', false, 'https://flagcdn.com/th.svg'),
('Singapore', 'SG', 'ASIA', 'SGD', false, 'https://flagcdn.com/sg.svg'),
('Malaysia', 'MY', 'ASIA', 'MYR', false, 'https://flagcdn.com/my.svg'),
('Indonesia', 'ID', 'ASIA', 'IDR', false, 'https://flagcdn.com/id.svg'),
('Trung Quốc', 'CN', 'ASIA', 'CNY', true, 'https://flagcdn.com/cn.svg'),
('Ấn Độ', 'IN', 'ASIA', 'INR', true, 'https://flagcdn.com/in.svg'),
-- Europe
('Pháp', 'FR', 'EUROPE', 'EUR', true, 'https://flagcdn.com/fr.svg'),
('Đức', 'DE', 'EUROPE', 'EUR', true, 'https://flagcdn.com/de.svg'),
('Ý', 'IT', 'EUROPE', 'EUR', true, 'https://flagcdn.com/it.svg'),
('Tây Ban Nha', 'ES', 'EUROPE', 'EUR', true, 'https://flagcdn.com/es.svg'),
('Anh', 'GB', 'EUROPE', 'GBP', true, 'https://flagcdn.com/gb.svg'),
('Thụy Sĩ', 'CH', 'EUROPE', 'CHF', true, 'https://flagcdn.com/ch.svg'),
-- America
('Mỹ', 'US', 'AMERICA', 'USD', true, 'https://flagcdn.com/us.svg'),
('Canada', 'CA', 'AMERICA', 'CAD', true, 'https://flagcdn.com/ca.svg'),
('Brazil', 'BR', 'AMERICA', 'BRL', true, 'https://flagcdn.com/br.svg'),
-- Oceania
('Úc', 'AU', 'OCEANIA', 'AUD', true, 'https://flagcdn.com/au.svg'),
('New Zealand', 'NZ', 'OCEANIA', 'NZD', true, 'https://flagcdn.com/nz.svg')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    continent = VALUES(continent),
    currency = VALUES(currency),
    visa_required = VALUES(visa_required),
    flag_url = VALUES(flag_url);

-- Insert sample partners
INSERT INTO partners (name, slug, description, type, address, phone, email, website, established_year, rating, total_reviews, specialties, created_at, updated_at) VALUES 
('Khách sạn Đại Dương', 'khach-san-dai-duong', 'Khách sạn view biển tuyệt đẹp với dịch vụ 5 sao, vị trí đắc địa ngay trung tâm Nha Trang', 'Hotel', '123 Đường Biển, Nha Trang', '0258-123-4567', 'info@daiduonghotel.com', 'https://daiduonghotel.com', 2010, 4.5, 1250, '["Luxury", "Beach", "Family"]', NOW(), NOW()),
('Saigon Tourist', 'saigon-tourist', 'Công ty du lịch hàng đầu với hơn 20 năm kinh nghiệm tổ chức tour trong nước và quốc tế', 'TourOperator', '45 Lê Thánh Tôn, Quận 1, TP.HCM', '028-123-4567', 'info@saigontourist.com', 'https://saigontourist.com', 2000, 4.8, 2500, '["Adventure", "Cultural", "Luxury"]', NOW(), NOW()),
('Vietravel', 'vietravel', 'Hệ thống du lịch uy tín với mạng lưới toàn quốc, chuyên tổ chức tour cao cấp', 'TourOperator', '190 Pasteur, Quận 3, TP.HCM', '028-987-6543', 'contact@vietravel.com', 'https://vietravel.com', 1995, 4.7, 3200, '["Family", "Adventure", "Eco"]', NOW(), NOW()),
('Resort Paradise', 'resort-paradise', 'Resort nghỉ dưỡng cao cấp với bãi biển riêng và dịch vụ spa đẳng cấp quốc tế', 'Hotel', '321 Bãi Biển, Phú Quốc', '0297-111-2222', 'booking@paradiseresort.com', 'https://paradiseresort.com', 2015, 4.9, 800, '["Luxury", "Beach", "Spa"]', NOW(), NOW()),
('TNK Travel', 'tnk-travel', 'Chuyên tổ chức tour phiêu lưu và khám phá cho giới trẻ với giá cả hợp lý', 'TourOperator', '216 Đề Thám, Quận 1, TP.HCM', '028-555-7777', 'hello@tnktravel.com', 'https://tnktravel.com', 2012, 4.6, 1800, '["Adventure", "Budget", "Backpacker"]', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    slug = VALUES(slug),
    description = VALUES(description),
    address = VALUES(address),
    phone = VALUES(phone),
    email = VALUES(email),
    website = VALUES(website),
    established_year = VALUES(established_year),
    rating = VALUES(rating),
    total_reviews = VALUES(total_reviews),
    specialties = VALUES(specialties);

-- Insert sample promotions
INSERT INTO promotions (code, type, value, usage_limit, start_date, end_date, status) VALUES 
('SUMMER2024', 'Percentage', 15.00, 100, '2024-06-01 00:00:00', '2024-08-31 23:59:59', 'Active'),
('NEWCUSTOMER', 'Fixed', 200000.00, 500, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'Active'),
('FAMILY20', 'Percentage', 20.00, 50, '2024-07-01 00:00:00', '2024-09-30 23:59:59', 'Active')
ON DUPLICATE KEY UPDATE 
    type = VALUES(type),
    value = VALUES(value),
    usage_limit = VALUES(usage_limit),
    start_date = VALUES(start_date),
    end_date = VALUES(end_date),
    status = VALUES(status);

-- Insert admin user (password: admin123 - BCrypt hash)
INSERT IGNORE INTO users (name, email, password, role_id, status, phone, created_at) VALUES 
('Administrator', 'admin@gmail.com', '$2a$10$L3LHC.cr1PcrGNhiLFsIgupd29K5EfSBkB4iQ89dAz3RLJnqNriBi', 1, 'Active', '0123456789', NOW());

-- Insert sample staff user (password: staff123 - BCrypt hash)
INSERT IGNORE INTO users (name, email, password, role_id, status, phone, created_at) VALUES 
('Nhân viên Tour', 'staff@gmail.com', '$2a$10$dXJ3sw6G7P1LVUmDLxBdBeMohpOFc.2caTfwQqP/RXSBNKAjbLDrC', 2, 'Active', '0987654321', NOW());

-- Insert test customer user (password: 123456 - BCrypt hash)
INSERT IGNORE INTO users (name, email, password, role_id, status, phone, created_at) VALUES 
('Test User', 'test@test.com', '$2a$10$GRLdGijbbqRWX8iyiO5OKu7csNa7vQDdmVfqzxBLYX5/XdnWer2u.', 3, 'Active', '0123456788', NOW());

-- Insert sample partner images
INSERT INTO partner_images (partner_id, image_url, image_type, display_order, alt_text) VALUES 
-- Khách sạn Đại Dương (partner_id = 1)
(1, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', 'cover', 0, 'Khách sạn Đại Dương - View tổng thể'),
(1, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 'logo', 0, 'Logo Khách sạn Đại Dương'),
(1, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600', 'gallery', 1, 'Lobby sang trọng'),
(1, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600', 'gallery', 2, 'Phòng Superior view biển'),
(1, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600', 'gallery', 3, 'Hồ bơi infinity'),
(1, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=600', 'gallery', 4, 'Nhà hàng view biển'),

-- Saigon Tourist (partner_id = 2)
(2, 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800', 'cover', 0, 'Saigon Tourist - Văn phòng trung tâm'),
(2, 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400', 'logo', 0, 'Logo Saigon Tourist'),
(2, 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600', 'gallery', 1, 'Tour Hạ Long Bay'),
(2, 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600', 'gallery', 2, 'Tour Sapa'),
(2, 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600', 'gallery', 3, 'Tour Phú Quốc'),
(2, 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=600', 'gallery', 4, 'Tour Đà Nẵng'),

-- Vietravel (partner_id = 3)
(3, 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800', 'cover', 0, 'Vietravel - Trụ sở chính'),
(3, 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400', 'logo', 0, 'Logo Vietravel'),
(3, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600', 'gallery', 1, 'Tour Hội An'),
(3, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600', 'gallery', 2, 'Tour Mũi Né'),
(3, 'https://images.unsplash.com/photo-1580418827493-f2b22c0a76cb?w=600', 'gallery', 3, 'Tour Cần Thơ'),

-- Resort Paradise (partner_id = 4)
(4, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800', 'cover', 0, 'Resort Paradise - Tổng quan resort'),
(4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', 'logo', 0, 'Logo Resort Paradise'),
(4, 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600', 'gallery', 1, 'Bãi biển riêng'),
(4, 'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=600', 'gallery', 2, 'Villa view biển'),
(4, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', 'gallery', 3, 'Spa & Wellness'),
(4, 'https://images.unsplash.com/photo-1544966503-7cc61b31fc34?w=600', 'gallery', 4, 'Watersport activities'),

-- TNK Travel (partner_id = 5)
(5, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', 'cover', 0, 'TNK Travel - Adventure tours'),
(5, 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400', 'logo', 0, 'Logo TNK Travel'),
(5, 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=600', 'gallery', 1, 'Trekking Sapa'),
(5, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600', 'gallery', 2, 'Motorbiking tours'),
(5, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', 'gallery', 3, 'Kayaking adventures')
ON DUPLICATE KEY UPDATE 
    image_url = VALUES(image_url),
    image_type = VALUES(image_type),
    display_order = VALUES(display_order),
    alt_text = VALUES(alt_text);

-- Insert sample international tours
INSERT INTO tours (name, slug, short_description, description, price, duration, max_people, category_id, tour_type, country_id, visa_info, flight_included, is_featured, status, created_at, updated_at) VALUES
-- Japan Tours
('Tokyo - Kyoto - Osaka 7N6Đ', 'tokyo-kyoto-osaka-7n6d', 'Khám phá Nhật Bản cổ điển và hiện đại', 'Hành trình khám phá 3 thành phố nổi tiếng nhất Nhật Bản. Từ Tokyo hiện đại, Kyoto cổ kính đến Osaka ẩm thực. Trải nghiệm văn hóa, lịch sử và ẩm thực độc đáo của xứ sở Phù Tang.', 32000000, 7, 20, 3, 'INTERNATIONAL', 1, 'Công dân Việt Nam được miễn visa 15 ngày khi có passport còn hạn trên 6 tháng', true, true, 'Active', NOW(), NOW()),

('Osaka - Mount Fuji - Tokyo 6N5Đ', 'osaka-mount-fuji-tokyo-6n5d', 'Tour Nhật Bản kinh điển với núi Phú Sĩ', 'Chiêm ngưỡng vẻ đẹp hùng vĩ của núi Phú Sĩ, khám phá Tokyo sầm uất và thưởng thức ẩm thực Osaka. Bao gồm trải nghiệm onsen và tham quan đền chùa cổ.', 28500000, 6, 25, 4, 'INTERNATIONAL', 1, 'Miễn visa 15 ngày cho công dân Việt Nam', true, false, 'Active', NOW(), NOW()),

-- South Korea Tours  
('Seoul - Jeju Island 5N4Đ', 'seoul-jeju-island-5n4d', 'Khám phá Hàn Quốc từ thủ đô đến đảo Jeju', 'Trải nghiệm văn hóa K-pop tại Seoul, tham quan cung điện hoàng gia và mua sắm tại Myeongdong. Sau đó bay đến đảo Jeju thơ mộng với những cảnh quan thiên nhiên tuyệt đẹp.', 18500000, 5, 30, 3, 'INTERNATIONAL', 2, 'Miễn visa 15 ngày cho công dân Việt Nam có passport phổ thông', true, true, 'Active', NOW(), NOW()),

('Seoul - Busan 6N5Đ', 'seoul-busan-6n5d', 'Khám phá hai thành phố lớn nhất Hàn Quốc', 'Từ Seoul hiện đại đến Busan biển xanh. Tham quan làng Bukchon Hanok, cung điện Gyeongbokgung, chợ Jagalchi và bãi biển Haeundae. Trải nghiệm ẩm thực đường phố và K-beauty.', 16800000, 6, 25, 3, 'INTERNATIONAL', 2, 'Không cần visa cho công dân Việt Nam lưu trú dưới 15 ngày', true, false, 'Active', NOW(), NOW()),

-- Thailand Tours
('Bangkok - Pattaya 4N3Đ', 'bangkok-pattaya-4n3d', 'Thái Lan kinh điển - Thủ đô và biển', 'Khám phá Bangkok sôi động với chợ nổi, cung điện hoàng gia và chùa Wat Arun. Thư giãn tại bãi biển Pattaya với các hoạt động thể thao nước và show diễn cabaret nổi tiếng.', 12800000, 4, 35, 1, 'INTERNATIONAL', 3, 'Không cần visa cho công dân Việt Nam lưu trú dưới 30 ngày', true, true, 'Active', NOW(), NOW()),

('Phuket - Krabi 5N4Đ', 'phuket-krabi-5n4d', 'Thiên đường biển đảo Thái Lan', 'Tận hưởng những bãi biển đẹp nhất Thái Lan tại Phuket và Krabi. Tham gia tour 4 đảo, lặn ngắm san hô, massage Thái cổ truyền và thưởng thức hải sản tươi ngon.', 15200000, 5, 30, 1, 'INTERNATIONAL', 3, 'Miễn visa 30 ngày cho du khách Việt Nam', true, false, 'Active', NOW(), NOW()),

-- Singapore Tours
('Singapore - Malaysia 4N3Đ', 'singapore-malaysia-4n3d', 'Hai quốc gia ASEAN trong một chuyến đi', 'Khám phá Singapore hiện đại với Gardens by the Bay, Universal Studios và Marina Bay Sands. Sau đó đến Kuala Lumpur tham quan tháp đôi Petronas và thưởng thức ẩm thực đa văn hóa.', 16500000, 4, 28, 3, 'INTERNATIONAL', 4, 'Không cần visa cho công dân Việt Nam lưu trú dưới 30 ngày', true, true, 'Active', NOW(), NOW())

ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    short_description = VALUES(short_description),
    description = VALUES(description),
    price = VALUES(price),
    duration = VALUES(duration),
    max_people = VALUES(max_people),
    tour_type = VALUES(tour_type),
    country_id = VALUES(country_id),
    visa_info = VALUES(visa_info),
    flight_included = VALUES(flight_included),
    is_featured = VALUES(is_featured),
    status = VALUES(status);
