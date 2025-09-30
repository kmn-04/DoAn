-- ================================================
-- INSERT PARTNER DATA - CHỈ KHÁCH SẠN & NHÀ HÀNG
-- ================================================
USE doan;

-- ================================================
-- XÓA TẤT CẢ DỮ LIỆU CŨ (bao gồm Transport, TourOperator, Service)
-- ================================================

-- Tắt safe update mode và foreign key checks
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa tất cả partner images
DELETE FROM partner_images WHERE id > 0 OR id IS NOT NULL;

-- Xóa tất cả partners (bao gồm cả các loại Transport, TourOperator, Service)
DELETE FROM partners WHERE id > 0 OR id IS NOT NULL;

-- Xóa các tour_itineraries liên quan đến partners cũ (nếu có)
DELETE FROM tour_itineraries WHERE partner_id IS NOT NULL;

-- Bật lại safe update mode và foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
SET SQL_SAFE_UPDATES = 1;

-- Reset auto increment
ALTER TABLE partners AUTO_INCREMENT = 1;
ALTER TABLE partner_images AUTO_INCREMENT = 1;

-- ================================================
-- CHỈ THÊM MỚI: HOTEL & RESTAURANT
-- ================================================

-- ================================================
-- KHÁCH SẠN (Hotels)
-- ================================================

-- 1. Khách sạn Hà Nội
INSERT INTO partners (name, slug, description, type, address, phone, email, website, established_year, avatar_url, rating, status, specialties, created_at, updated_at) VALUES
('Sofitel Legend Metropole Hanoi', 'sofitel-legend-metropole-hanoi', 'Khách sạn sang trọng 5 sao nằm trong trung tâm Hà Nội, được xây dựng từ năm 1901 với kiến trúc thuộc địa Pháp đẳng cấp. Khách sạn mang đến trải nghiệm nghỉ dưỡng cao cấp với dịch vụ hoàn hảo.', 'Hotel', '15 Ngô Quyền, Hoàn Kiếm, Hà Nội', '024-3826-6919', 'info@sofitel-hanoi.com', 'https://sofitel-hanoi.com', 1901, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', 4.9, 'Active', '["Khách sạn 5 sao", "Lịch sử lâu đời", "Spa cao cấp", "Nhà hàng Michelin", "Gần Hồ Hoàn Kiếm"]', NOW(), NOW()),

('JW Marriott Hotel Hanoi', 'jw-marriott-hanoi', 'Khách sạn 5 sao hiện đại tọa lạc tại khu vực trung tâm Hà Nội, cung cấp phòng nghỉ sang trọng, hồ bơi ngoài trời, spa, và nhiều lựa chọn ẩm thực đa dạng.', 'Hotel', '8 Đỗ Đức Dục, Mễ Trì, Nam Từ Liêm, Hà Nội', '024-3833-5588', 'reservation.hanoi@marriott.com', 'https://jwmarriott-hanoi.com', 2013, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', 4.8, 'Active', '["Khách sạn 5 sao", "Hồ bơi ngoài trời", "Spa & Fitness", "Phòng họp cao cấp", "Gần sân bay"]', NOW(), NOW()),

('Pan Pacific Hanoi', 'pan-pacific-hanoi', 'Khách sạn 5 sao với thiết kế hiện đại, nằm ở vị trí đắc địa trên đường Thanh Niên, view Hồ Tây tuyệt đẹp. Dịch vụ tận tâm và chuyên nghiệp.', 'Hotel', '1 Thanh Niên, Ba Đình, Hà Nội', '024-3823-8888', 'info.hanoi@panpacific.com', 'https://panpacific.com/hanoi', 2015, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', 4.7, 'Active', '["Khách sạn 5 sao", "View Hồ Tây", "Buffet quốc tế", "Phòng Deluxe rộng rãi", "Club Lounge"]', NOW(), NOW()),

('Hilton Hanoi Opera', 'hilton-hanoi-opera', 'Khách sạn 5 sao nằm đối diện Nhà hát Lớn Hà Nội, gần Hồ Hoàn Kiếm. Thiết kế kết hợp giữa phong cách cổ điển và hiện đại, phục vụ khách du lịch và doanh nhân.', 'Hotel', '1 Lê Thánh Tông, Hoàn Kiếm, Hà Nội', '024-3933-0500', 'reservations.hanoiopera@hilton.com', 'https://hilton.com/hanoi', 1999, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', 4.6, 'Active', '["Khách sạn 5 sao", "Vị trí trung tâm", "Nhà hàng Ý", "Hồ bơi trong nhà", "Gần phố cổ"]', NOW(), NOW()),

('Hanoi La Siesta Hotel & Spa', 'hanoi-la-siesta-hotel-spa', 'Khách sạn boutique 4 sao nằm giữa lòng phố cổ Hà Nội, mang đến không gian ấm cúng, thân thiện với dịch vụ spa miễn phí và ẩm thực đặc sắc.', 'Hotel', '94 Mã Mây, Hoàn Kiếm, Hà Nội', '024-3926-3641', 'reservation@hanoilasiesta.com', 'https://hanoilasiesta.com', 2012, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', 4.8, 'Active', '["Khách sạn 4 sao", "Spa miễn phí", "Buffet sáng ngon", "Nhân viên thân thiện", "Giữa phố cổ"]', NOW(), NOW());

-- 2. Khách sạn TP.HCM
INSERT INTO partners (name, slug, description, type, address, phone, email, website, established_year, avatar_url, rating, status, specialties, created_at, updated_at) VALUES
('Park Hyatt Saigon', 'park-hyatt-saigon', 'Khách sạn 5 sao xa hoa bậc nhất tại trung tâm Sài Gòn, nằm trên đường Lam Sơn, gần Nhà hát Thành phố. Thiết kế sang trọng với phong cách Đông Dương đương đại.', 'Hotel', '2 Lam Sơn, Quận 1, TP.HCM', '028-3824-1234', 'saigon.park@hyatt.com', 'https://parkhyattsaigon.com', 2005, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400', 4.9, 'Active', '["Khách sạn 5 sao", "Thiết kế Đông Dương", "Spa Xuan", "Bar Opera rooftop", "Gần Nhà hát"]', NOW(), NOW()),

('Hotel des Arts Saigon', 'hotel-des-arts-saigon', 'Khách sạn nghệ thuật 5 sao độc đáo với từng tầng được thiết kế theo phong cách nghệ sĩ nổi tiếng. Rooftop bar view toàn cảnh thành phố.', 'Hotel', '76-78 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', '028-3989-8888', 'reservation@hoteldesarts.com.vn', 'https://hoteldesarts.com.vn', 2013, 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400', 4.7, 'Active', '["Khách sạn 5 sao", "Nghệ thuật độc đáo", "Rooftop bar", "Hồ bơi vô cực", "Gần Bến Thành"]', NOW(), NOW()),

('Renaissance Riverside Hotel Saigon', 'renaissance-riverside-saigon', 'Khách sạn 5 sao ven sông Sài Gòn với view tuyệt đẹp, gần chợ Bến Thành và phố đi bộ Nguyễn Huệ. Phòng ốc hiện đại, dịch vụ chuyên nghiệp.', 'Hotel', '8-15 Tôn Đức Thắng, Quận 1, TP.HCM', '028-3822-0033', 'reservation.riverside@marriott.com', 'https://renaissance-saigon.com', 1999, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400', 4.6, 'Active', '["Khách sạn 5 sao", "View sông Sài Gòn", "Hồ bơi ngoài trời", "Gần chợ Bến Thành", "Club Lounge"]', NOW(), NOW()),

('Vinpearl Luxury Landmark 81', 'vinpearl-luxury-landmark-81', 'Khách sạn 5 sao cao nhất Việt Nam nằm trong tòa nhà Landmark 81, mang đến trải nghiệm nghỉ dưỡng đẳng cấp quốc tế với view toàn cảnh thành phố.', 'Hotel', '720A Đường Điện Biên Phủ, Bình Thạnh, TP.HCM', '028-3948-8888', 'info.landmark81@vinpearl.com', 'https://vinpearl.com/landmark81', 2018, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 4.8, 'Active', '["Khách sạn 5 sao", "Cao nhất VN", "Spa cao cấp", "View 360°", "SkyBar độc đáo"]', NOW(), NOW()),

('Liberty Central Saigon Citypoint', 'liberty-central-saigon-citypoint', 'Khách sạn 4 sao hiện đại nằm trên đường Võ Văn Kiệt với view sông đẹp, phòng rộng rãi, rooftop pool bar và nhà hàng buffet đa dạng.', 'Hotel', '59-61 Pasteur, Quận 1, TP.HCM', '028-3822-5678', 'reservation@libertycentral.com.vn', 'https://libertycentral.com.vn', 2010, 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=400', 4.5, 'Active', '["Khách sạn 4 sao", "Rooftop pool", "Buffet sáng phong phú", "Gần chợ Bến Thành", "Giá hợp lý"]', NOW(), NOW());

-- 3. Khách sạn Đà Nẵng
INSERT INTO partners (name, slug, description, type, address, phone, email, website, established_year, avatar_url, rating, status, specialties, created_at, updated_at) VALUES
('InterContinental Danang Sun Peninsula Resort', 'intercontinental-danang-sun-peninsula', 'Resort 5 sao sang trọng trên bán đảo Sơn Trà với thiết kế độc đáo của kiến trúc sư Bill Bensley, view biển tuyệt đẹp và dịch vụ đẳng cấp quốc tế.', 'Hotel', 'Bãi Bắc, Sơn Trà, Đà Nẵng', '0236-3938-888', 'reservation.danang@ihg.com', 'https://danang.intercontinental.com', 2012, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400', 5.0, 'Active', '["Resort 5 sao", "Thiết kế độc đáo", "View biển tuyệt đẹp", "Spa La Maison", "Bãi biển riêng"]', NOW(), NOW()),

('Furama Resort Danang', 'furama-resort-danang', 'Resort 5 sao bãi biển nổi tiếng tại Đà Nẵng với 198 phòng và villa, hồ bơi rộng lớn, 4 nhà hàng và quầy bar, phù hợp cho gia đình và hội nghị.', 'Hotel', '68 Hồ Xuân Hương, Bãi Biển Mỹ Khê, Đà Nẵng', '0236-3847-333', 'reservation@furamavietnam.com', 'https://furamavietnam.com', 1997, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400', 4.7, 'Active', '["Resort 5 sao", "Bãi biển Mỹ Khê", "4 nhà hàng", "Kids club", "Hồ bơi lớn"]', NOW(), NOW()),

('Pullman Danang Beach Resort', 'pullman-danang-beach-resort', 'Resort 5 sao tọa lạc ngay trên bãi biển Non Nước với 209 phòng và villa, thiết kế hiện đại, hồ bơi vô cực và nhiều hoạt động giải trí.', 'Hotel', '101 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng', '0236-3958-888', 'reservation@pullman-danang.com', 'https://pullman-danang.com', 2013, 'https://images.unsplash.com/photo-1559508551-44bff1de756b?w=400', 4.6, 'Active', '["Resort 5 sao", "Bãi biển Non Nước", "Hồ bơi vô cực", "Gần Ngũ Hành Sơn", "Buffet hải sản"]', NOW(), NOW()),

('Naman Retreat Danang', 'naman-retreat-danang', 'Resort boutique 5 sao với kiến trúc tre độc đáo, không gian yên tĩnh, dịch vụ spa và yoga chuyên sâu. Lý tưởng cho nghỉ dưỡng thư giãn.', 'Hotel', 'Trường Sa, Hòa Hải, Ngũ Hành Sơn, Đà Nẵng', '0236-3959-888', 'reservation@namanretreat.com', 'https://namanretreat.com', 2015, 'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=400', 4.8, 'Active', '["Resort 5 sao", "Kiến trúc tre", "Yoga & Spa", "Bãi biển riêng", "Yên tĩnh thư giãn"]', NOW(), NOW()),

('Danang Golden Bay Hotel', 'danang-golden-bay-hotel', 'Khách sạn 5 sao nằm trên đường biển Võ Nguyên Giáp với kiến trúc thuyền buồm độc đáo, phòng view biển, rooftop bar và hồ bơi tràn bờ.', 'Hotel', '01 Lê Văn Duyệt, Sơn Trà, Đà Nẵng', '0236-3849-999', 'reservation@dananggoldenbay.com', 'https://dananggoldenbay.com', 2018, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', 4.5, 'Active', '["Khách sạn 5 sao", "Kiến trúc thuyền buồm", "Rooftop bar", "Hồ bơi tràn bờ", "View biển đẹp"]', NOW(), NOW());

-- 4. Khách sạn Phú Quốc
INSERT INTO partners (name, slug, description, type, address, phone, email, website, established_year, avatar_url, rating, status, specialties, created_at, updated_at) VALUES
('JW Marriott Phu Quoc Emerald Bay', 'jw-marriott-phu-quoc-emerald-bay', 'Resort 5 sao sang trọng tại Bãi Khem với thiết kế lấy cảm hứng từ đại học Pháp thế kỷ 19, bãi biển riêng tuyệt đẹp và dịch vụ đẳng cấp.', 'Hotel', 'Khu Bãi Khem, An Thới, Phú Quốc, Kiên Giang', '0297-3977-999', 'reservation.phuquoc@marriott.com', 'https://jwmarriott-phuquoc.com', 2017, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', 4.9, 'Active', '["Resort 5 sao", "Bãi Khem đẹp nhất", "Thiết kế độc đáo", "Spa Chanterelle", "Kids club"]', NOW(), NOW()),

('Vinpearl Resort & Spa Phu Quoc', 'vinpearl-resort-spa-phu-quoc', 'Resort 5 sao lớn nhất Phú Quốc với hơn 700 phòng, khu vui chơi Vinpearl Land, casino và nhiều hoạt động giải trí hấp dẫn.', 'Hotel', 'Bãi Dài, Gành Dầu, Phú Quốc, Kiên Giang', '0297-3519-999', 'reservation.phuquoc@vinpearl.com', 'https://vinpearl.com/phu-quoc', 2013, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', 4.6, 'Active', '["Resort 5 sao", "Vinpearl Land", "Safari miễn phí", "Bãi Dài", "All-inclusive"]', NOW(), NOW()),

('Salinda Resort Phu Quoc Island', 'salinda-resort-phu-quoc', 'Resort 5 sao boutique tại bãi Trường với 121 phòng, thiết kế sang trọng, hồ bơi vô cực view biển và dịch vụ tận tâm.', 'Hotel', 'Bãi Trường, Dương Tơ, Phú Quốc, Kiên Giang', '0297-3847-999', 'reservation@salindaresort.com', 'https://salindaresort.com', 2014, 'https://images.unsplash.com/photo-1561409037-c7be81613c1f?w=400', 4.7, 'Active', '["Resort 5 sao", "Bãi Trường", "Hồ bơi vô cực", "Spa đẳng cấp", "Yên tĩnh"]', NOW(), NOW()),

('Fusion Resort Phu Quoc', 'fusion-resort-phu-quoc', 'Resort 5 sao all-spa-inclusive với dịch vụ spa không giới hạn, bãi biển riêng tuyệt đẹp, phòng pool villa rộng rãi và ẩm thực đa dạng.', 'Hotel', 'Đường Bãi Dài, Gành Dầu, Phú Quốc, Kiên Giang', '0297-6268-888', 'reservation@fusionresort-phuquoc.com', 'https://fusionresort-phuquoc.com', 2016, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', 4.8, 'Active', '["Resort 5 sao", "All-spa-inclusive", "Spa không giới hạn", "Pool villa", "Bãi Dài"]', NOW(), NOW());

-- ================================================
-- NHÀ HÀNG (Restaurants)
-- ================================================

-- 1. Nhà hàng Hà Nội
INSERT INTO partners (name, slug, description, type, address, phone, email, website, established_year, avatar_url, rating, status, specialties, created_at, updated_at) VALUES
('Ngon Villa Restaurant', 'ngon-villa-restaurant', 'Nhà hàng Việt Nam truyền thống nằm trong biệt thự Pháp cổ, phục vụ hơn 60 món ăn đặc sản các miền trong không gian xanh mát, thân thiện.', 'Restaurant', '10 Phan Bội Châu, Hoàn Kiếm, Hà Nội', '024-3942-8162', 'info@ngonvilla.com', 'https://ngonvilla.com', 2010, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', 4.7, 'Active', '["Ẩm thực Việt", "Biệt thự cổ", "60+ món ăn", "Không gian xanh", "Giá hợp lý"]', NOW(), NOW()),

('La Verticale Restaurant', 'la-verticale-restaurant', 'Nhà hàng fine dining Pháp đạt chuẩn Michelin tại Hà Nội, phục vụ ẩm thực Pháp hiện đại trong không gian sang trọng, phù hợp cho dịp đặc biệt.', 'Restaurant', '19 Ngô Văn Sở, Hoàn Kiếm, Hà Nội', '024-3944-6317', 'reservation@verticale-hanoi.com', 'https://verticale-hanoi.com', 1999, 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=400', 4.9, 'Active', '["Fine dining Pháp", "Chuẩn Michelin", "Set menu cao cấp", "Wine pairing", "Không gian sang trọng"]', NOW(), NOW()),

('Cau Go Vietnamese Cuisine Restaurant', 'cau-go-vietnamese-cuisine', 'Nhà hàng Việt Nam hiện đại 4 tầng view Hồ Hoàn Kiếm và chùa Một Cột, phục vụ món ăn Việt sáng tạo và truyền thống với chất lượng cao.', 'Restaurant', '73 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', '024-3926-0808', 'info@caugorestaurant.com', 'https://caugorestaurant.com', 2009, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', 4.6, 'Active', '["Ẩm thực Việt", "View Hồ Hoàn Kiếm", "4 tầng", "Món sáng tạo", "Không gian đẹp"]', NOW(), NOW()),

('Cha Ca Thang Long', 'cha-ca-thang-long', 'Nhà hàng chuyên về món chả cá Lã Vọng truyền thống Hà Nội, hơn 130 năm lịch sử, phục vụ món ăn đặc sản chính gốc.', 'Restaurant', '19-21-31 Đường Thành, Hoàn Kiếm, Hà Nội', '024-3824-5115', 'info@chacathanglong.com', 'https://chacathanglong.com', 1871, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400', 4.5, 'Active', '["Chả cá Lã Vọng", "130+ năm", "Truyền thống", "Món đặc sản HN", "Chính gốc"]', NOW(), NOW()),

('Sen Tay Ho Restaurant', 'sen-tay-ho-restaurant', 'Nhà hàng buffet chay cao cấp tại Tây Hồ với hơn 100 món chay đa dạng, không gian yên tĩnh, view hồ đẹp, phù hợp cho gia đình.', 'Restaurant', '663 Lạc Long Quân, Tây Hồ, Hà Nội', '024-3718-2386', 'info@sentayho.com', 'https://sentayho.com', 2005, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', 4.6, 'Active', '["Buffet chay", "100+ món", "View Tây Hồ", "Không gian yên tĩnh", "Giá hợp lý"]', NOW(), NOW());

-- 2. Nhà hàng TP.HCM
INSERT INTO partners (name, slug, description, type, address, phone, email, website, established_year, avatar_url, rating, status, specialties, created_at, updated_at) VALUES
('Noir Dining in the Dark', 'noir-dining-in-the-dark', 'Nhà hàng độc đáo duy nhất tại Việt Nam với trải nghiệm ăn uống trong bóng tối hoàn toàn, được phục vụ bởi nhân viên khiếm thị chuyên nghiệp.', 'Restaurant', '178 Hai Bà Trưng, Quận 3, TP.HCM', '028-3829-7115', 'reservation@noir-restaurant.com', 'https://noir-restaurant.com', 2014, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', 4.8, 'Active', '["Dining in the dark", "Trải nghiệm độc đáo", "Nhân viên khiếm thị", "Set menu surprise", "Giá trị ý nghĩa"]', NOW(), NOW()),

('The Deck Saigon', 'the-deck-saigon', 'Nhà hàng ven sông Sài Gòn tại Thảo Điền với không gian mở, view sông đẹp, phục vụ món Âu - Á fusion và cocktail sáng tạo.', 'Restaurant', '38 Nguyễn Ư Dĩ, Thảo Điền, Quận 2, TP.HCM', '028-3744-6632', 'info@thedecksaigon.com', 'https://thedecksaigon.com', 2008, 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=400', 4.7, 'Active', '["Ẩm thực Fusion", "View sông Sài Gòn", "Không gian mở", "Cocktail bar", "Khu Thảo Điền"]', NOW(), NOW()),

('Hum Vegetarian Restaurant', 'hum-vegetarian-restaurant', 'Nhà hàng chay cao cấp với thiết kế hiện đại, phục vụ ẩm thực chay Á - Âu sáng tạo, healthy và thân thiện với môi trường.', 'Restaurant', '32 Võ Văn Tần, Quận 3, TP.HCM', '028-3930-3819', 'info@hum-vegetarian.com', 'https://hum-vegetarian.com', 2010, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 4.6, 'Active', '["Ẩm thực chay", "Healthy food", "Thiết kế đẹp", "Á - Âu fusion", "Eco-friendly"]', NOW(), NOW()),

('Nha Hang Ngon 138', 'nha-hang-ngon-138', 'Nhà hàng Việt Nam truyền thống nổi tiếng tại Sài Gòn với hơn 200 món ăn các miền, không gian vườn xanh mát, phù hợp cho đoàn và gia đình.', 'Restaurant', '138 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM', '028-3825-7179', 'info@quananngon.com.vn', 'https://quananngon.com.vn', 2002, 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400', 4.5, 'Active', '["Ẩm thực Việt", "200+ món ăn", "Không gian vườn", "Phù hợp đoàn", "Giá hợp lý"]', NOW(), NOW()),

('Pizza 4Ps Saigon', 'pizza-4ps-saigon', 'Nhà hàng pizza Nhật Bản nổi tiếng tại Sài Gòn với pizza nướng lò củi, burrata tự làm, không gian đẹp và dịch vụ chuyên nghiệp.', 'Restaurant', '8/15 Lê Thánh Tôn, Quận 1, TP.HCM', '028-3822-0500', 'reservation@pizza4ps.com', 'https://pizza4ps.com', 2011, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', 4.7, 'Active', '["Pizza Nhật Bản", "Lò củi", "Burrata tự làm", "Thiết kế đẹp", "Dịch vụ tốt"]', NOW(), NOW());

-- 3. Nhà hàng Đà Nẵng
INSERT INTO partners (name, slug, description, type, address, phone, email, website, established_year, avatar_url, rating, status, specialties, created_at, updated_at) VALUES
('Waterfront Restaurant Danang', 'waterfront-restaurant-danang', 'Nhà hàng hải sản tươi sống và BBQ tại bãi biển Mỹ Khê, không gian mở view biển đẹp, phục vụ hải sản tươi ngon với giá hợp lý.', 'Restaurant', '150-152 Bạch Đằng, Sơn Trà, Đà Nẵng', '0236-3959-668', 'info@waterfront-danang.com', 'https://waterfront-danang.com', 2012, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', 4.6, 'Active', '["Hải sản tươi sống", "BBQ", "View biển Mỹ Khê", "Không gian mở", "Giá hợp lý"]', NOW(), NOW()),

('Madame Lan Restaurant', 'madame-lan-restaurant', 'Nhà hàng ẩm thực Việt Nam truyền thống trong biệt thự Pháp cổ, phục vụ các món ăn đặc sản miền Trung trong không gian vintage đẹp.', 'Restaurant', '4 Bạch Đằng, Hải Châu, Đà Nẵng', '0236-3847-400', 'reservation@madamelan.com', 'https://madamelan.com', 2014, 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400', 4.7, 'Active', '["Ẩm thực miền Trung", "Biệt thự Pháp", "Không gian vintage", "Món đặc sản", "View sông Hàn"]', NOW(), NOW()),

('A Di Da Vegetarian Restaurant', 'a-di-da-vegetarian', 'Nhà hàng chay lâu đời tại Đà Nẵng với buffet chay phong phú hơn 70 món, giá rẻ, không gian rộng rãi, phù hợp cho gia đình.', 'Restaurant', '207 Phan Châu Trinh, Hải Châu, Đà Nẵng', '0236-3565-755', 'info@adida-danang.com', 'https://adida-danang.com', 2000, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 4.4, 'Active', '["Buffet chay", "70+ món", "Giá rẻ", "Rộng rãi", "Lâu đời"]', NOW(), NOW()),

('Bé Mặn Seafood Restaurant', 'be-man-seafood', 'Nhà hàng hải sản nổi tiếng tại Đà Nẵng với hải sản tươi sống, đặc biệt là ghẹ và tôm hùm, không gian hiện đại, giá cả hợp lý.', 'Restaurant', '93 Võ Nguyên Giáp, Ngũ Hành Sơn, Đà Nẵng', '0236-3959-339', 'info@beman-danang.com', 'https://beman-danang.com', 2015, 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400', 4.5, 'Active', '["Hải sản tươi sống", "Ghẹ & Tôm hùm", "Giá hợp lý", "Không gian hiện đại", "Gần biển"]', NOW(), NOW());

-- 4. Nhà hàng Phú Quốc
INSERT INTO partners (name, slug, description, type, address, phone, email, website, established_year, avatar_url, rating, status, specialties, created_at, updated_at) VALUES
('The Spice House Restaurant', 'the-spice-house-phu-quoc', 'Nhà hàng Ấn Độ chính gốc tại Phú Quốc, phục vụ các món curry, tandoori và naan truyền thống, đầu bếp người Ấn, không gian ấm cúng.', 'Restaurant', 'Khu Bãi Trường, Dương Tơ, Phú Quốc', '0297-6225-555', 'info@spicehouse-phuquoc.com', 'https://spicehouse-phuquoc.com', 2016, 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400', 4.6, 'Active', '["Ẩm thực Ấn Độ", "Đầu bếp Ấn", "Curry & Tandoori", "Naan tự làm", "Chính gốc"]', NOW(), NOW()),

('Crab House Phu Quoc', 'crab-house-phu-quoc', 'Nhà hàng hải sản chuyên về cua và ghẹ tươi sống tại chợ đêm Phú Quốc, không gian mở, view biển, giá tốt và phần ăn nhiều.', 'Restaurant', 'Chợ đêm Phú Quốc, Dương Đông, Phú Quốc', '0297-3994-998', 'info@crabhouse-phuquoc.com', 'https://crabhouse-phuquoc.com', 2014, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400', 4.5, 'Active', '["Hải sản", "Cua & Ghẹ tươi", "Chợ đêm", "View biển", "Giá tốt"]', NOW(), NOW()),

('Rory\'s Beach Bar', 'rorys-beach-bar-phu-quoc', 'Beach bar & restaurant tại bãi biển Ông Lang phục vụ BBQ hải sản, cocktail và âm nhạc chill, không gian bãi biển thư giãn.', 'Restaurant', 'Bãi Ông Lang, Cửa Dương, Phú Quốc', '0297-3998-196', 'info@rorysbeachbar.com', 'https://rorysbeachbar.com', 2012, 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=400', 4.6, 'Active', '["Beach bar", "BBQ hải sản", "Cocktail", "Live music", "Bãi Ông Lang"]', NOW(), NOW());

-- ================================================
-- PARTNER IMAGES
-- ================================================

-- Images for Sofitel Legend Metropole Hanoi
INSERT INTO partner_images (partner_id, image_url, image_type, alt_text, display_order) VALUES
(1, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200', 'cover', 'Sofitel Legend Metropole Hanoi - Exterior', 0),
(1, 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', 'logo', 'Sofitel Legend Metropole Hanoi - Logo', 0),
(1, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 'gallery', 'Sofitel Legend Metropole Hanoi - Pool', 1),
(1, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800', 'gallery', 'Sofitel Legend Metropole Hanoi - Room', 2);

-- Images for JW Marriott Hotel Hanoi
INSERT INTO partner_images (partner_id, image_url, image_type, alt_text, display_order) VALUES
(2, 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200', 'cover', 'JW Marriott Hotel Hanoi - Exterior', 0),
(2, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', 'logo', 'JW Marriott Hotel Hanoi - Logo', 0);

-- Images for Park Hyatt Saigon
INSERT INTO partner_images (partner_id, image_url, image_type, alt_text, display_order) VALUES
(6, 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200', 'cover', 'Park Hyatt Saigon - Exterior', 0),
(6, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400', 'logo', 'Park Hyatt Saigon - Logo', 0);

-- Images for InterContinental Danang
INSERT INTO partner_images (partner_id, image_url, image_type, alt_text, display_order) VALUES
(11, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200', 'cover', 'InterContinental Danang - Beach View', 0),
(11, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400', 'logo', 'InterContinental Danang - Logo', 0);

-- Images for JW Marriott Phu Quoc
INSERT INTO partner_images (partner_id, image_url, image_type, alt_text, display_order) VALUES
(16, 'https://images.unsplash.com/photo-1559508551-44bff1de756b?w=1200', 'cover', 'JW Marriott Phu Quoc - Aerial View', 0),
(16, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', 'logo', 'JW Marriott Phu Quoc - Logo', 0);

-- ================================================
-- SUMMARY
-- ================================================
-- Total Partners: 38
--   - Hotels: 19 (Hà Nội: 5, TP.HCM: 5, Đà Nẵng: 5, Phú Quốc: 4)
--   - Restaurants: 19 (Hà Nội: 5, TP.HCM: 5, Đà Nẵng: 4, Phú Quốc: 3)
-- All partners: ACTIVE status
-- Rating range: 4.4 - 5.0
-- ================================================

SELECT 'Partner data inserted successfully!' AS Status,
       (SELECT COUNT(*) FROM partners WHERE type = 'Hotel') AS Hotels,
       (SELECT COUNT(*) FROM partners WHERE type = 'Restaurant') AS Restaurants,
       (SELECT COUNT(*) FROM partners) AS Total_Partners;

