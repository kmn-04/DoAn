-- Sample data will be automatically loaded when Spring Boot starts
-- Only inserts if data doesn't exist (using INSERT IGNORE)

-- Tạo admin mặc định (password: admin123) - có thể login bằng email hoặc phone
INSERT IGNORE INTO users (username, email, phone, password, full_name, role, is_active, email_verified) VALUES 
('admin', 'admin@tourism.com', '0909999999', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lXZ2hPymu5ws2QLiq', 'System Administrator', 'ADMIN', true, true);

-- Tạo staff mẫu (password: staff123)  
INSERT IGNORE INTO users (username, email, password, full_name, phone, address, role, is_active) VALUES 
('staff1', 'staff@example.com', '$2a$10$8ZYJqWf5VwgMZI4XpCr7RO8GZQr9KhQh6k5GjUABrCh7IwSTFd5gG', 'Nguyễn Văn A', '0901234567', '123 Đường ABC, Quận 1, TP.HCM', 'STAFF', true);

-- Tạo user thường mẫu (password: user123)
INSERT IGNORE INTO users (username, email, password, full_name, phone, address, role, is_active) VALUES 
('user1', 'user@example.com', '$2a$10$9ZYJqWf5VwgMZI4XpCr7RO8GZQr9KhQh6k5GjUABrCh7IwSTFd5gH', 'Trần Thị B', '0987654321', '456 Đường XYZ, Quận 2, TP.HCM', 'USER', true);

-- Tạo user demo Google (sẽ được link khi test social login)
INSERT IGNORE INTO users (username, email, password, full_name, role, is_active, google_id) VALUES 
('googledemo', 'user@gmail.com', '$2a$10$9ZYJqWf5VwgMZI4XpCr7RO8GZQr9KhQh6k5GjUABrCh7IwSTFd5gH', 'Google User', 'USER', true, 'google_user_123');

-- Tạo user demo Facebook (sẽ được link khi test social login)
INSERT IGNORE INTO users (username, email, password, full_name, role, is_active, facebook_id) VALUES 
('facebookdemo', 'user@facebook.com', '$2a$10$9ZYJqWf5VwgMZI4XpCr7RO8GZQr9KhQh6k5GjUABrCh7IwSTFd5gH', 'Facebook User', 'USER', true, 'facebook_user_123');

-- ===========================
-- PARTNERS SAMPLE DATA
-- ===========================

-- Khách sạn
INSERT IGNORE INTO partners (id, name, type, avatar_url, description, address, phone, email, website, rating, price_range, is_active) VALUES 
(1, 'Grand Hotel Saigon', 'HOTEL', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400', 'Khách sạn 5 sao sang trọng tại trung tâm thành phố với đầy đủ tiện nghi cao cấp và dịch vụ chuyên nghiệp', '123 Nguyễn Huệ, Quận 1, TP.HCM', '028-1234-5678', 'info@grandhotelsaigon.com', 'https://grandhotelsaigon.com', 5, 'LUXURY', true),
(2, 'Riverside Resort Da Lat', 'HOTEL', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', 'Resort nghỉ dưỡng bên bờ hồ với không gian yên tĩnh, thiên nhiên tươi mát và không khí trong lành', '456 Hồ Xuân Hương, Đà Lạt, Lâm Đồng', '0263-987-6543', 'booking@riversidedalat.com', 'https://riversidedalat.com', 4, 'MID_RANGE', true),
(3, 'Boutique Hotel Hoi An', 'HOTEL', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', 'Khách sạn boutique với kiến trúc cổ điển, nằm trong khu phố cổ Hội An', '789 Nguyễn Thái Học, Hội An, Quảng Nam', '0235-123-4567', 'contact@boutiquehoian.com', 'https://boutiquehoian.com', 4, 'MID_RANGE', true),
(4, 'Beach Resort Nha Trang', 'HOTEL', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 'Resort biển với view tuyệt đẹp và các hoạt động thể thao dưới nước', '321 Trần Phú, Nha Trang, Khánh Hòa', '0258-345-6789', 'info@beachresortnt.com', 'https://beachresortnt.com', 5, 'LUXURY', true),
(5, 'Budget Inn Backpacker', 'HOTEL', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400', 'Nhà nghỉ bình dân dành cho du khách ba lô với giá cả phải chăng', '654 Bùi Viện, Quận 1, TP.HCM', '028-987-6543', 'info@budgetinn.vn', NULL, 3, 'BUDGET', true);

-- Nhà hàng
INSERT IGNORE INTO partners (id, name, type, avatar_url, description, address, phone, email, website, rating, price_range, is_active) VALUES 
(6, 'Nhà hàng Sài Gòn Xưa', 'RESTAURANT', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', 'Nhà hàng chuyên về ẩm thực truyền thống Việt Nam với không gian cổ kính và phong cách xưa', '789 Lê Lợi, Quận 1, TP.HCM', '028-2345-6789', 'contact@saigonxua.vn', 'https://saigonxua.vn', 4, 'MID_RANGE', true),
(7, 'Fine Dining Restaurant', 'RESTAURANT', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', 'Nhà hàng cao cấp với đầu bếp quốc tế và menu fusion độc đáo', '456 Đồng Khởi, Quận 1, TP.HCM', '028-3456-7890', 'reservation@finedining.vn', 'https://finedining.vn', 5, 'LUXURY', true),
(8, 'Quán Ăn Bình Dân', 'RESTAURANT', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', 'Quán ăn bình dân với các món ăn đường phố ngon, giá cả phải chăng và phục vụ nhanh', '321 Nguyễn Thái Học, Quận 1, TP.HCM', '028-4567-8901', NULL, NULL, 3, 'BUDGET', true),
(9, 'Seafood Paradise', 'RESTAURANT', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 'Nhà hàng hải sản tươi sống với view biển tuyệt đẹp', '123 Trần Phú, Nha Trang, Khánh Hòa', '0258-567-8901', 'info@seafoodparadise.vn', 'https://seafoodparadise.vn', 4, 'MID_RANGE', true),
(10, 'Vegetarian Garden', 'RESTAURANT', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'Nhà hàng chay với thực đơn đa dạng và không gian xanh mát', '987 Cách Mạng Tháng 8, Quận 3, TP.HCM', '028-678-9012', 'contact@vegetariangarden.vn', 'https://vegetariangarden.vn', 4, 'MID_RANGE', true);

-- Vận chuyển
INSERT IGNORE INTO partners (id, name, type, avatar_url, description, address, phone, email, website, rating, price_range, is_active) VALUES 
(11, 'VIP Transport Service', 'TRANSPORT', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400', 'Dịch vụ vận chuyển cao cấp với đội xe sang trọng và tài xế chuyên nghiệp, phục vụ 24/7', '654 Cách Mạng Tháng 8, Quận 3, TP.HCM', '028-4567-8901', 'info@viptransport.vn', 'https://viptransport.vn', 5, 'LUXURY', true),
(12, 'Xe Khách Phương Trang', 'TRANSPORT', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400', 'Công ty vận tải hành khách uy tín với mạng lưới rộng khắp cả nước', '987 Nguyễn Văn Linh, Quận 7, TP.HCM', '028-5678-9012', 'cskh@phuongtrang.vn', 'https://phuongtrang.vn', 4, 'BUDGET', true),
(13, 'Motorbike Rental', 'TRANSPORT', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', 'Dịch vụ cho thuê xe máy với đa dạng loại xe và giá cả hợp lý', '123 Lê Lai, Quận 1, TP.HCM', '028-789-0123', 'rental@motorbike.vn', 'https://motorbike.vn', 3, 'BUDGET', true),
(14, 'Airport Shuttle', 'TRANSPORT', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400', 'Dịch vụ đưa đón sân bay chuyên nghiệp, đúng giờ và an toàn', '456 Trường Sơn, Quận Tân Bình, TP.HCM', '028-890-1234', 'booking@airportshuttle.vn', 'https://airportshuttle.vn', 4, 'MID_RANGE', true),
(15, 'Limousine Service', 'TRANSPORT', 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400', 'Dịch vụ limousine sang trọng cho các chuyến đi VIP', '789 Nguyễn Huệ, Quận 1, TP.HCM', '028-901-2345', 'vip@limousine.vn', 'https://limousine.vn', 5, 'LUXURY', true);

-- Gallery images for partners
INSERT IGNORE INTO partner_gallery (partner_id, image_url) VALUES
-- Grand Hotel Saigon
(1, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'),
(1, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'),
(1, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'),
-- Riverside Resort Da Lat
(2, 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=800'),
(2, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'),
-- Fine Dining Restaurant
(7, 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'),
(7, 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800'),
-- VIP Transport Service
(11, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'),
(11, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800');

-- Amenities for partners
INSERT IGNORE INTO partner_amenities (partner_id, amenity) VALUES
-- Grand Hotel Saigon
(1, 'Wifi miễn phí'), (1, 'Bể bơi'), (1, 'Phòng gym'), (1, 'Spa'), (1, 'Nhà hàng'), (1, 'Bar'), (1, 'Dịch vụ phòng 24/7'), (1, 'Bãi đậu xe'), (1, 'Trung tâm thương mại'), (1, 'Phòng hội nghị'),
-- Riverside Resort Da Lat
(2, 'Wifi miễn phí'), (2, 'Bể bơi'), (2, 'Nhà hàng'), (2, 'Khu vườn'), (2, 'Bãi đậu xe'), (2, 'Dịch vụ giặt ủi'), (2, 'Sân tennis'), (2, 'Khu vui chơi trẻ em'),
-- Boutique Hotel Hoi An
(3, 'Wifi miễn phí'), (3, 'Điều hòa'), (3, 'Bãi đậu xe'), (3, 'Tour du lịch'), (3, 'Cho thuê xe đạp'), (3, 'Phòng gia đình'),
-- Beach Resort Nha Trang
(4, 'Wifi miễn phí'), (4, 'Bể bơi'), (4, 'Bãi biển riêng'), (4, 'Thể thao nước'), (4, 'Spa'), (4, 'Nhà hàng'), (4, 'Bar bãi biển'), (4, 'Phòng gym'),
-- Budget Inn Backpacker
(5, 'Wifi miễn phí'), (5, 'Điều hòa'), (5, 'Bếp chung'), (5, 'Máy giặt'), (5, 'Phòng tắm chung'),
-- Nhà hàng Sài Gòn Xưa
(6, 'Wifi miễn phí'), (6, 'Điều hòa'), (6, 'Không gian riêng tư'), (6, 'Bãi đậu xe'), (6, 'Nhạc truyền thống'), (6, 'Phục vụ tiệc'),
-- Fine Dining Restaurant
(7, 'Wifi miễn phí'), (7, 'Điều hòa'), (7, 'Phòng VIP'), (7, 'Sommelier'), (7, 'Valet parking'), (7, 'Live music'),
-- Quán Ăn Bình Dân
(8, 'Giá cả phải chăng'), (8, 'Phục vụ nhanh'), (8, 'Món ăn đường phố'), (8, 'Mở cửa muộn'),
-- Seafood Paradise
(9, 'Wifi miễn phí'), (9, 'View biển'), (9, 'Hải sản tươi sống'), (9, 'Bãi đậu xe'), (9, 'Phòng riêng'),
-- Vegetarian Garden
(10, 'Wifi miễn phí'), (10, 'Không gian xanh'), (10, 'Thực phẩm organic'), (10, 'Bãi đậu xe'), (10, 'Không khói thuốc'),
-- VIP Transport Service
(11, 'Xe sang'), (11, 'Tài xế chuyên nghiệp'), (11, 'Wifi trên xe'), (11, 'Nước uống miễn phí'), (11, 'Điều hòa'), (11, 'Dịch vụ 24/7'), (11, 'GPS tracking'),
-- Xe Khách Phương Trang
(12, 'Ghế nằm'), (12, 'Điều hòa'), (12, 'Wifi'), (12, 'Toilet trên xe'), (12, 'Dịch vụ 24/7'), (12, 'Bảo hiểm'),
-- Motorbike Rental
(13, 'Xe đa dạng'), (13, 'Giá cả hợp lý'), (13, 'Bảo hiểm'), (13, 'Hướng dẫn sử dụng'), (13, 'Phụ tùng thay thế'),
-- Airport Shuttle
(14, 'Đúng giờ'), (14, 'Điều hòa'), (14, 'Wifi'), (14, 'Hành lý miễn phí'), (14, 'Đặt trước online'), (14, 'Thanh toán linh hoạt'),
-- Limousine Service
(15, 'Xe limousine'), (15, 'Tài xế chuyên nghiệp'), (15, 'Champagne miễn phí'), (15, 'Âm thanh cao cấp'), (15, 'Wifi'), (15, 'Dịch vụ VIP');

-- ===========================
-- TOURS SAMPLE DATA
-- ===========================

-- Insert sample tours với format mới
INSERT IGNORE INTO tours (
    id, title, short_description, description, location,
    price, discounted_price, duration_days, duration_nights, max_participants, 
    min_participants, difficulty_level, status, is_featured, gallery_images,
    included_services, category_id, target_audience, created_at, updated_at
) VALUES 
-- Tour 1: Hạ Long Bay
(1, 'Du thuyền Hạ Long Bay 2 ngày 1 đêm', 
'Khám phá vẻ đẹp kỳ vĩ của vịnh Hạ Long với du thuyền sang trọng',
'Chuyến du lịch 2 ngày 1 đêm tại vịnh Hạ Long sẽ mang đến cho bạn những trải nghiệm tuyệt vời. Bạn sẽ được ngắm nhìn hàng nghìn hòn đảo đá vôi kỳ vĩ, thăm quan động Thiên Cung, làng chài Cửa Vạn, và thưởng thức hải sản tươi ngon.',
'Hạ Long, Quảng Ninh',
2500000, 2200000, 2, 1, 20, 4, 'EASY', 'ACTIVE', true,
'["https://images.unsplash.com/photo-1528127269322-539801943592?w=400", "https://images.unsplash.com/photo-1509650460351-3c78c0dcfce4?w=400", "https://images.unsplash.com/photo-1580654712603-eb43273aff33?w=400"]',
'Xe đưa đón, Du thuyền 5 sao, Bữa ăn theo chương trình, Hướng dẫn viên, Bảo hiểm du lịch',
1, 'FAMILY', NOW(), NOW()),

-- Tour 2: Sapa Trekking
(2, 'Sapa Trekking 3 ngày 2 đêm - Fansipan', 
'Chinh phục nóc nhà Đông Dương và khám phá văn hóa dân tộc',
'Hành trình 3 ngày 2 đêm tại Sapa sẽ đưa bạn đến với những thửa ruộng bậc thang tuyệt đẹp, các bản làng dân tộc thiểu số đặc sắc. Bạn sẽ có cơ hội chinh phục đỉnh Fansipan bằng cáp treo hiện đại.',
'Sapa, Lào Cai',
1800000, 1500000, 3, 2, 15, 6, 'MEDIUM', 'ACTIVE', true,
'["https://images.unsplash.com/photo-1539650116574-75c0c6d73469?w=400", "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400", "https://images.unsplash.com/photo-1553150195-8383e3743b87?w=400"]',
'Xe đưa đón, Khách sạn 3 sao, Vé cáp treo Fansipan, Bữa ăn theo chương trình, Hướng dẫn viên địa phương',
2, 'FRIENDS', NOW(), NOW()),

-- Tour 3: Phú Quốc Beach
(3, 'Phú Quốc 4 ngày 3 đêm - Thiên đường biển đảo', 
'Thư giãn tại bãi biển đẹp nhất Việt Nam với resort 5 sao',
'Kỳ nghỉ 4 ngày 3 đêm tại đảo ngọc Phú Quốc sẽ mang đến cho bạn những giây phút thư giãn tuyệt vời. Bạn sẽ được tắm biển tại bãi Sao, bãi Kem với làn nước trong xanh, cát trắng mịn.',
'Phú Quốc, Kiên Giang',
4200000, 3800000, 4, 3, 25, 2, 'EASY', 'ACTIVE', true,
'["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400", "https://images.unsplash.com/photo-1571801208806-fe5f129e2c4d?w=400"]',
'Vé máy bay khứ hồi, Resort 5 sao, Xe đưa đón sân bay, Bữa sáng hằng ngày, Tour 4 đảo, Bảo hiểm du lịch',
3, 'COUPLE', NOW(), NOW()),

-- Tour 4: Đà Lạt Romantic
(4, 'Đà Lạt 3 ngày 2 đêm - Thành phố ngàn hoa', 
'Lãng mạn tại thành phố mùa xuân với khí hậu mát mẻ',
'Chuyến du lịch 3 ngày 2 đêm tại Đà Lạt sẽ đưa bạn đến với thành phố ngàn hoa thơ mộng. Thăm quan thác Elephant, hồ Xuân Hương, chùa Linh Phước, làng hoa Vạn Thành.',
'Đà Lạt, Lâm Đồng',
1600000, 1400000, 3, 2, 18, 4, 'EASY', 'ACTIVE', false,
'["https://images.unsplash.com/photo-1578271887552-5ac3a72752d2?w=400", "https://images.unsplash.com/photo-1562179136-4663191ca4bb?w=400", "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400"]',
'Xe đưa đón, Khách sạn 3 sao, Bữa ăn theo chương trình, Hướng dẫn viên, Vé tham quan',
1, 'COUPLE', NOW(), NOW()),

-- Tour 5: Ninh Bình Adventure
(5, 'Ninh Bình 2 ngày 1 đêm - Hoa Lư Tam Cốc', 
'Khám phá vẻ đẹp hùng vĩ của vịnh Hạ Long trên cạn',
'Tour 2 ngày 1 đêm tại Ninh Bình đưa bạn khám phá cố đô Hoa Lư, du thuyền sông Ngô Đồng qua Tam Cốc - Bích Động, leo núi Mua để ngắm toàn cảnh.',
'Ninh Bình',
1200000, 1000000, 2, 1, 20, 6, 'MEDIUM', 'ACTIVE', false,
'["https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400", "https://images.unsplash.com/photo-1583919098097-6fa7ac5a7a32?w=400", "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400"]',
'Xe đưa đón, Khách sạn 3 sao, Thuyền thăm Tam Cốc, Bữa ăn theo chương trình, Vé tham quan, Hướng dẫn viên',
2, 'FAMILY', NOW(), NOW()),

-- Tour 6: Mekong Delta
(6, 'Miền Tây 2 ngày 1 đêm - Chợ nổi Cái Răng', 
'Trải nghiệm cuộc sống miệt vườn và chợ nổi sông nước',
'Hành trình 2 ngày 1 đêm khám phá miền Tây Nam Bộ với chợ nổi Cái Răng, vườn trái cây, làng nghề truyền thống.',
'Cần Thơ, An Giang',
1100000, 950000, 2, 1, 16, 8, 'EASY', 'ACTIVE', false,
'["https://images.unsplash.com/photo-1571057887532-7c2d5e8f2b9d?w=400", "https://images.unsplash.com/photo-1608736869737-8c366cf892c5?w=400", "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400"]',
'Xe đưa đón, Khách sạn 2 sao, Thuyền thăm chợ nổi, Bữa ăn đặc sản miền Tây, Hướng dẫn viên',
4, 'FAMILY', NOW(), NOW()),

-- Tour 7: Hội An Ancient Town
(7, 'Hội An 3 ngày 2 đêm - Phố cổ và Mỹ Sơn', 
'Khám phá di sản văn hóa thế giới và ẩm thực đặc sắc',
'Tour 3 ngày 2 đêm tại Hội An đưa bạn khám phá phố cổ với kiến trúc độc đáo, đền tháp Mỹ Sơn của người Chăm, làng rau Trà Quế.',
'Hội An, Quảng Nam',
2000000, 1750000, 3, 2, 20, 4, 'EASY', 'ACTIVE', true,
'["https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400", "https://images.unsplash.com/photo-1582719471009-5a9e4bdd7af3?w=400", "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400"]',
'Xe đưa đón, Khách sạn 4 sao, Vé tham quan Mỹ Sơn, Xe đạp tham quan phố cổ, Bữa ăn theo chương trình, Hướng dẫn viên',
5, 'FAMILY', NOW(), NOW()),

-- Tour 8: Cao Bang Falls  
(8, 'Cao Bằng 3 ngày 2 đêm - Thác Bản Giốc', 
'Chiêm ngưỡng thác nước hùng vĩ biên giới Việt - Trung',
'Chuyến du lịch 3 ngày 2 đêm tại Cao Bằng đưa bạn đến thác Bản Giốc - thác nước lớn nhất Việt Nam, động Ngườm Ngao kỳ vĩ.',
'Cao Bằng',
1700000, 1500000, 3, 2, 12, 6, 'MEDIUM', 'ACTIVE', false,
'["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400"]',
'Xe đưa đón, Khách sạn 2 sao, Bữa ăn theo chương trình, Vé tham quan, Thuyền tham quan thác, Hướng dẫn viên',
2, 'FRIENDS', NOW(), NOW());

-- Insert sample tour itineraries
INSERT IGNORE INTO tour_itinerary (
    id, tour_id, day_number, title, description, created_at, updated_at
) VALUES 
-- Itinerary for Tour 1: Hạ Long Bay
(1, 1, 1, 'Hà Nội - Hạ Long - Du thuyền', 
'Khởi hành từ Hà Nội, di chuyển đến Hạ Long, check-in du thuyền và bắt đầu hành trình khám phá vịnh. 8:00 - Đón khách tại Hà Nội, 12:00 - Đến Hạ Long, 13:00 - Ăn trưa trên du thuyền, 15:00 - Thăm động Thiên Cung, 17:00 - Ngắm hoàng hôn, 19:00 - Ăn tối và nghỉ ngơi',
NOW(), NOW()),

(2, 1, 2, 'Hạ Long - Làng chài Cửa Vạn - Hà Nội', 
'Thăm làng chài, tắm biển và trở về Hà Nội. 7:00 - Ăn sáng, 8:30 - Thăm làng chài Cửa Vạn, 10:00 - Tắm biển tại bãi Titov, 11:30 - Trả phòng, ăn trưa, 14:00 - Về Hà Nội, 18:00 - Kết thúc tour',
NOW(), NOW()),

-- Itinerary for Tour 2: Sapa
(3, 2, 1, 'Hà Nội - Sapa - Fansipan', 
'Di chuyển đến Sapa và chinh phục đỉnh Fansipan. 6:00 - Khởi hành từ Hà Nội, 11:00 - Đến Sapa, 13:00 - Ăn trưa đặc sản Sapa, 14:30 - Lên cáp treo Fansipan, 17:00 - Về khách sạn, 19:00 - Ăn tối và khám phá chợ đêm',
NOW(), NOW()),

(4, 2, 2, 'Sapa - Bản Cát Cát - Ta Phìn', 
'Trekking khám phá các bản làng dân tộc. 8:00 - Ăn sáng, 9:00 - Trekking bản Cát Cát, 12:00 - Ăn trưa tại bản, 14:00 - Thăm bản Ta Phìn, 16:30 - Về Sapa nghỉ ngơi, 19:00 - Ăn tối',
NOW(), NOW()),

(5, 2, 3, 'Sapa - Hà Nội', 
'Tham quan và trở về Hà Nội. 8:00 - Ăn sáng, 9:00 - Thăm bản Lao Chải, 11:00 - Mua sắm đặc sản, 13:00 - Ăn trưa và khởi hành về Hà Nội, 18:00 - Về đến Hà Nội',
NOW(), NOW());

-- Insert tour itinerary partners  
INSERT IGNORE INTO tour_itinerary_partners (
    id, itinerary_id, partner_id, created_at
) VALUES 
-- Tour 1 partnerships
(1, 1, 1, NOW()),
(2, 1, 6, NOW()),
(3, 1, 11, NOW()),
(4, 2, 1, NOW()),
(5, 2, 9, NOW()),

-- Tour 2 partnerships  
(6, 3, 2, NOW()),
(7, 3, 6, NOW()),
(8, 3, 11, NOW()),
(9, 4, 2, NOW()),
(10, 4, 8, NOW()),
(11, 5, 8, NOW()),
(12, 5, 12, NOW());