# Migration: Xóa cột display_order

## Mục đích
Xóa cột `display_order` khỏi bảng `categories` và tất cả code liên quan.

## Các thay đổi đã thực hiện:

### 1. Frontend:
- ✅ Xóa cột "Thứ tự" khỏi bảng trong `CategoryManagement.jsx`
- ✅ Xóa trường nhập thứ tự khỏi `CategoryFormModal.jsx`
- ✅ Cập nhật CSS để loại bỏ styles liên quan đến order
- ✅ Xóa function `reorderCategories` khỏi `categoryService.js`

### 2. Backend:
- ✅ Xóa trường `displayOrder` khỏi model `Category.java`
- ✅ Xóa trường `displayOrder` khỏi tất cả DTOs
- ✅ Cập nhật `CategoryService.java` để loại bỏ logic displayOrder
- ✅ Cập nhật `CategoryController.java` để xóa endpoint reorder
- ✅ Xóa file `CategoryReorderRequest.java`
- ✅ Cập nhật `CategoryRepository.java` để xóa queries liên quan đến displayOrder

## Cách chạy migration database:

### Lựa chọn 1: Sử dụng MySQL Command Line
```bash
mysql -u root -p doan < remove_display_order_column.sql
```

### Lựa chọn 2: Sử dụng MySQL Workbench hoặc phpMyAdmin
1. Mở MySQL Workbench/phpMyAdmin
2. Kết nối đến database `doan`
3. Copy và chạy nội dung của file `remove_display_order_column.sql`

### Lựa chọn 3: Chạy trực tiếp SQL
```sql
USE doan;

-- Check if the column exists before attempting to drop it
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'doan'
    AND TABLE_NAME = 'categories'
    AND COLUMN_NAME = 'display_order'
);

-- Drop the column if it exists
SET @sql = IF(@column_exists > 0,
    'ALTER TABLE categories DROP COLUMN display_order;',
    'SELECT "Column display_order does not exist in categories table" AS status;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the column has been removed
SELECT 'display_order column removal completed' AS status;
```

## Kết quả:
- Cột thứ tự đã được xóa hoàn toàn khỏi giao diện quản lý danh mục
- Không còn chức năng drag & drop để sắp xếp thứ tự
- Danh mục sẽ được hiển thị theo thứ tự mặc định (theo tên hoặc ngày tạo)
- Database đã được clean up, xóa cột `display_order`

## Lưu ý:
- Backup database trước khi chạy migration
- Kiểm tra lại frontend sau khi chạy migration để đảm bảo mọi thứ hoạt động bình thường
