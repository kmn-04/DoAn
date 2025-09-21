-- =============================
-- Bảng người dùng & phân quyền
-- =============================
CREATE TABLE roles (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(50) UNIQUE NOT NULL
);
INSERT INTO roles (name) VALUES ('Admin'), ('Staff'), ('Customer');
CREATE TABLE users (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(150) NOT NULL,
email VARCHAR(150) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL,
role_id BIGINT,
status ENUM('Active', 'Inactive') DEFAULT 'Active',
avatar_url VARCHAR(255),
phone VARCHAR(20),
address VARCHAR(255),
dob DATE,
email_verified_at TIMESTAMP NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL,
FOREIGN KEY (role_id) REFERENCES roles(id)
);
-- =============================
-- Bảng danh mục tour
-- =============================
CREATE TABLE categories (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(150) NOT NULL,
slug VARCHAR(150) UNIQUE NOT NULL,
description TEXT,
image_url VARCHAR(255),
status ENUM('Active','Inactive') DEFAULT 'Active',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- =============================
-- Bảng tour
-- =============================
CREATE TABLE tours (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(150) NOT NULL,
slug VARCHAR(150) UNIQUE NOT NULL,
short_description TEXT,
description TEXT,
price DECIMAL(12,2) NOT NULL,
sale_price DECIMAL(12,2),
duration INT NOT NULL, -- số ngày
max_people INT NOT NULL,
status ENUM('Active','Inactive') DEFAULT 'Active',
is_featured BOOLEAN DEFAULT FALSE,
category_id BIGINT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL,
FOREIGN KEY (category_id) REFERENCES categories(id)
);
-- Bảng chi tiết lịch trình
CREATE TABLE tour_itineraries (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
tour_id BIGINT,
day_number INT NOT NULL,
title VARCHAR(255),
description TEXT,
partner_id BIGINT NULL,
FOREIGN KEY (tour_id) REFERENCES tours(id),
FOREIGN KEY (partner_id) REFERENCES partners(id)
);
-- =============================
-- Bảng booking & thanh toán
-- =============================
CREATE TABLE bookings (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
booking_code VARCHAR(50) UNIQUE NOT NULL,
user_id BIGINT,
tour_id BIGINT,
start_date DATE NOT NULL,
num_adults INT DEFAULT 1,
num_children INT DEFAULT 0,
total_price DECIMAL(12,2) NOT NULL,
special_requests TEXT,
promotion_id BIGINT NULL,
contact_phone VARCHAR(20),
status ENUM('Pending','Confirmed','Paid','Cancelled','Completed') DEFAULT 'Pending',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (tour_id) REFERENCES tours(id)
);
CREATE TABLE payments (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
booking_id BIGINT,
amount DECIMAL(12,2) NOT NULL,
payment_method VARCHAR(50),
transaction_id VARCHAR(100),
status ENUM('Pending','Completed','Failed','Refunded') DEFAULT 'Pending',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
-- =============================
-- Marketing & đánh giá
-- =============================
CREATE TABLE reviews (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
user_id BIGINT,
tour_id BIGINT,
booking_id BIGINT,
rating TINYINT CHECK (rating BETWEEN 1 AND 5),
comment TEXT,
status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id),
FOREIGN KEY (tour_id) REFERENCES tours(id),
FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
CREATE TABLE promotions (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
code VARCHAR(50) UNIQUE NOT NULL,
type ENUM('Percentage','Fixed') NOT NULL,
value DECIMAL(12,2) NOT NULL,
usage_limit INT DEFAULT 0,
start_date TIMESTAMP,
end_date TIMESTAMP,
status ENUM('Active','Inactive','Expired') DEFAULT 'Active',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- =============================
-- Đối tác & hình ảnh
-- =============================
CREATE TABLE partners (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(150) NOT NULL,
type ENUM('Hotel','Restaurant','Transport') NOT NULL,
address VARCHAR(255),
phone VARCHAR(20),
avatar_url VARCHAR(255)
);
CREATE TABLE tour_images (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
tour_id BIGINT,
image_url VARCHAR(255),
FOREIGN KEY (tour_id) REFERENCES tours(id)
);
-- =============================
-- Đối tượng khách hàng
-- =============================
CREATE TABLE target_audiences (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL
);
CREATE TABLE tour_target_audience (
tour_id BIGINT,
target_audience_id BIGINT,
PRIMARY KEY (tour_id, target_audience_id),
FOREIGN KEY (tour_id) REFERENCES tours(id),
FOREIGN KEY (target_audience_id) REFERENCES target_audiences(id)
);
-- =============================
-- Liên hệ & hỗ trợ
-- =============================
CREATE TABLE contact_requests (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(150) NOT NULL,
email VARCHAR(150) NOT NULL,
message TEXT,
status ENUM('New','In-progress','Resolved') DEFAULT 'New',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- =============================
-- Thông báo & Logs
-- =============================
CREATE TABLE notifications (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
user_id BIGINT,
message TEXT NOT NULL,
is_read BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE logs (
id BIGINT AUTO_INCREMENT PRIMARY KEY,
user_id BIGINT,
action VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);