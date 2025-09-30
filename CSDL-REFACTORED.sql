-- =============================
-- CSDL ĐÃ ĐƯỢC TÁI CẤU TRÚC
-- Database: doan
-- Sửa các vấn đề logic và bổ sung đầy đủ
-- =============================

USE doan;

-- =============================
-- 1. Bảng người dùng & phân quyền
-- =============================
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description) VALUES 
('Admin', 'Quản trị viên hệ thống'),
('Staff', 'Nhân viên'),
('Customer', 'Khách hàng');

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT,
    status ENUM('Active', 'Inactive', 'Banned') DEFAULT 'Active',
    avatar_url VARCHAR(255),
    phone VARCHAR(20),
    address VARCHAR(255),
    dob DATE,
    gender ENUM('Male', 'Female', 'Other'),
    email_verified_at TIMESTAMP NULL,
    -- Thống kê người dùng
    login_count INT DEFAULT 0,
    total_bookings INT DEFAULT 0,
    total_tour_views INT DEFAULT 0,
    last_login_at TIMESTAMP NULL,
    last_activity_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_users_email (email),
    INDEX idx_users_status (status),
    INDEX idx_users_role_id (role_id)
);

-- =============================
-- 2. Bảng danh mục tour (SỬA - Theme-based, không phải location)
-- =============================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    icon VARCHAR(100), -- Icon cho category
    parent_id BIGINT NULL, -- Danh mục cha (để tạo sub-category)
    display_order INT DEFAULT 0, -- Thứ tự hiển thị
    is_featured BOOLEAN DEFAULT FALSE, -- Category nổi bật
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_categories_slug (slug),
    INDEX idx_categories_parent_id (parent_id),
    INDEX idx_categories_status (status),
    INDEX idx_categories_display_order (display_order)
);

-- Danh mục đúng (theo theme/loại hình, KHÔNG phải địa điểm)
INSERT INTO categories (id, name, slug, description, icon, display_order, is_featured, status) VALUES
(1, 'Du lịch biển đảo', 'du-lich-bien-dao', 'Tận hưởng không gian biển xanh cát trắng', '🏖️', 1, TRUE, 'Active'),
(2, 'Du lịch núi rừng', 'du-lich-nui-rung', 'Khám phá thiên nhiên hùng vĩ', '⛰️', 2, TRUE, 'Active'),
(3, 'Du lịch văn hóa', 'du-lich-van-hoa', 'Tìm hiểu lịch sử và di sản', '🏛️', 3, TRUE, 'Active'),
(4, 'Du lịch tâm linh', 'du-lich-tam-linh', 'Hành trình tâm linh thanh tịnh', '🙏', 4, FALSE, 'Active'),
(5, 'Du lịch nghỉ dưỡng', 'du-lich-nghi-duong', 'Thư giãn và chăm sóc sức khỏe', '💆', 5, TRUE, 'Active'),
(6, 'Du lịch khám phá', 'du-lich-kham-pha', 'Trải nghiệm và khám phá mới', '🧭', 6, FALSE, 'Active'),
(7, 'Du lịch ẩm thực', 'du-lich-am-thuc', 'Thưởng thức đặc sản địa phương', '🍜', 7, FALSE, 'Active'),
(8, 'Du lịch mạo hiểm', 'du-lich-mao-hiem', 'Thử thách và phiêu lưu', '🪂', 8, FALSE, 'Active'),
(9, 'Du lịch MICE', 'du-lich-mice', 'Hội nghị, sự kiện, team building', '🎯', 9, FALSE, 'Active'),
(10, 'Du lịch cao cấp', 'du-lich-cao-cap', 'Trải nghiệm sang trọng đẳng cấp', '💎', 10, TRUE, 'Active');

-- =============================
-- 3. Bảng tour (SỬA - Bổ sung đầy đủ trường)
-- =============================
CREATE TABLE tours (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    short_description TEXT,
    description TEXT,
    highlights TEXT, -- Điểm nhấn tour (JSON array)
    
    -- Giá cả
    price DECIMAL(12,2) NOT NULL, -- Giá gốc
    sale_price DECIMAL(12,2), -- Giá sale
    child_price DECIMAL(12,2), -- Giá trẻ em
    infant_price DECIMAL(12,2), -- Giá trẻ nhỏ
    
    -- Thông tin cơ bản
    duration INT NOT NULL, -- Số ngày
    min_people INT DEFAULT 1, -- Số người tối thiểu
    max_people INT NOT NULL, -- Số người tối đa
    
    -- Phân loại
    category_id BIGINT,
    tour_type ENUM('DOMESTIC','INTERNATIONAL') DEFAULT 'DOMESTIC',
    
    -- Địa điểm (SỬA LOGIC)
    departure_location VARCHAR(100), -- Điểm khởi hành: "Hà Nội", "TP.HCM"
    destination VARCHAR(255), -- Điểm đến chính: "Hạ Long - Ninh Bình"
    destinations TEXT, -- Các điểm đến (JSON array): ["Hà Nội", "Hạ Long", "Ninh Bình"]
    region VARCHAR(50), -- Vùng miền: "Miền Bắc", "Miền Trung", "Đông Nam Á", "Đông Bắc Á"
    country VARCHAR(100), -- Quốc gia: "Việt Nam", "Nhật Bản", "Thái Lan"
    country_code VARCHAR(3), -- Mã quốc gia: VN, JP, TH
    
    -- Phương tiện & dịch vụ
    transportation VARCHAR(100), -- Phương tiện: "Máy bay + Xe khách", "Tàu hỏa"
    accommodation VARCHAR(100), -- Khách sạn: "3 sao", "4 sao", "Resort 5 sao"
    meals_included VARCHAR(100), -- Bữa ăn: "3 bữa/ngày", "Ăn sáng"
    
    -- Dịch vụ bao gồm/không bao gồm
    included_services TEXT, -- Dịch vụ BAO GỒM (JSON array)
    excluded_services TEXT, -- Dịch vụ KHÔNG BAO GỒM (JSON array)
    
    -- Visa & bay
    visa_required BOOLEAN DEFAULT FALSE,
    visa_info TEXT, -- Thông tin visa chi tiết
    flight_included BOOLEAN DEFAULT FALSE,
    
    -- Chính sách
    cancellation_policy TEXT, -- Chính sách hủy tour
    note TEXT, -- Ghi chú quan trọng
    suitable_for VARCHAR(255), -- Phù hợp: "Gia đình có trẻ nhỏ", "Cặp đôi", "Nhóm bạn"
    
    -- Hình ảnh
    main_image VARCHAR(255),
    
    -- Trạng thái
    status ENUM('Active','Inactive','Sold_Out') DEFAULT 'Active',
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0, -- Số lượt xem
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_tours_slug (slug),
    INDEX idx_tours_category_id (category_id),
    INDEX idx_tours_tour_type (tour_type),
    INDEX idx_tours_departure_location (departure_location),
    INDEX idx_tours_destination (destination),
    INDEX idx_tours_region (region),
    INDEX idx_tours_country_code (country_code),
    INDEX idx_tours_price (price),
    INDEX idx_tours_status (status),
    INDEX idx_tours_is_featured (is_featured),
    FULLTEXT idx_tours_search (name, short_description, description)
);

-- =============================
-- 4. Bảng lịch khởi hành (MỚI - QUAN TRỌNG)
-- =============================
CREATE TABLE tour_schedules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tour_id BIGINT NOT NULL,
    departure_date DATE NOT NULL,
    return_date DATE,
    total_seats INT NOT NULL, -- Tổng số chỗ
    available_seats INT NOT NULL, -- Số chỗ còn lại
    adult_price DECIMAL(12,2), -- Giá người lớn (có thể khác giá cơ bản)
    child_price DECIMAL(12,2), -- Giá trẻ em
    status ENUM('Available','Full','Cancelled','Completed') DEFAULT 'Available',
    note TEXT, -- Ghi chú lịch khởi hành
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_schedules_tour_id (tour_id),
    INDEX idx_schedules_departure_date (departure_date),
    INDEX idx_schedules_status (status)
);

-- =============================
-- 5. Bảng giá tour động (MỚI)
-- =============================
CREATE TABLE tour_prices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tour_id BIGINT NOT NULL,
    price_type ENUM('Adult','Child','Infant','Single_Supplement') NOT NULL,
    base_price DECIMAL(12,2) NOT NULL,
    season_price DECIMAL(12,2), -- Giá theo mùa
    season_name VARCHAR(50), -- Tên mùa: "Cao điểm", "Thấp điểm"
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_prices_tour_id (tour_id),
    INDEX idx_prices_valid_dates (valid_from, valid_to)
);

-- =============================
-- 6. Bảng đối tác (DI CHUYỂN LÊN TRƯỚC)
-- =============================
CREATE TABLE partners (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type ENUM('Hotel','Restaurant','Transport','TourOperator','Insurance','Other') NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(150),
    website VARCHAR(255),
    avatar_url VARCHAR(255),
    description TEXT,
    rating DECIMAL(2,1),
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_partners_type (type),
    INDEX idx_partners_status (status)
);

-- =============================
-- 7. Bảng khuyến mãi (DI CHUYỂN LÊN)
-- =============================
CREATE TABLE promotions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    type ENUM('Percentage','Fixed','Free_Service') NOT NULL,
    value DECIMAL(12,2) NOT NULL,
    max_discount DECIMAL(12,2), -- Giảm tối đa (cho % discount)
    min_order_amount DECIMAL(12,2), -- Giá trị đơn hàng tối thiểu
    usage_limit INT DEFAULT 0, -- Giới hạn số lần sử dụng (0 = unlimited)
    used_count INT DEFAULT 0, -- Số lần đã sử dụng
    per_user_limit INT DEFAULT 1, -- Giới hạn mỗi user
    applicable_tours TEXT, -- Áp dụng cho tour nào (JSON array tour_ids)
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    status ENUM('Active','Inactive','Expired') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_promotions_code (code),
    INDEX idx_promotions_status (status)
);

-- =============================
-- 8. Bảng chi tiết lịch trình (SỬA - Bổ sung trường)
-- =============================
CREATE TABLE tour_itineraries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tour_id BIGINT,
    day_number INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    location VARCHAR(100), -- Địa điểm của ngày này
    activities TEXT, -- Các hoạt động (JSON array)
    meals VARCHAR(100), -- Bữa ăn: "Sáng, Trưa, Tối"
    accommodation VARCHAR(255), -- Nơi nghỉ
    images TEXT, -- Hình ảnh lịch trình (JSON array)
    -- Thông tin đối tác
    partner_id BIGINT NULL,
    accommodation_partner_id BIGINT NULL,
    meals_partner_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL,
    FOREIGN KEY (accommodation_partner_id) REFERENCES partners(id) ON DELETE SET NULL,
    FOREIGN KEY (meals_partner_id) REFERENCES partners(id) ON DELETE SET NULL,
    INDEX idx_itineraries_tour_id (tour_id)
);

-- =============================
-- 9. Bảng booking (SỬA - Tách status thành 2 trường)
-- =============================
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_code VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT,
    tour_id BIGINT,
    schedule_id BIGINT, -- Link đến lịch khởi hành cụ thể
    
    -- Thông tin người đặt
    customer_name VARCHAR(150) NOT NULL, -- Có thể khác user
    customer_email VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address VARCHAR(255),
    
    -- Thông tin booking
    start_date DATE NOT NULL,
    num_adults INT DEFAULT 1,
    num_children INT DEFAULT 0,
    num_infants INT DEFAULT 0,
    
    -- Giá
    unit_price DECIMAL(12,2) NOT NULL, -- Giá đơn vị
    total_price DECIMAL(12,2) NOT NULL, -- Tổng giá
    discount_amount DECIMAL(12,2) DEFAULT 0, -- Số tiền giảm
    final_amount DECIMAL(12,2) NOT NULL, -- Số tiền cuối cùng
    
    promotion_id BIGINT NULL,
    special_requests TEXT,
    
    -- Trạng thái (TÁCH RA 2 TRƯỜNG)
    confirmation_status ENUM('Pending','Confirmed','Cancelled','Rejected') DEFAULT 'Pending',
    payment_status ENUM('Unpaid','Partially_Paid','Paid','Refunded') DEFAULT 'Unpaid',
    
    -- Lý do hủy
    cancellation_reason TEXT,
    cancelled_by BIGINT, -- User ID người hủy
    cancelled_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE RESTRICT,
    FOREIGN KEY (schedule_id) REFERENCES tour_schedules(id) ON DELETE SET NULL,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL,
    FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_bookings_booking_code (booking_code),
    INDEX idx_bookings_user_id (user_id),
    INDEX idx_bookings_tour_id (tour_id),
    INDEX idx_bookings_confirmation_status (confirmation_status),
    INDEX idx_bookings_payment_status (payment_status),
    INDEX idx_bookings_start_date (start_date)
);

-- =============================
-- 10. Bảng thông tin hành khách (MỚI - QUAN TRỌNG)
-- =============================
CREATE TABLE booking_participants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender ENUM('Male','Female','Other'),
    dob DATE,
    id_number VARCHAR(50), -- CMND/Passport
    id_type ENUM('CMND','CCCD','Passport') DEFAULT 'CMND',
    nationality VARCHAR(50) DEFAULT 'Việt Nam',
    participant_type ENUM('Adult','Child','Infant') NOT NULL,
    special_requirements TEXT, -- Yêu cầu đặc biệt (ăn chay, dị ứng...)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_participants_booking_id (booking_id)
);

-- =============================
-- 11. Bảng thanh toán (SỬA - Bổ sung trường)
-- =============================
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    payment_code VARCHAR(100) UNIQUE, -- Mã thanh toán nội bộ
    
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50), -- MoMo, VNPay, Banking, Cash
    payment_provider VARCHAR(50), -- Tên nhà cung cấp
    
    -- Transaction IDs
    transaction_id VARCHAR(100), -- Mã GD nội bộ
    provider_transaction_id VARCHAR(200), -- Mã GD từ nhà cung cấp (MoMo, VNPay...)
    
    status ENUM('Pending','Completed','Failed','Refunded','Cancelled') DEFAULT 'Pending',
    
    -- Thời gian
    paid_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    
    -- Hoàn tiền
    refund_amount DECIMAL(12,2) DEFAULT 0,
    refund_reason TEXT,
    
    payment_note TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    INDEX idx_payments_booking_id (booking_id),
    INDEX idx_payments_payment_code (payment_code),
    INDEX idx_payments_transaction_id (transaction_id),
    INDEX idx_payments_status (status)
);

-- =============================
-- 12. Bảng đánh giá (SỬA - Bổ sung trường)
-- =============================
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    tour_id BIGINT,
    booking_id BIGINT,
    
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    images TEXT, -- Hình ảnh đánh giá (JSON array URLs)
    
    -- Thống kê
    helpful_count INT DEFAULT 0, -- Số người thấy hữu ích
    
    -- Phản hồi từ admin
    admin_reply TEXT,
    replied_by BIGINT, -- Admin ID
    replied_at TIMESTAMP NULL,
    
    status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (replied_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_reviews_tour_id (tour_id),
    INDEX idx_reviews_user_id (user_id),
    INDEX idx_reviews_status (status),
    INDEX idx_reviews_rating (rating)
);

-- =============================
-- 13. Bảng hình ảnh tour
-- =============================
CREATE TABLE tour_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tour_id BIGINT,
    image_url VARCHAR(255) NOT NULL,
    caption VARCHAR(255),
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_tour_images_tour_id (tour_id)
);

-- =============================
-- 14. Danh sách yêu thích (MỚI)
-- =============================
CREATE TABLE wishlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tour_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (user_id, tour_id),
    INDEX idx_wishlists_user_id (user_id),
    INDEX idx_wishlists_tour_id (tour_id)
);

-- =============================
-- 15. Câu hỏi thường gặp (MỚI)
-- =============================
CREATE TABLE tour_faqs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tour_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_faqs_tour_id (tour_id)
);

-- =============================
-- 16. Đối tượng khách hàng
-- =============================
CREATE TABLE target_audiences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(50)
);

INSERT INTO target_audiences (name, description, icon) VALUES
('Gia đình', 'Phù hợp cho gia đình có trẻ em', '👨‍👩‍👧‍👦'),
('Cặp đôi', 'Lý tưởng cho cặp đôi', '💑'),
('Nhóm bạn', 'Thích hợp cho nhóm bạn đi chơi', '👥'),
('Người cao tuổi', 'Tour nhẹ nhàng cho người cao tuổi', '👴'),
('Du khách solo', 'Phù hợp cho người đi một mình', '🧳'),
('Doanh nghiệp', 'Tour MICE và team building', '🏢');

CREATE TABLE tour_target_audience (
    tour_id BIGINT,
    target_audience_id BIGINT,
    PRIMARY KEY (tour_id, target_audience_id),
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    FOREIGN KEY (target_audience_id) REFERENCES target_audiences(id) ON DELETE CASCADE
);

-- =============================
-- 17. Liên hệ & hỗ trợ
-- =============================
CREATE TABLE contact_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT,
    tour_interest VARCHAR(255),
    status ENUM('New','In_Progress','Resolved','Closed') DEFAULT 'New',
    assigned_to BIGINT, -- Staff ID
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_contact_status (status)
);

-- =============================
-- 18. Thông báo & Logs
-- =============================
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    title VARCHAR(255),
    message TEXT NOT NULL,
    type ENUM('Info','Success','Warning','Error') DEFAULT 'Info',
    link VARCHAR(255), -- Link liên quan
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read)
);

CREATE TABLE logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50), -- Tour, Booking, User...
    entity_id BIGINT,
    old_value TEXT, -- Giá trị cũ (JSON)
    new_value TEXT, -- Giá trị mới (JSON)
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_logs_user_id (user_id),
    INDEX idx_logs_entity (entity_type, entity_id),
    INDEX idx_logs_created_at (created_at)
);

-- =============================
-- 19. Hoạt động người dùng
-- =============================
CREATE TABLE user_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_data TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    page_url VARCHAR(500),
    referer_url VARCHAR(500),
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_activities_user_id (user_id),
    INDEX idx_user_activities_activity_type (activity_type),
    INDEX idx_user_activities_created_at (created_at),
    INDEX idx_user_activities_session_id (session_id),
    INDEX idx_user_activities_ip_address (ip_address)
);

-- =============================
-- 20. Phiên đăng nhập
-- =============================
CREATE TABLE user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logged_out_at TIMESTAMP NULL,
    logout_reason VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions_user_id (user_id),
    INDEX idx_user_sessions_session_id (session_id),
    INDEX idx_user_sessions_is_active (is_active),
    INDEX idx_user_sessions_login_at (login_at),
    INDEX idx_user_sessions_ip_address (ip_address),
    INDEX idx_user_sessions_device_type (device_type),
    INDEX idx_user_sessions_country (country)
);

-- =============================
-- VIEWS - Tính toán rating động
-- =============================

-- View tính rating và review count từ bảng reviews
CREATE VIEW tour_ratings AS
SELECT 
    tour_id,
    COUNT(*) as review_count,
    AVG(rating) as average_rating,
    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star_count,
    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star_count,
    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star_count,
    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star_count,
    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star_count
FROM reviews
WHERE status = 'Approved'
GROUP BY tour_id;

-- View thống kê tour
CREATE VIEW tour_statistics AS
SELECT 
    t.id,
    t.name,
    t.tour_type,
    t.region,
    t.status,
    COUNT(DISTINCT b.id) as total_bookings,
    SUM(CASE WHEN b.payment_status = 'Paid' THEN 1 ELSE 0 END) as paid_bookings,
    SUM(CASE WHEN b.confirmation_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
    COALESCE(tr.average_rating, 0) as average_rating,
    COALESCE(tr.review_count, 0) as review_count,
    t.view_count
FROM tours t
LEFT JOIN bookings b ON t.id = b.tour_id
LEFT JOIN tour_ratings tr ON t.id = tr.tour_id
GROUP BY t.id;

-- =============================
-- TRIGGERS - Tự động cập nhật
-- =============================

-- Trigger tự động giảm available_seats khi có booking mới
DELIMITER //
CREATE TRIGGER after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.schedule_id IS NOT NULL AND NEW.confirmation_status = 'Confirmed' THEN
        UPDATE tour_schedules 
        SET available_seats = available_seats - (NEW.num_adults + NEW.num_children)
        WHERE id = NEW.schedule_id;
    END IF;
END//

-- Trigger tăng lại available_seats khi booking bị hủy
CREATE TRIGGER after_booking_cancel
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF OLD.confirmation_status != 'Cancelled' 
       AND NEW.confirmation_status = 'Cancelled' 
       AND NEW.schedule_id IS NOT NULL THEN
        UPDATE tour_schedules 
        SET available_seats = available_seats + (NEW.num_adults + NEW.num_children)
        WHERE id = NEW.schedule_id;
    END IF;
END//

-- Trigger tự động update view_count
CREATE TRIGGER after_tour_view
AFTER INSERT ON user_activities
FOR EACH ROW
BEGIN
    IF NEW.activity_type = 'TOUR_VIEW' THEN
        UPDATE tours 
        SET view_count = view_count + 1
        WHERE id = CAST(NEW.activity_data AS UNSIGNED);
    END IF;
END//

DELIMITER ;

-- =============================
-- KẾT THÚC CSDL
-- =============================
