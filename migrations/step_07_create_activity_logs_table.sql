-- Create activity_logs table for tracking user activities
-- Step 07: Create Activity Logs Table
-- Date: 2024-09-13

USE tourdu_db;

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    action_type ENUM(
        'LOGIN', 'LOGOUT', 
        'UPDATE_PROFILE', 'CHANGE_PASSWORD',
        'CREATE_BOOKING', 'CONFIRM_BOOKING', 'CANCEL_BOOKING', 'UPDATE_BOOKING',
        'ADD_TO_FAVORITES', 'REMOVE_FROM_FAVORITES', 'VIEW_TOUR',
        'CREATE_USER', 'UPDATE_USER', 'DELETE_USER',
        'CREATE_PARTNER', 'UPDATE_PARTNER', 'DELETE_PARTNER',
        'REPLY_CONTACT', 'SYSTEM_LOGIN', 'EXPORT_DATA', 'IMPORT_DATA'
    ) NOT NULL,
    target_object VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    location VARCHAR(255),
    device VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_activity_logs_user 
        FOREIGN KEY (user_id) REFERENCES users(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
        
    -- Indexes for better performance
    INDEX idx_activity_logs_user_id (user_id),
    INDEX idx_activity_logs_action_type (action_type),
    INDEX idx_activity_logs_created_at (created_at),
    INDEX idx_activity_logs_user_action (user_id, action_type),
    INDEX idx_activity_logs_user_date (user_id, created_at)
);

-- Insert some sample activity logs for existing users
INSERT INTO activity_logs (user_id, action_type, target_object, details, ip_address, location, device, created_at) VALUES
-- Admin user activities
(1, 'LOGIN', 'Hệ thống', 'Đăng nhập vào hệ thống quản trị', '192.168.1.100', 'Hà Nội, Việt Nam', 'Chrome - Windows', '2024-09-13 09:30:00'),
(1, 'CREATE_USER', 'User #5', 'Tạo tài khoản người dùng mới', '192.168.1.100', 'Hà Nội, Việt Nam', 'Chrome - Windows', '2024-09-13 09:45:00'),
(1, 'UPDATE_USER', 'User #3', 'Cập nhật thông tin người dùng', '192.168.1.100', 'Hà Nội, Việt Nam', 'Chrome - Windows', '2024-09-13 10:15:00'),

-- Staff user activities  
(2, 'LOGIN', 'Hệ thống', 'Đăng nhập vào hệ thống', '192.168.1.101', 'TP.HCM, Việt Nam', 'Firefox - Windows', '2024-09-13 08:00:00'),
(2, 'CONFIRM_BOOKING', 'Booking #1256', 'Xác nhận booking cho khách hàng', '192.168.1.101', 'TP.HCM, Việt Nam', 'Firefox - Windows', '2024-09-13 09:58:00'),
(2, 'CREATE_PARTNER', 'Đối tác Khách sạn Periot Grand', 'Tạo mới đối tác khách sạn', '192.168.1.101', 'TP.HCM, Việt Nam', 'Firefox - Windows', '2024-09-13 09:30:00'),
(2, 'REPLY_CONTACT', 'Yêu cầu hỗ trợ #582', 'Trả lời liên hệ từ khách hàng', '192.168.1.101', 'TP.HCM, Việt Nam', 'Firefox - Windows', '2024-09-12 17:20:00'),

-- Regular user activities
(3, 'LOGIN', 'Hệ thống', 'Đăng nhập vào hệ thống', '192.168.1.102', 'Đà Nẵng, Việt Nam', 'Safari - iOS', '2024-09-13 07:30:00'),
(3, 'UPDATE_PROFILE', 'Thông tin cá nhân', 'Đã cập nhật số điện thoại', '192.168.1.102', 'Đà Nẵng, Việt Nam', 'Safari - iOS', '2024-09-11 20:45:00'),
(3, 'ADD_TO_FAVORITES', 'Tour "Khám phá Sapa"', 'Đã thêm tour vào danh sách yêu thích', '192.168.1.102', 'Đà Nẵng, Việt Nam', 'Safari - iOS', '2024-09-12 15:30:00'),
(3, 'CREATE_BOOKING', 'Booking #1250', 'Đã đặt tour mới', '192.168.1.102', 'Đà Nẵng, Việt Nam', 'Safari - iOS', '2024-09-10 11:10:00'),

-- More user activities for testing
(4, 'LOGIN', 'Hệ thống', 'Đăng nhập vào hệ thống', '192.168.1.103', 'Cần Thơ, Việt Nam', 'Chrome - Android', '2024-09-12 16:00:00'),
(4, 'VIEW_TOUR', 'Tour "Du lịch Phú Quốc"', 'Xem chi tiết tour', '192.168.1.103', 'Cần Thơ, Việt Nam', 'Chrome - Android', '2024-09-12 16:15:00'),
(4, 'ADD_TO_FAVORITES', 'Tour "Du lịch Phú Quốc"', 'Thêm tour vào yêu thích', '192.168.1.103', 'Cần Thơ, Việt Nam', 'Chrome - Android', '2024-09-12 16:20:00'),

-- Additional login logs for demonstration
(1, 'LOGIN', 'Hệ thống', 'Đăng nhập vào hệ thống', '192.168.1.100', 'Hà Nội, Việt Nam', 'Chrome - Windows', '2024-09-12 08:30:00'),
(2, 'LOGIN', 'Hệ thống', 'Đăng nhập vào hệ thống', '192.168.1.101', 'TP.HCM, Việt Nam', 'Firefox - Windows', '2024-09-12 09:00:00'),
(3, 'LOGIN', 'Hệ thống', 'Đăng nhập vào hệ thống', '192.168.1.102', 'Đà Nẵng, Việt Nam', 'Safari - iOS', '2024-09-12 10:15:00');

-- Show table info
DESCRIBE activity_logs;

-- Show sample data
SELECT 
    al.id,
    u.full_name as user_name,
    al.action_type,
    al.target_object,
    al.details,
    al.created_at
FROM activity_logs al
JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 10;
