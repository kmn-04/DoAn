-- ===========================
-- PARTNERS SAMPLE DATA
-- Tạo dữ liệu mẫu cho hệ thống quản lý đối tác
-- ===========================

-- Tạo bảng partners nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS partners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type ENUM('HOTEL', 'RESTAURANT', 'TRANSPORT') NOT NULL,
    avatar_url VARCHAR(500),
    description TEXT,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(255),
    rating INT NOT NULL DEFAULT 1 CHECK (rating >= 1 AND rating <= 5),
    price_range ENUM('BUDGET', 'MID_RANGE', 'LUXURY'),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_partners_type (type),
    INDEX idx_partners_is_active (is_active),
    INDEX idx_partners_rating (rating),
    INDEX idx_partners_created_at (created_at),
    INDEX idx_partners_name (name),
    UNIQUE KEY uk_partners_name (name)
);

-- Tạo bảng partner_gallery nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS partner_gallery (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partner_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    INDEX idx_partner_gallery_partner_id (partner_id)
);

-- Tạo bảng partner_amenities nếu chưa tồn tại
CREATE TABLE IF NOT EXISTS partner_amenities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partner_id BIGINT NOT NULL,
    amenity VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    UNIQUE KEY uk_partner_amenities (partner_id, amenity),
    INDEX idx_partner_amenities_partner_id (partner_id),
    INDEX idx_partner_amenities_amenity (amenity)
);

-- Xóa dữ liệu cũ (nếu có)
DELETE FROM partner_amenities;
DELETE FROM partner_gallery;
DELETE FROM partners;

-- Reset AUTO_INCREMENT
ALTER TABLE partners AUTO_INCREMENT = 1;
ALTER TABLE partner_gallery AUTO_INCREMENT = 1;
ALTER TABLE partner_amenities AUTO_INCREMENT = 1;

-- ===========================
-- KHÁCH SẠN (HOTELS)
-- ===========================
INSERT INTO partners (id, name, type, avatar_url, description, address, phone, email, website, rating, price_range, is_active) VALUES 
(1, 'Grand Hotel Saigon', 'HOTEL', 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400', 'Khách sạn 5 sao sang trọng tại trung tâm thành phố với đầy đủ tiện nghi cao cấp và dịch vụ chuyên nghiệp', '123 Nguyễn Huệ, Quận 1, TP.HCM', '028-1234-5678', 'info@grandhotelsaigon.com', 'https://grandhotelsaigon.com', 5, 'LUXURY', true),

(2, 'Riverside Resort Da Lat', 'HOTEL', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', 'Resort nghỉ dưỡng bên bờ hồ với không gian yên tĩnh, thiên nhiên tươi mát và không khí trong lành', '456 Hồ Xuân Hương, Đà Lạt, Lâm Đồng', '0263-987-6543', 'booking@riversidedalat.com', 'https://riversidedalat.com', 4, 'MID_RANGE', true),

(3, 'Boutique Hotel Hoi An', 'HOTEL', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', 'Khách sạn boutique với kiến trúc cổ điển, nằm trong khu phố cổ Hội An', '789 Nguyễn Thái Học, Hội An, Quảng Nam', '0235-123-4567', 'contact@boutiquehoian.com', 'https://boutiquehoian.com', 4, 'MID_RANGE', true),

(4, 'Beach Resort Nha Trang', 'HOTEL', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400', 'Resort biển với view tuyệt đẹp và các hoạt động thể thao dưới nước', '321 Trần Phú, Nha Trang, Khánh Hòa', '0258-345-6789', 'info@beachresortnt.com', 'https://beachresortnt.com', 5, 'LUXURY', true),

(5, 'Budget Inn Backpacker', 'HOTEL', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400', 'Nhà nghỉ bình dân dành cho du khách ba lô với giá cả phải chăng', '654 Bùi Viện, Quận 1, TP.HCM', '028-987-6543', 'info@budgetinn.vn', NULL, 3, 'BUDGET', true),

(6, 'Mountain View Lodge', 'HOTEL', 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', 'Lodge trên núi với view tuyệt đẹp và không khí trong lành', '789 Trần Hưng Đạo, Sa Pa, Lào Cai', '0214-123-4567', 'info@mountainview.vn', 'https://mountainview.vn', 4, 'MID_RANGE', true);

-- ===========================
-- NHÀ HÀNG (RESTAURANTS)
-- ===========================
INSERT INTO partners (id, name, type, avatar_url, description, address, phone, email, website, rating, price_range, is_active) VALUES 
(7, 'Nhà hàng Sài Gòn Xưa', 'RESTAURANT', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', 'Nhà hàng chuyên về ẩm thực truyền thống Việt Nam với không gian cổ kính và phong cách xưa', '789 Lê Lợi, Quận 1, TP.HCM', '028-2345-6789', 'contact@saigonxua.vn', 'https://saigonxua.vn', 4, 'MID_RANGE', true),

(8, 'Fine Dining Restaurant', 'RESTAURANT', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', 'Nhà hàng cao cấp với đầu bếp quốc tế và menu fusion độc đáo', '456 Đồng Khởi, Quận 1, TP.HCM', '028-3456-7890', 'reservation@finedining.vn', 'https://finedining.vn', 5, 'LUXURY', true),

(9, 'Quán Ăn Bình Dân', 'RESTAURANT', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', 'Quán ăn bình dân với các món ăn đường phố ngon, giá cả phải chăng và phục vụ nhanh', '321 Nguyễn Thái Học, Quận 1, TP.HCM', '028-4567-8901', NULL, NULL, 3, 'BUDGET', true),

(10, 'Seafood Paradise', 'RESTAURANT', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 'Nhà hàng hải sản tươi sống với view biển tuyệt đẹp', '123 Trần Phú, Nha Trang, Khánh Hòa', '0258-567-8901', 'info@seafoodparadise.vn', 'https://seafoodparadise.vn', 4, 'MID_RANGE', true),

(11, 'Vegetarian Garden', 'RESTAURANT', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', 'Nhà hàng chay với thực đơn đa dạng và không gian xanh mát', '987 Cách Mạng Tháng 8, Quận 3, TP.HCM', '028-678-9012', 'contact@vegetariangarden.vn', 'https://vegetariangarden.vn', 4, 'MID_RANGE', true),

(12, 'Street Food Corner', 'RESTAURANT', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', 'Góc ẩm thực đường phố với đa dạng món ăn địa phương', '456 Bến Thành, Quận 1, TP.HCM', '028-789-0123', 'info@streetfood.vn', NULL, 3, 'BUDGET', true);

-- ===========================
-- VẬN CHUYỂN (TRANSPORT)
-- ===========================
INSERT INTO partners (id, name, type, avatar_url, description, address, phone, email, website, rating, price_range, is_active) VALUES 
(13, 'VIP Transport Service', 'TRANSPORT', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400', 'Dịch vụ vận chuyển cao cấp với đội xe sang trọng và tài xế chuyên nghiệp, phục vụ 24/7', '654 Cách Mạng Tháng 8, Quận 3, TP.HCM', '028-4567-8901', 'info@viptransport.vn', 'https://viptransport.vn', 5, 'LUXURY', true),

(14, 'Xe Khách Phương Trang', 'TRANSPORT', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400', 'Công ty vận tải hành khách uy tín với mạng lưới rộng khắp cả nước', '987 Nguyễn Văn Linh, Quận 7, TP.HCM', '028-5678-9012', 'cskh@phuongtrang.vn', 'https://phuongtrang.vn', 4, 'BUDGET', true),

(15, 'Motorbike Rental', 'TRANSPORT', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400', 'Dịch vụ cho thuê xe máy với đa dạng loại xe và giá cả hợp lý', '123 Lê Lai, Quận 1, TP.HCM', '028-789-0123', 'rental@motorbike.vn', 'https://motorbike.vn', 3, 'BUDGET', true),

(16, 'Airport Shuttle', 'TRANSPORT', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400', 'Dịch vụ đưa đón sân bay chuyên nghiệp, đúng giờ và an toàn', '456 Trường Sơn, Quận Tân Bình, TP.HCM', '028-890-1234', 'booking@airportshuttle.vn', 'https://airportshuttle.vn', 4, 'MID_RANGE', true),

(17, 'Limousine Service', 'TRANSPORT', 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=400', 'Dịch vụ limousine sang trọng cho các chuyến đi VIP', '789 Nguyễn Huệ, Quận 1, TP.HCM', '028-901-2345', 'vip@limousine.vn', 'https://limousine.vn', 5, 'LUXURY', true),

(18, 'Taxi Mai Linh', 'TRANSPORT', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400', 'Dịch vụ taxi truyền thống với tài xế kinh nghiệm', '321 Lê Văn Sỹ, Quận 3, TP.HCM', '028-012-3456', 'info@mailinh.vn', 'https://mailinh.vn', 3, 'BUDGET', true);

-- ===========================
-- GALLERY IMAGES
-- ===========================
INSERT INTO partner_gallery (partner_id, image_url) VALUES
-- Grand Hotel Saigon (ID: 1)
(1, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'),
(1, 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'),
(1, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'),
(1, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'),

-- Riverside Resort Da Lat (ID: 2)
(2, 'https://images.unsplash.com/photo-1520637836862-4d197d17c50a?w=800'),
(2, 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800'),
(2, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'),

-- Beach Resort Nha Trang (ID: 4)
(4, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'),
(4, 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'),
(4, 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'),

-- Fine Dining Restaurant (ID: 8)
(8, 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800'),
(8, 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=800'),
(8, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'),

-- Seafood Paradise (ID: 10)
(10, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800'),
(10, 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800'),

-- VIP Transport Service (ID: 13)
(13, 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800'),
(13, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'),
(13, 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800');

-- ===========================
-- AMENITIES
-- ===========================
INSERT INTO partner_amenities (partner_id, amenity) VALUES
-- Grand Hotel Saigon (ID: 1)
(1, 'Wifi miễn phí'), (1, 'Bể bơi'), (1, 'Phòng gym'), (1, 'Spa'), (1, 'Nhà hàng'), (1, 'Bar'), (1, 'Dịch vụ phòng 24/7'), (1, 'Bãi đậu xe'), (1, 'Trung tâm thương mại'), (1, 'Phòng hội nghị'), (1, 'Concierge'), (1, 'Dịch vụ giặt ủi'),

-- Riverside Resort Da Lat (ID: 2)
(2, 'Wifi miễn phí'), (2, 'Bể bơi'), (2, 'Nhà hàng'), (2, 'Khu vườn'), (2, 'Bãi đậu xe'), (2, 'Dịch vụ giặt ủi'), (2, 'Sân tennis'), (2, 'Khu vui chơi trẻ em'), (2, 'BBQ'), (2, 'Cho thuê xe đạp'),

-- Boutique Hotel Hoi An (ID: 3)
(3, 'Wifi miễn phí'), (3, 'Điều hòa'), (3, 'Bãi đậu xe'), (3, 'Tour du lịch'), (3, 'Cho thuê xe đạp'), (3, 'Phòng gia đình'), (3, 'Dịch vụ giặt ủi'), (3, 'Massage'),

-- Beach Resort Nha Trang (ID: 4)
(4, 'Wifi miễn phí'), (4, 'Bể bơi'), (4, 'Bãi biển riêng'), (4, 'Thể thao nước'), (4, 'Spa'), (4, 'Nhà hàng'), (4, 'Bar bãi biển'), (4, 'Phòng gym'), (4, 'Lặn biển'), (4, 'Kayak'),

-- Budget Inn Backpacker (ID: 5)
(5, 'Wifi miễn phí'), (5, 'Điều hòa'), (5, 'Bếp chung'), (5, 'Máy giặt'), (5, 'Phòng tắm chung'), (5, 'Tủ khóa'), (5, 'Khu vực chung'),

-- Mountain View Lodge (ID: 6)
(6, 'Wifi miễn phí'), (6, 'Lò sưởi'), (6, 'Nhà hàng'), (6, 'View núi'), (6, 'Trekking guide'), (6, 'Bãi đậu xe'), (6, 'Khu vực BBQ'),

-- Nhà hàng Sài Gòn Xưa (ID: 7)
(7, 'Wifi miễn phí'), (7, 'Điều hòa'), (7, 'Không gian riêng tư'), (7, 'Bãi đậu xe'), (7, 'Nhạc truyền thống'), (7, 'Phục vụ tiệc'), (7, 'Thực đơn đa dạng'), (7, 'Không gian cổ điển'),

-- Fine Dining Restaurant (ID: 8)
(8, 'Wifi miễn phí'), (8, 'Điều hòa'), (8, 'Phòng VIP'), (8, 'Sommelier'), (8, 'Valet parking'), (8, 'Live music'), (8, 'Menu tasting'), (8, 'Chef bàn'),

-- Quán Ăn Bình Dân (ID: 9)
(9, 'Giá cả phải chăng'), (9, 'Phục vụ nhanh'), (9, 'Món ăn đường phố'), (9, 'Mở cửa muộn'), (9, 'Takeaway'), (9, 'Thanh toán tiền mặt'),

-- Seafood Paradise (ID: 10)
(10, 'Wifi miễn phí'), (10, 'View biển'), (10, 'Hải sản tươi sống'), (10, 'Bãi đậu xe'), (10, 'Phòng riêng'), (10, 'Karaoke'), (10, 'Tiệc buffet'),

-- Vegetarian Garden (ID: 11)
(11, 'Wifi miễn phí'), (11, 'Không gian xanh'), (11, 'Thực phẩm organic'), (11, 'Bãi đậu xe'), (11, 'Không khói thuốc'), (11, 'Menu chay'), (11, 'Yoga space'),

-- Street Food Corner (ID: 12)
(12, 'Giá cả hợp lý'), (12, 'Món ăn đa dạng'), (12, 'Phục vụ nhanh'), (12, 'Takeaway'), (12, 'Mở cửa sớm'), (12, 'Thanh toán linh hoạt'),

-- VIP Transport Service (ID: 13)
(13, 'Xe sang'), (13, 'Tài xế chuyên nghiệp'), (13, 'Wifi trên xe'), (13, 'Nước uống miễn phí'), (13, 'Điều hòa'), (13, 'Dịch vụ 24/7'), (13, 'GPS tracking'), (13, 'Bảo hiểm toàn diện'),

-- Xe Khách Phương Trang (ID: 14)
(14, 'Ghế nằm'), (14, 'Điều hòa'), (14, 'Wifi'), (14, 'Toilet trên xe'), (14, 'Dịch vụ 24/7'), (14, 'Bảo hiểm'), (14, 'Đặt vé online'), (14, 'Mạng lưới rộng'),

-- Motorbike Rental (ID: 15)
(15, 'Xe đa dạng'), (15, 'Giá cả hợp lý'), (15, 'Bảo hiểm'), (15, 'Hướng dẫn sử dụng'), (15, 'Phụ tùng thay thế'), (15, 'Giao xe tận nơi'), (15, 'Bản đồ miễn phí'),

-- Airport Shuttle (ID: 16)
(16, 'Đúng giờ'), (16, 'Điều hòa'), (16, 'Wifi'), (16, 'Hành lý miễn phí'), (16, 'Đặt trước online'), (16, 'Thanh toán linh hoạt'), (16, 'Theo dõi chuyến bay'),

-- Limousine Service (ID: 17)
(17, 'Xe limousine'), (17, 'Tài xế chuyên nghiệp'), (17, 'Champagne miễn phí'), (17, 'Âm thanh cao cấp'), (17, 'Wifi'), (17, 'Dịch vụ VIP'), (17, 'Red carpet'), (17, 'Photographer'),

-- Taxi Mai Linh (ID: 18)
(18, 'Tài xế kinh nghiệm'), (18, 'Giá cả hợp lý'), (18, 'Dịch vụ 24/7'), (18, 'Bảo hiểm'), (18, 'Điều hòa'), (18, 'Thanh toán tiền mặt'), (18, 'App đặt xe');

-- ===========================
-- THỐNG KÊ DỮ LIỆU
-- ===========================
SELECT '=== THỐNG KÊ PARTNERS ===' as '';

SELECT 
    type as 'Loại đối tác',
    COUNT(*) as 'Số lượng',
    AVG(rating) as 'Rating trung bình'
FROM partners 
GROUP BY type
ORDER BY COUNT(*) DESC;

SELECT 
    price_range as 'Khoảng giá',
    COUNT(*) as 'Số lượng'
FROM partners 
WHERE price_range IS NOT NULL
GROUP BY price_range
ORDER BY FIELD(price_range, 'BUDGET', 'MID_RANGE', 'LUXURY');

SELECT 
    rating as 'Rating',
    COUNT(*) as 'Số lượng'
FROM partners 
GROUP BY rating
ORDER BY rating DESC;

SELECT '=== SAMPLE DATA LOADED SUCCESSFULLY ===' as '';
SELECT CONCAT('Total Partners: ', COUNT(*)) as 'Status' FROM partners;
SELECT CONCAT('Total Gallery Images: ', COUNT(*)) as 'Status' FROM partner_gallery;
SELECT CONCAT('Total Amenities: ', COUNT(*)) as 'Status' FROM partner_amenities;
