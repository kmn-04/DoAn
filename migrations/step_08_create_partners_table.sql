-- Migration: Create Partners table
-- Description: Create table for managing tour partners (hotels, restaurants, transport)
-- Date: 2024-01-XX

-- Create partners table
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
    
    -- Indexes for better performance
    INDEX idx_partners_type (type),
    INDEX idx_partners_is_active (is_active),
    INDEX idx_partners_rating (rating),
    INDEX idx_partners_created_at (created_at),
    INDEX idx_partners_name (name),
    
    -- Unique constraint on name (case insensitive)
    UNIQUE KEY uk_partners_name (name)
);

-- Create partner_gallery table for storing multiple images
CREATE TABLE IF NOT EXISTS partner_gallery (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partner_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    
    -- Index
    INDEX idx_partner_gallery_partner_id (partner_id)
);

-- Create partner_amenities table for storing amenities
CREATE TABLE IF NOT EXISTS partner_amenities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    partner_id BIGINT NOT NULL,
    amenity VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE,
    
    -- Unique constraint to avoid duplicate amenities for same partner
    UNIQUE KEY uk_partner_amenities (partner_id, amenity),
    
    -- Index
    INDEX idx_partner_amenities_partner_id (partner_id),
    INDEX idx_partner_amenities_amenity (amenity)
);

-- Insert sample data for testing
INSERT INTO partners (name, type, description, address, phone, email, website, rating, price_range, is_active) VALUES
('Grand Hotel Saigon', 'HOTEL', 'Khách sạn 5 sao sang trọng tại trung tâm thành phố với đầy đủ tiện nghi cao cấp', '123 Nguyễn Huệ, Quận 1, TP.HCM', '028-1234-5678', 'info@grandhotelsaigon.com', 'https://grandhotelsaigon.com', 5, 'LUXURY', TRUE),
('Riverside Resort Da Lat', 'HOTEL', 'Resort nghỉ dưỡng bên bờ hồ với không gian yên tĩnh và thiên nhiên tươi mát', '456 Hồ Xuân Hương, Đà Lạt', '0263-987-6543', 'booking@riversidedalat.com', 'https://riversidedalat.com', 4, 'MID_RANGE', TRUE),
('Nhà hàng Sài Gòn Xưa', 'RESTAURANT', 'Nhà hàng chuyên về ẩm thực truyền thống Việt Nam với không gian cổ kính', '789 Lê Lợi, Quận 1, TP.HCM', '028-2345-6789', 'contact@saigonxua.vn', 'https://saigonxua.vn', 4, 'MID_RANGE', TRUE),
('Quán Ăn Bình Dân', 'RESTAURANT', 'Quán ăn bình dân với các món ăn đường phố ngon, giá cả phải chăng', '321 Nguyễn Thái Học, Quận 1, TP.HCM', '028-3456-7890', NULL, NULL, 3, 'BUDGET', TRUE),
('VIP Transport Service', 'TRANSPORT', 'Dịch vụ vận chuyển cao cấp với đội xe hiện đại và tài xế chuyên nghiệp', '654 Cách Mạng Tháng 8, Quận 3, TP.HCM', '028-4567-8901', 'info@viptransport.vn', 'https://viptransport.vn', 5, 'LUXURY', TRUE),
('Xe Khách Phương Trang', 'TRANSPORT', 'Công ty vận tải hành khách uy tín với mạng lưới rộng khắp cả nước', '987 Nguyễn Văn Linh, Quận 7, TP.HCM', '028-5678-9012', 'cskh@phuongtrang.vn', 'https://phuongtrang.vn', 4, 'BUDGET', TRUE);

-- Insert sample gallery images
INSERT INTO partner_gallery (partner_id, image_url) VALUES
(1, 'https://example.com/images/grand-hotel-lobby.jpg'),
(1, 'https://example.com/images/grand-hotel-room.jpg'),
(1, 'https://example.com/images/grand-hotel-pool.jpg'),
(2, 'https://example.com/images/riverside-resort-lake-view.jpg'),
(2, 'https://example.com/images/riverside-resort-room.jpg'),
(3, 'https://example.com/images/saigon-xua-interior.jpg'),
(3, 'https://example.com/images/saigon-xua-food.jpg');

-- Insert sample amenities
INSERT INTO partner_amenities (partner_id, amenity) VALUES
-- Grand Hotel Saigon amenities
(1, 'Wifi miễn phí'),
(1, 'Bể bơi'),
(1, 'Phòng gym'),
(1, 'Spa'),
(1, 'Nhà hàng'),
(1, 'Bar'),
(1, 'Dịch vụ phòng 24/7'),
(1, 'Bãi đậu xe'),
-- Riverside Resort Da Lat amenities
(2, 'Wifi miễn phí'),
(2, 'Bể bơi'),
(2, 'Nhà hàng'),
(2, 'Khu vườn'),
(2, 'Bãi đậu xe'),
(2, 'Dịch vụ giặt ủi'),
-- Nhà hàng Sài Gòn Xưa amenities
(3, 'Wifi miễn phí'),
(3, 'Điều hòa'),
(3, 'Không gian riêng tư'),
(3, 'Bãi đậu xe'),
-- Quán Ăn Bình Dân amenities
(4, 'Giá cả phải chăng'),
(4, 'Phục vụ nhanh'),
-- VIP Transport Service amenities
(5, 'Xe sang'),
(5, 'Tài xế chuyên nghiệp'),
(5, 'Wifi trên xe'),
(5, 'Nước uống miễn phí'),
(5, 'Điều hòa'),
-- Xe Khách Phương Trang amenities
(6, 'Ghế nằm'),
(6, 'Điều hòa'),
(6, 'Wifi'),
(6, 'Toilet trên xe'),
(6, 'Dịch vụ 24/7');

-- Add comments to tables
ALTER TABLE partners COMMENT = 'Table storing partner information (hotels, restaurants, transport services)';
ALTER TABLE partner_gallery COMMENT = 'Table storing gallery images for partners';
ALTER TABLE partner_amenities COMMENT = 'Table storing amenities/facilities for partners';

-- Show table structure
DESCRIBE partners;
DESCRIBE partner_gallery;
DESCRIBE partner_amenities;

-- Show sample data
SELECT 'Sample Partners Data:' as '';
SELECT id, name, type, rating, price_range, is_active FROM partners ORDER BY type, name;

SELECT 'Sample Gallery Data:' as '';
SELECT pg.partner_id, p.name as partner_name, COUNT(*) as image_count 
FROM partner_gallery pg 
JOIN partners p ON pg.partner_id = p.id 
GROUP BY pg.partner_id, p.name
ORDER BY p.name;

SELECT 'Sample Amenities Data:' as '';
SELECT pa.partner_id, p.name as partner_name, COUNT(*) as amenity_count 
FROM partner_amenities pa 
JOIN partners p ON pa.partner_id = p.id 
GROUP BY pa.partner_id, p.name
ORDER BY p.name;
