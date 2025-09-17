# Hướng dẫn Import Dữ Liệu Mẫu Tours

## Tổng quan
File này chứa dữ liệu mẫu cho hệ thống quản lý Tours, bao gồm:
- **10 Tours mẫu** với các loại hình du lịch khác nhau
- **Tour Itineraries** (Lịch trình chi tiết theo ngày)
- **Tour Itinerary Partners** (Liên kết với các đối tác)

## Yêu cầu trước khi import

### 1. Cấu trúc Database
Đảm bảo các bảng sau đã được tạo:
```sql
- tours
- tour_itineraries  
- tour_itinerary_partners
- categories (cần có dữ liệu)
- partners (cần có dữ liệu)
```

### 2. Dữ liệu liên quan
Trước khi import tours, cần có:
- **Categories**: Ít nhất 5 categories (id từ 1-5)
- **Partners**: Ít nhất 4 partners (id từ 1-4)

Nếu chưa có, chạy trước:
```bash
# Import categories
mysql -u username -p database_name < setup_categories.sql

# Import partners  
mysql -u username -p database_name < partners_sample_data.sql
```

## Cách import dữ liệu

### Phương pháp 1: MySQL Command Line
```bash
mysql -u [username] -p [database_name] < tours_sample_data.sql
```

### Phương pháp 2: MySQL Workbench
1. Mở MySQL Workbench
2. Kết nối đến database
3. File → Open SQL Script → Chọn `tours_sample_data.sql`
4. Execute (Ctrl+Shift+Enter)

### Phương pháp 3: phpMyAdmin
1. Truy cập phpMyAdmin
2. Chọn database
3. Tab "Import"
4. Choose file → `tours_sample_data.sql`
5. Click "Import"

## Chi tiết dữ liệu mẫu

### Tours được tạo:

| ID | Tên Tour | Loại | Thời gian | Giá (VNĐ) | Trạng thái | Nổi bật |
|----|----------|-------|-----------|-----------|------------|---------|
| 1 | Hạ Long Bay 2N1Đ | Biển đảo | 2 ngày | 2,200,000 | ACTIVE | ✓ |
| 2 | Sapa Trekking 3N2Đ | Phiêu lưu | 3 ngày | 1,500,000 | ACTIVE | ✓ |
| 3 | Phú Quốc Beach 4N3Đ | Biển đảo | 4 ngày | 3,800,000 | ACTIVE | ✓ |
| 4 | Đà Lạt Romantic 3N2Đ | Thành phố | 3 ngày | 1,400,000 | ACTIVE | - |
| 5 | Ninh Bình 2N1Đ | Phiêu lưu | 2 ngày | 1,000,000 | ACTIVE | - |
| 6 | Mekong Delta 2N1Đ | Văn hóa | 2 ngày | 950,000 | ACTIVE | - |
| 7 | Hội An 3N2Đ | Văn hóa | 3 ngày | 1,750,000 | ACTIVE | ✓ |
| 8 | Cao Bằng 3N2Đ | Phiêu lưu | 3 ngày | 1,500,000 | DRAFT | - |
| 9 | Côn Đảo 4N3Đ | Biển đảo | 4 ngày | 5,000,000 | INACTIVE | - |
| 10 | Hà Giang Loop 4N3Đ | Phiêu lưu | 4 ngày | 2,000,000 | DRAFT | - |

### Tính năng bao gồm:
- **Giá gốc và giá khuyến mãi**
- **Mô tả chi tiết và ngắn gọn**
- **Hình ảnh đại diện và gallery**
- **Dịch vụ bao gồm/không bao gồm**
- **Chính sách hủy tour**
- **Điều khoản và điều kiện**
- **Độ khó: EASY, MODERATE, HARD**
- **Trạng thái: ACTIVE, DRAFT, INACTIVE**

### Lịch trình chi tiết:
- **Tour 1 (Hạ Long)**: 2 ngày lịch trình
- **Tour 2 (Sapa)**: 3 ngày lịch trình  
- Các tour khác có thể thêm lịch trình tương tự

### Liên kết đối tác:
- Hotels/Resorts cho chỗ ở
- Restaurants cho bữa ăn
- Transport cho di chuyển

## Xác minh dữ liệu sau khi import

### Kiểm tra số lượng records:
```sql
-- Kiểm tra tours
SELECT COUNT(*) as total_tours FROM tours;

-- Kiểm tra theo trạng thái
SELECT status, COUNT(*) as count 
FROM tours 
GROUP BY status;

-- Kiểm tra tour nổi bật
SELECT COUNT(*) as featured_tours 
FROM tours 
WHERE is_featured = true;

-- Kiểm tra itineraries
SELECT COUNT(*) as total_itineraries FROM tour_itineraries;

-- Kiểm tra partnerships
SELECT COUNT(*) as total_partnerships FROM tour_itinerary_partners;
```

### Kiểm tra thống kê:
```sql
SELECT 
    COUNT(*) as totalTours,
    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as activeTours,
    SUM(CASE WHEN status = 'DRAFT' THEN 1 ELSE 0 END) as draftTours,
    SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END) as inactiveTours,
    SUM(CASE WHEN is_featured = true THEN 1 ELSE 0 END) as featuredTours
FROM tours;
```

## Troubleshooting

### Lỗi thường gặp:

1. **Foreign key constraint fails**
   - Đảm bảo categories và partners đã có dữ liệu
   - Kiểm tra category_id từ 1-5 tồn tại
   - Kiểm tra partner_id từ 1-4 tồn tại

2. **Duplicate entry**
   - Xóa dữ liệu cũ trước khi import:
   ```sql
   DELETE FROM tour_itinerary_partners;
   DELETE FROM tour_itineraries;  
   DELETE FROM tours;
   ```

3. **Character encoding issues**
   - Đảm bảo database và connection sử dụng UTF-8
   ```sql
   SET NAMES utf8mb4;
   ```

### Xóa dữ liệu để import lại:
```sql
-- Xóa theo thứ tự để tránh foreign key issues
DELETE FROM tour_itinerary_partners;
DELETE FROM tour_itineraries;
DELETE FROM tours;

-- Reset auto increment (optional)
ALTER TABLE tours AUTO_INCREMENT = 1;
ALTER TABLE tour_itineraries AUTO_INCREMENT = 1;
ALTER TABLE tour_itinerary_partners AUTO_INCREMENT = 1;
```

## Tùy chỉnh dữ liệu

### Thay đổi giá tour:
```sql
UPDATE tours SET price = price * 1.1 WHERE id > 0; -- Tăng 10%
```

### Cập nhật trạng thái:
```sql
UPDATE tours SET status = 'ACTIVE' WHERE status = 'DRAFT';
```

### Thêm tour mới:
Sử dụng cấu trúc tương tự trong file SQL, thay đổi các giá trị phù hợp.

## Lưu ý quan trọng

1. **Backup database** trước khi import
2. **Test trên môi trường dev** trước khi import production
3. **Kiểm tra dung lượng** hình ảnh và gallery
4. **Validate** các URL hình ảnh có hoạt động
5. **Review** nội dung mô tả phù hợp với thực tế

## Liên hệ hỗ trợ

Nếu gặp vấn đề trong quá trình import, vui lòng:
1. Kiểm tra log lỗi MySQL
2. Xác minh cấu trúc database
3. Kiểm tra quyền user database
4. Đảm bảo đủ dung lượng storage
