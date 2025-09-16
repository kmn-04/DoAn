-- ================================
-- MIGRATION: STEP 6 - UPDATE ROLES
-- Date: 2025-01-xx
-- Description: Update role system from ADMIN,USER,CUSTOMER to ADMIN,STAFF,USER
-- ================================

USE doan;

-- Kiểm tra xem step này đã chạy chưa
SELECT COUNT(*) INTO @already_executed FROM migrations WHERE step = 'step_06_update_roles';

-- Chỉ chạy nếu chưa được thực hiện
SET @sql = IF(@already_executed = 0, '
-- Cập nhật existing CUSTOMER users thành USER role
UPDATE users SET role = ''USER'' WHERE role = ''CUSTOMER'';

-- Cập nhật enum definition cho role column
ALTER TABLE users MODIFY COLUMN role ENUM(''ADMIN'', ''STAFF'', ''USER'') NOT NULL DEFAULT ''USER'';

-- Cập nhật sample data với roles mới
-- Update existing users to new role structure
UPDATE users SET role = ''STAFF'' WHERE username = ''user1'';

-- Ghi log migration
INSERT INTO migrations (step, description) VALUES (''step_06_update_roles'', ''Update role system to ADMIN, STAFF, USER'');
', 'SELECT ''STEP 6: Role update already exists'' AS status;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'STEP 6: Role system updated to ADMIN, STAFF, USER' AS status;
