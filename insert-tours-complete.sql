-- =============================
-- INSERT 28 TOURS HOÀN CHỈNH
-- =============================

USE travelbooking;

-- Tắt foreign key check tạm thời
SET FOREIGN_KEY_CHECKS = 0;

-- Đảm bảo có đủ categories
INSERT INTO categories (id, name, slug, description, status, created_at, updated_at) VALUES
(1, 'Du lịch miền Bắc', 'du-lich-mien-bac', 'Khám phá vùng đất phía Bắc Việt Nam', 'Active', NOW(), NOW()),
(2, 'Du lịch miền Trung', 'du-lich-mien-trung', 'Khám phá miền Trung di sản', 'Active', NOW(), NOW()),
(3, 'Du lịch miền Nam', 'du-lich-mien-nam', 'Khám phá Nam Bộ sôi động', 'Active', NOW(), NOW()),
(4, 'Du lịch biển đảo', 'du-lich-bien-dao', 'Tour biển đảo tuyệt đẹp', 'Active', NOW(), NOW()),
(5, 'Du lịch Châu Á', 'du-lich-chau-a', 'Khám phá các nước châu Á', 'Active', NOW(), NOW()),
(6, 'Du lịch Đông Nam Á', 'du-lich-dong-nam-a', 'Tour Đông Nam Á', 'Active', NOW(), NOW()),
(7, 'Du lịch Nhật Bản', 'du-lich-nhat-ban', 'Xứ sở hoa anh đào', 'Active', NOW(), NOW()),
(8, 'Du lịch Hàn Quốc', 'du-lich-han-quoc', 'Xứ sở kim chi', 'Active', NOW(), NOW()),
(9, 'Du lịch Châu Âu', 'du-lich-chau-au', 'Khám phá châu Âu cổ kính', 'Active', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    description = VALUES(description),
    status = 'Active',
    updated_at = NOW();

-- Bật lại foreign key check
SET FOREIGN_KEY_CHECKS = 1;

-- =============================
-- TOURS TRONG NƯỚC (14 tours)
-- =============================

INSERT INTO tours (name, slug, short_description, description, price, sale_price, duration, max_people, status, is_featured, category_id, tour_type, main_image, location, country_code, continent, rating, review_count, visa_required, flight_included) VALUES
-- MIỀN BẮC (5 tours)
('Hà Nội - Hạ Long - Ninh Bình 3N2Đ', 'ha-noi-ha-long-ninh-binh-3n2d', 'Khám phá ba điểm đến nổi tiếng miền Bắc', 'Tour trọn gói khám phá Vịnh Hạ Long kỳ vĩ, Tràng An Ninh Bình thơ mộng và Hà Nội ngàn năm văn hiến. Tham quan các di tích lịch sử, thưởng thức ẩm thực đặc sản.', 2890000, 2490000, 3, 30, 'Active', TRUE, 1, 'DOMESTIC', 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800', 'Quảng Ninh', 'VN', 'Asia', 4.8, 245, FALSE, FALSE),

('Sapa - Fansipan - Cát Cát 2N3Đ', 'sapa-fansipan-cat-cat-2n3d', 'Chinh phục nóc nhà Đông Dương', 'Trekking chinh phục đỉnh Fansipan bằng cáp treo, khám phá bản Cát Cát, thưởng ngoạn ruộng bậc thang, trải nghiệm văn hóa dân tộc thiểu số.', 1890000, NULL, 2, 20, 'Active', FALSE, 1, 'DOMESTIC', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', 'Lào Cai', 'VN', 'Asia', 4.9, 189, FALSE, FALSE),

('Đà Lạt - Thành phố ngàn hoa 3N2Đ', 'da-lat-thanh-pho-ngan-hoa-3n2d', 'Lãng mạn thành phố sương mù', 'Tham quan thác Datanla, Hồ Tuyền Lâm, check-in cà phê đẹp, đi dạo Hồ Xuân Hương, chợ đêm Đà Lạt, nông trại dâu tây.', 2790000, NULL, 3, 25, 'Active', FALSE, 1, 'DOMESTIC', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', 'Lâm Đồng', 'VN', 'Asia', 4.7, 289, FALSE, FALSE),

('Tây Bắc - Điện Biên - Mộc Châu 5N4Đ', 'tay-bac-dien-bien-moc-chau-5n4d', 'Hành trình chinh phục Tây Bắc', 'Tour khám phá vùng Tây Bắc hùng vĩ: Điện Biên Phủ anh hùng, Mộc Châu thơ mộng, Sơn La núi rừng hùng vĩ, trải nghiệm văn hóa dân tộc.', 6890000, 6490000, 5, 20, 'Active', FALSE, 1, 'DOMESTIC', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', 'Điện Biên', 'VN', 'Asia', 4.5, 87, FALSE, FALSE),

('Tây Nguyên - Buôn Ma Thuột 4N3Đ', 'tay-nguyen-buon-ma-thuot-4n3d', 'Vùng đất huyền thoại', 'Khám phá vùng đất Tây Nguyên với cà phê nguyên chất, thác Dray Nur hùng vĩ, biển Hồ thơ mộng, văn hóa cồng chiêng độc đáo.', 4990000, NULL, 4, 25, 'Active', FALSE, 1, 'DOMESTIC', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', 'Đắk Lắk', 'VN', 'Asia', 4.6, 134, FALSE, FALSE),

-- MIỀN TRUNG (3 tours)
('Đà Nẵng - Hội An - Bà Nà 4N3Đ', 'da-nang-hoi-an-ba-na-4n3d', 'Biển xanh cát trắng phố cổ', 'Tour trọn gói khám phá Đà Nẵng hiện đại, phố cổ Hội An cổ kính, Sun World Bà Nà Hills với Cầu Vàng nổi tiếng. Tắm biển Mỹ Khê, check-in sống ảo.', 3990000, 3490000, 4, 25, 'Active', TRUE, 2, 'DOMESTIC', 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800', 'Đà Nẵng', 'VN', 'Asia', 4.7, 312, FALSE, FALSE),

('Huế - Động Phong Nha 3N2Đ', 'hue-dong-phong-nha-3n2d', 'Di sản văn hóa thế giới', 'Tham quan Đại Nội Huế, lăng tẩm các vua triều Nguyễn, thưởng ngoạn sông Hương thơ mộng, khám phá động Phong Nha - hang động đẹp nhất thế giới.', 3290000, NULL, 3, 25, 'Active', FALSE, 2, 'DOMESTIC', 'https://images.unsplash.com/photo-1585159812596-fac104f2f069?w=800', 'Quảng Bình', 'VN', 'Asia', 4.6, 156, FALSE, FALSE),

('Quy Nhơn - Phú Yên 3N2Đ', 'quy-nhon-phu-yen-3n2d', 'Thiên đường biển ẩn mình', 'Khám phá Quy Nhơn với bãi biển hoang sơ, Kỳ Co thiên đường, Eo Gió hùng vĩ, Phú Yên với Gành Đá Đĩa độc đáo.', 3190000, 2890000, 3, 25, 'Active', FALSE, 2, 'DOMESTIC', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', 'Bình Định', 'VN', 'Asia', 4.5, 178, FALSE, FALSE),

-- MIỀN NAM (3 tours)
('TP.HCM - Củ Chi - Mekong 2N1Đ', 'tp-hcm-cu-chi-mekong-2n1d', 'Sài Gòn sôi động và miệt vườn', 'Khám phá Sài Gòn về đêm, tham quan địa đạo Củ Chi, du thuyền sông Mekong, thưởng thức đặc sản miệt vườn, tham quan vườn trái cây.', 1590000, NULL, 2, 30, 'Active', FALSE, 3, 'DOMESTIC', 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', 'TP. Hồ Chí Minh', 'VN', 'Asia', 4.5, 198, FALSE, FALSE),

('Phú Quốc - Đảo Ngọc 4N3Đ', 'phu-quoc-dao-ngoc-4n3d', 'Thiên đường biển đảo Việt Nam', 'Nghỉ dưỡng resort 4 sao, tắm biển Bãi Sao, Bãi Dài, lặn ngắm san hô, câu cá, thưởng thức hải sản tươi sống, tham quan VinWonders.', 5990000, 5490000, 4, 20, 'Active', TRUE, 4, 'DOMESTIC', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', 'Kiên Giang', 'VN', 'Asia', 4.9, 412, FALSE, FALSE),

('Nha Trang - Biển xanh 3N2Đ', 'nha-trang-bien-xanh-3n2d', 'Thủ đô Resort của Việt Nam', 'Tắm biển Nha Trang, tham quan Vinpearl Land, lặn ngắm san hô, tắm bùn khoáng, thưởng thức hải sản tươi ngon.', 3490000, 2990000, 3, 30, 'Active', TRUE, 4, 'DOMESTIC', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', 'Khánh Hòa', 'VN', 'Asia', 4.8, 356, FALSE, FALSE),

-- BIỂN ĐẢO THÊM (3 tours)
('Côn Đảo - Thiên đường biển 3N2Đ', 'con-dao-thien-duong-bien-3n2d', 'Côn Đảo hoang sơ và bí ẩn', 'Khám phá Côn Đảo với bãi biển hoang sơ tuyệt đẹp, lặn ngắm san hô, tham quan nhà tù Côn Đảo, thưởng thức hải sản tươi.', 6990000, 6490000, 3, 15, 'Active', TRUE, 4, 'DOMESTIC', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', 'Bà Rịa - Vũng Tàu', 'VN', 'Asia', 4.9, 156, FALSE, TRUE),

('Cù Lao Chàm - Hòn đảo xanh 2N1Đ', 'cu-lao-cham-hon-dao-xanh-2n1d', 'Khu dự trữ sinh quyển thế giới', 'Tour Cù Lao Chàm: Lặn ngắm san hô, tham quan làng chài, chợ hải sản, tắm biển, du ngoạn đảo bằng xe máy.', 2290000, 1990000, 2, 20, 'Active', FALSE, 4, 'DOMESTIC', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', 'Quảng Nam', 'VN', 'Asia', 4.6, 98, FALSE, FALSE),

('Vũng Tàu - Bãi Sau - Long Hải 2N1Đ', 'vung-tau-bai-sau-long-hai-2n1d', 'Gần Sài Gòn dễ đi', 'Tour Vũng Tàu gần Sài Gòn: Tắm biển Bãi Sau, tham quan Tượng Chúa, ngọn Hải Đăng, chợ hải sản, thưởng thức bánh khọt.', 1790000, 1490000, 2, 30, 'Active', FALSE, 4, 'DOMESTIC', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', 'Bà Rịa - Vũng Tàu', 'VN', 'Asia', 4.4, 267, FALSE, FALSE);

-- =============================
-- TOURS QUỐC TẾ (14 tours)
-- =============================

INSERT INTO tours (name, slug, short_description, description, price, sale_price, duration, max_people, status, is_featured, category_id, tour_type, main_image, location, country_code, continent, rating, review_count, visa_required, flight_included) VALUES
-- NHẬT BẢN (2 tours)
('Tokyo - Kyoto - Osaka 7N6Đ', 'tokyo-kyoto-osaka-7n6d', 'Hành trình khám phá 3 thành phố', 'Tour trọn gói khám phá Tokyo hiện đại, Kyoto cổ kính với đền chùa, Osaka sầm uất. Tham quan núi Phú Sĩ, check-in cổng Torii đỏ, thưởng thức sushi, ramen.', 35900000, 32900000, 7, 25, 'Active', TRUE, 7, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'Tokyo', 'JP', 'Asia', 4.9, 523, TRUE, TRUE),

('Hokkaido - Sapporo 6N5Đ Mùa Tuyết', 'hokkaido-sapporo-6n5d', 'Mùa đông xứ sở tuyết trắng', 'Tour mùa đông khám phá Hokkaido tuyết phủ, lễ hội tuyết Sapporo, tắm onsen, trượt tuyết, thưởng thức hải sản tươi ngon, cua king crab.', 42900000, NULL, 6, 20, 'Active', TRUE, 7, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800', 'Hokkaido', 'JP', 'Asia', 5.0, 298, TRUE, TRUE),

-- HÀN QUỐC (2 tours)
('Seoul - Jeju Island 5N4Đ', 'seoul-jeju-island-5n4d', 'Trải nghiệm văn hóa K-pop', 'Tour Seoul sôi động với Gangnam, Myeongdong, cung điện Gyeongbokgung, đảo Jeju lãng mạn với bãi biển đẹp, núi Hallasan.', 18900000, 16900000, 5, 30, 'Active', TRUE, 8, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800', 'Seoul', 'KR', 'Asia', 4.8, 612, TRUE, TRUE),

('Busan - Daegu - Gyeongju 4N3Đ', 'busan-daegu-gyeongju-4n3d', 'Khám phá miền Nam Hàn Quốc', 'Tour khám phá Busan - thành phố cảng, Gyeongju - bảo tàng không mái, Daegu - thành phố áo cưới. Tham quan chùa Haedong Yonggungsa.', 16900000, NULL, 4, 25, 'Active', FALSE, 8, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1578193848151-7d3369e66017?w=800', 'Busan', 'KR', 'Asia', 4.7, 234, TRUE, TRUE),

-- THÁI LAN (2 tours)
('Bangkok - Pattaya 4N3Đ', 'bangkok-pattaya-4n3d', 'Thái Lan sôi động', 'Tour Bangkok - Pattaya giá tốt: Hoàng cung Bangkok, chùa Phật Vàng, buffet 86 tầng Baiyoke Sky, biển Pattaya, show Tiffany.', 8900000, 7490000, 4, 35, 'Active', TRUE, 6, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800', 'Bangkok', 'TH', 'Asia', 4.6, 892, FALSE, TRUE),

('Phuket - Krabi - Phi Phi 5N4Đ', 'phuket-krabi-phi-phi-5n4d', 'Thiên đường biển Thái Lan', 'Tour biển đảo Phuket - Krabi với bãi biển tuyệt đẹp, lặn ngắm san hô Phi Phi, tắm biển Patong, James Bond Island.', 12900000, 11490000, 5, 30, 'Active', TRUE, 6, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=800', 'Phuket', 'TH', 'Asia', 4.9, 756, FALSE, TRUE),

-- SINGAPORE - MALAYSIA (2 tours)
('Singapore - Garden City 4N3Đ', 'singapore-garden-city-4n3d', 'Đảo quốc sư tử xinh đẹp', 'Tour Singapore: Gardens by the Bay, Marina Bay Sands, Sentosa, Universal Studios, phố người Hoa, Arab Street.', 15900000, 14900000, 4, 30, 'Active', TRUE, 6, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800', 'Singapore', 'SG', 'Asia', 4.7, 445, FALSE, TRUE),

('Kuala Lumpur - Malacca 3N2Đ', 'kuala-lumpur-malacca-3n2d', 'Khám phá Malaysia đa sắc màu', 'Tour KL - Malacca: Tháp đôi Petronas, hang Batu, phố cổ Malacca di sản UNESCO, ẩm thực đường phố.', 6990000, 5990000, 3, 30, 'Active', FALSE, 6, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800', 'Kuala Lumpur', 'MY', 'Asia', 4.5, 312, FALSE, TRUE),

-- INDONESIA (1 tour)
('Bali - Đảo của các vị thần 5N4Đ', 'bali-dao-cua-cac-vi-than-5n4d', 'Thiên đường nghỉ dưỡng Bali', 'Tour Bali trọn gói: đền Tanah Lot, ruộng bậc thang Tegalalang, Ubud Monkey Forest, bãi biển Kuta, Seminyak.', 13900000, 12490000, 5, 25, 'Active', TRUE, 6, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'Bali', 'ID', 'Asia', 4.8, 689, TRUE, TRUE),

-- TRUNG QUỐC (1 tour)
('Bắc Kinh - Thượng Hải 7N6Đ', 'bac-kinh-thuong-hai-7n6d', 'Khám phá Trung Hoa', 'Tour Trung Quốc: Vạn Lý Trường Thành, Tử Cấm Thành, Thượng Hải hiện đại, vườn cổ Tô Châu, Bund về đêm.', 24900000, 22900000, 7, 25, 'Active', FALSE, 5, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800', 'Beijing', 'CN', 'Asia', 4.6, 234, TRUE, TRUE),

-- CHÂU ÂU - PHÁP (1 tour)
('Paris - Chamonix - Nice 8N7Đ', 'paris-chamonix-nice-8n7d', 'Hành trình khám phá Pháp', 'Tour Pháp trọn gói: Paris lãng mạn với tháp Eiffel, Khải Hoàn Môn, Louvre, Versailles, Alps Chamonix, biển Nice.', 68900000, 64900000, 8, 20, 'Active', TRUE, 9, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 'Paris', 'FR', 'Europe', 5.0, 187, TRUE, TRUE),

-- CHÂU ÂU - Ý (1 tour)
('Rome - Florence - Venice 7N6Đ', 'rome-florence-venice-7n6d', 'Ba thành phố nghệ thuật Ý', 'Tour Ý cổ điển: Rome với Colosseum, Vatican, Florence với David, Venice thành phố trên nước, gondola lãng mạn.', 72900000, NULL, 7, 20, 'Active', TRUE, 9, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800', 'Rome', 'IT', 'Europe', 4.9, 156, TRUE, TRUE),

-- MỸ (1 tour)
('New York - LA - Las Vegas 10N9Đ', 'new-york-la-las-vegas-10n9d', 'Hành trình bờ Đông - Tây Mỹ', 'Tour Mỹ xuyên lục địa: New York Times Square, Tượng Nữ Thần, LA Hollywood, Universal Studios, Las Vegas, Grand Canyon.', 98900000, 89900000, 10, 15, 'Active', TRUE, 9, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', 'New York', 'US', 'America', 4.8, 234, TRUE, TRUE),

-- ÚC (1 tour)
('Sydney - Melbourne - Gold Coast 9N8Đ', 'sydney-melbourne-gold-coast-9n8d', 'Khám phá xứ sở Kangaroo', 'Tour Úc trọn gói: Sydney Opera House, cầu Harbour Bridge, bãi biển Bondi, Melbourne nghệ thuật, Gold Coast lướt sóng.', 89900000, 82900000, 9, 18, 'Active', TRUE, 9, 'INTERNATIONAL', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', 'Sydney', 'AU', 'Oceania', 4.9, 198, TRUE, TRUE);

-- Thông báo hoàn thành
SELECT '✅ Đã thêm 28 tours thành công!' AS Status;
SELECT CONCAT('✅ Tours trong nước: ', COUNT(*)) AS DomesticTours FROM tours WHERE tour_type = 'DOMESTIC';
SELECT CONCAT('✅ Tours quốc tế: ', COUNT(*)) AS InternationalTours FROM tours WHERE tour_type = 'INTERNATIONAL';
SELECT CONCAT('✅ Tổng số tours: ', COUNT(*)) AS TotalTours FROM tours;
SELECT CONCAT('✅ Tours Active: ', COUNT(*)) AS ActiveTours FROM tours WHERE status = 'Active' AND deleted_at IS NULL;
