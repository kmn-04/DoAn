-- Script tối ưu hóa bảng tours
-- Xóa các cột không cần thiết và cập nhật cấu trúc

-- Backup data trước khi thay đổi
CREATE TABLE tours_backup AS SELECT * FROM tours;

-- Xóa các cột không cần thiết
ALTER TABLE tours DROP COLUMN IF EXISTS min_participants;
ALTER TABLE tours DROP COLUMN IF EXISTS terms_and_policies;
ALTER TABLE tours DROP COLUMN IF EXISTS difficulty_level;
ALTER TABLE tours DROP COLUMN IF EXISTS meta_title;
ALTER TABLE tours DROP COLUMN IF EXISTS meta_description;
ALTER TABLE tours DROP COLUMN IF EXISTS meta_keywords;

-- Cập nhật cột target_audience từ JSON thành ENUM
-- Trước tiên, thêm cột mới
ALTER TABLE tours ADD COLUMN target_audience_new ENUM('FAMILY', 'COUPLE', 'SOLO', 'FRIENDS', 'BUSINESS') DEFAULT 'FAMILY';

-- Cập nhật dữ liệu từ cột cũ sang cột mới (mapping đơn giản)
UPDATE tours SET target_audience_new = 'FAMILY' WHERE target_audience IS NULL OR target_audience = '' OR target_audience LIKE '%Gia đình%';
UPDATE tours SET target_audience_new = 'COUPLE' WHERE target_audience LIKE '%Cặp đôi%';
UPDATE tours SET target_audience_new = 'SOLO' WHERE target_audience LIKE '%Solo%';
UPDATE tours SET target_audience_new = 'FRIENDS' WHERE target_audience LIKE '%Nhóm bạn%';
UPDATE tours SET target_audience_new = 'BUSINESS' WHERE target_audience LIKE '%Công ty%';

-- Xóa cột cũ và đổi tên cột mới
ALTER TABLE tours DROP COLUMN target_audience;
ALTER TABLE tours CHANGE COLUMN target_audience_new target_audience ENUM('FAMILY', 'COUPLE', 'SOLO', 'FRIENDS', 'BUSINESS') DEFAULT 'FAMILY';

-- Cập nhật max_participants default value nếu NULL
UPDATE tours SET max_participants = 50 WHERE max_participants IS NULL;

-- Thêm comment cho các cột
ALTER TABLE tours MODIFY COLUMN target_audience ENUM('FAMILY', 'COUPLE', 'SOLO', 'FRIENDS', 'BUSINESS') DEFAULT 'FAMILY' COMMENT 'Đối tượng khách hàng chính';
ALTER TABLE tours MODIFY COLUMN max_participants INT DEFAULT 50 COMMENT 'Số người tối đa tham gia tour';

-- Tạo index cho các cột thường được query
CREATE INDEX idx_tours_status_featured ON tours(status, is_featured);
CREATE INDEX idx_tours_category_status ON tours(category_id, status);
CREATE INDEX idx_tours_created_at ON tours(created_at);

-- Hiển thị cấu trúc bảng sau khi tối ưu
DESCRIBE tours;
