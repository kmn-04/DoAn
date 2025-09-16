-- Script đơn giản để setup categories table
USE doan;

-- Drop table nếu tồn tại để tạo mới
DROP TABLE IF EXISTS categories;

-- Tạo lại bảng categories với đầy đủ cột
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    image_url VARCHAR(255),
    gallery_images JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạo indexes
CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_display_order ON categories(display_order);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Thêm dữ liệu mẫu
INSERT INTO categories (name, slug, description, display_order, is_active) VALUES 
('Du lịch biển', 'du-lich-bien', 'Các tour du lịch nghỉ dưỡng tại bãi biển', 1, TRUE),
('Du lịch núi', 'du-lich-nui', 'Các tour khám phá thiên nhiên và leo núi', 2, TRUE),
('Du lịch văn hóa', 'du-lich-van-hoa', 'Các tour tìm hiểu văn hóa và lịch sử', 3, TRUE),
('Du lịch ẩm thực', 'du-lich-am-thuc', 'Các tour khám phá ẩm thực địa phương', 4, TRUE),
('Du lịch phiêu lưu', 'du-lich-phieu-luu', 'Các tour thể thao mạo hiểm và phiêu lưu', 5, TRUE);

SELECT 'Categories table setup completed successfully' AS status;
