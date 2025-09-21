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

-- Insert sample partners
INSERT INTO partners (name, type, address, phone) VALUES 
('Khách sạn Đại Dương', 'Hotel', '123 Đường Biển, Nha Trang', '0258-123-4567'),
('Nhà hàng Hương Biển', 'Restaurant', '456 Đường Ven Biển, Đà Nẵng', '0236-789-0123'),
('Công ty vận tải ABC', 'Transport', '789 Đường Chính, TP.HCM', '028-345-6789'),
('Resort Paradise', 'Hotel', '321 Bãi Biển, Phú Quốc', '0297-111-2222'),
('Nhà hàng Núi Rừng', 'Restaurant', '654 Đường Cao Nguyên, Đà Lạt', '0263-333-4444')
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    address = VALUES(address),
    phone = VALUES(phone);

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
