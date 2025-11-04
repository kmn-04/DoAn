# 📊 DATABASE INDEXING OPTIMIZATION

## 🎯 Mục tiêu
Tối ưu hóa database bằng cách thêm indexes, giúp:
- Tăng tốc độ query từ **vài giây xuống vài milliseconds**
- Giảm load database server
- Cải thiện trải nghiệm người dùng

---

## 📁 Files đã tạo

1. **`V5__add_database_indexes.sql`** - Migration script thêm tất cả indexes
2. **`CHECK_INDEXES.sql`** - Script kiểm tra và test indexes
3. **`application.yml`** - Đã cập nhật HikariCP connection pool settings

---

## 🚀 HƯỚNG DẪN THỰC HIỆN

### Bước 1: Backup Database (QUAN TRỌNG!)

```bash
# Backup database trước khi thêm indexes
mysqldump -u root -p doan > backup_before_indexing.sql
```

### Bước 2: Chạy Migration Script

**Cách 1: Tự động (khi chạy Spring Boot)**

Spring Boot sẽ tự động chạy migration khi khởi động:

```bash
cd backend
mvn spring-boot:run
```

Log sẽ hiển thị:
```
Migrating schema `doan` to version "5 - add database indexes"
Successfully applied 1 migration to schema `doan`
```

**Cách 2: Chạy thủ công (nếu cần)**

```bash
# Kết nối MySQL
mysql -u root -p

# Chọn database
USE doan;

# Chạy migration script
SOURCE backend/src/main/resources/db/migration/V5__add_database_indexes.sql;
```

### Bước 3: Kiểm tra Indexes đã được tạo

```bash
# Kết nối MySQL
mysql -u root -p doan

# Chạy script kiểm tra
SOURCE backend/src/main/resources/db/migration/CHECK_INDEXES.sql;
```

Hoặc kiểm tra nhanh:

```sql
-- Xem indexes của bảng tours
SHOW INDEX FROM tours;

-- Xem indexes của bảng bookings
SHOW INDEX FROM bookings;

-- Đếm tổng số indexes
SELECT TABLE_NAME, COUNT(DISTINCT INDEX_NAME) as INDEX_COUNT
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'doan'
GROUP BY TABLE_NAME
ORDER BY INDEX_COUNT DESC;
```

### Bước 4: Test Hiệu Suất

**Test với EXPLAIN:**

```sql
-- Test query bookings by user (NÊN dùng index)
EXPLAIN SELECT * FROM bookings WHERE user_id = 1;

-- Output mong đợi:
-- type: ref (TỐT)
-- key: idx_bookings_user_id (đang dùng index)
-- rows: ~10-50 (ít rows được scan)

-- Nếu output là:
-- type: ALL (XẤU)
-- key: NULL (KHÔNG dùng index)
-- rows: 100000 (scan toàn bộ table)
-- => CẦN KIỂM TRA LẠI
```

**Benchmark thực tế:**

```sql
-- Bật profiling
SET profiling = 1;

-- Chạy query
SELECT * FROM bookings WHERE user_id = 1;
SELECT * FROM tours WHERE status = 'ACTIVE';

-- Xem thời gian thực hiện
SHOW PROFILES;

-- Tắt profiling
SET profiling = 0;
```

### Bước 5: Update Statistics

Sau khi thêm indexes, cập nhật statistics để MySQL tối ưu query plan:

```sql
ANALYZE TABLE tours;
ANALYZE TABLE bookings;
ANALYZE TABLE payments;
ANALYZE TABLE reviews;
ANALYZE TABLE users;
```

---

## 📊 KẾT QUẢ MONG ĐỢI

### Trước khi có Indexes:

| Query | Thời gian | Rows scanned |
|-------|-----------|--------------|
| Danh sách tours | 500ms - 2s | 10,000+ |
| Bookings của user | 300ms - 1s | 100,000+ |
| Search tours | 1s - 3s | 10,000+ |
| Reviews của tour | 200ms - 500ms | 50,000+ |

### Sau khi có Indexes:

| Query | Thời gian | Rows scanned | Cải thiện |
|-------|-----------|--------------|-----------|
| Danh sách tours | 20ms - 50ms | 100-500 | **10-40x nhanh hơn** |
| Bookings của user | 10ms - 30ms | 10-50 | **30-100x nhanh hơn** |
| Search tours | 50ms - 100ms | 100-1000 | **20-60x nhanh hơn** |
| Reviews của tour | 10ms - 20ms | 10-100 | **20-50x nhanh hơn** |

---

## 🔍 KIỂM TRA INDEX HOẠT ĐỘNG

### Cách 1: Dùng EXPLAIN

```sql
EXPLAIN SELECT * FROM bookings WHERE user_id = 1;
```

**Các trường quan trọng:**

- **type**: Loại scan
  - ✅ `const`, `eq_ref`, `ref` - TỐT (dùng index)
  - ⚠️ `range` - Khá tốt (index range scan)
  - ❌ `index`, `ALL` - XẤU (full scan)

- **key**: Index được sử dụng
  - ✅ Có tên index - TỐT
  - ❌ `NULL` - XẤU (không dùng index)

- **rows**: Số rows ước tính scan
  - ✅ Ít rows - TỐT
  - ❌ Nhiều rows - XẤU

### Cách 2: Dùng EXPLAIN ANALYZE (MySQL 8.0+)

```sql
EXPLAIN ANALYZE 
SELECT * FROM bookings WHERE user_id = 1;
```

Sẽ hiển thị:
- Actual time (thời gian thực tế)
- Actual rows (số rows thực tế)
- Loops (số lần lặp)

---

## 📈 INDEXES ĐÃ TẠO

### Tours (15 indexes)
- `idx_tours_status` - Lọc theo trạng thái
- `idx_tours_slug` - Tìm tour theo slug
- `idx_tours_category_id` - Lọc theo danh mục
- `idx_tours_price` - Lọc theo giá
- `idx_tours_status_featured` - Composite: trạng thái + nổi bật
- ... và nhiều hơn

### Bookings (13 indexes)
- `idx_bookings_user_id` - Bookings của user
- `idx_bookings_tour_id` - Bookings của tour
- `idx_bookings_booking_code` - Tìm theo mã booking
- `idx_bookings_user_status` - Composite: user + status
- ... và nhiều hơn

### Payments (9 indexes)
- `idx_payments_booking_id` - Payment của booking
- `idx_payments_payment_code` - Tìm theo mã payment
- `idx_payments_status` - Lọc theo trạng thái
- ... và nhiều hơn

### Reviews (7 indexes)
- `idx_reviews_tour_id` - Reviews của tour
- `idx_reviews_user_id` - Reviews của user
- `idx_reviews_rating` - Lọc theo rating
- ... và nhiều hơn

**Tổng cộng: 100+ indexes** cho toàn bộ database

---

## 🔧 TROUBLESHOOTING

### Vấn đề 1: Migration không chạy

**Nguyên nhân:** Flyway/Liquibase đã chạy version cũ hơn

**Giải pháp:**
```sql
-- Kiểm tra flyway_schema_history
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC;

-- Nếu V5 chưa có, chạy thủ công migration script
SOURCE backend/src/main/resources/db/migration/V5__add_database_indexes.sql;
```

### Vấn đề 2: Index đã tồn tại

**Lỗi:** `Duplicate key name 'idx_tours_status'`

**Giải pháp:** Script đã có `IF NOT EXISTS`, nhưng nếu vẫn lỗi:
```sql
-- Xóa index cũ
DROP INDEX idx_tours_status ON tours;

-- Tạo lại
CREATE INDEX idx_tours_status ON tours(status);
```

### Vấn đề 3: Query vẫn chậm sau khi thêm index

**Nguyên nhân:**
1. Statistics chưa update
2. Query không match index pattern
3. Data quá ít (MySQL chọn full scan)

**Giải pháp:**
```sql
-- 1. Update statistics
ANALYZE TABLE tours;

-- 2. Force dùng index (nếu cần)
SELECT * FROM tours FORCE INDEX (idx_tours_status) WHERE status = 'ACTIVE';

-- 3. Kiểm tra query plan
EXPLAIN SELECT * FROM tours WHERE status = 'ACTIVE';
```

### Vấn đề 4: Database chậm khi tạo index

**Nguyên nhân:** Tạo index trên bảng lớn mất thời gian

**Giải pháp:**
- Chạy vào lúc ít traffic (đêm khuya)
- Tạo index `ONLINE` (MySQL 5.6+):
```sql
CREATE INDEX idx_tours_status ON tours(status) ALGORITHM=INPLACE, LOCK=NONE;
```

---

## 📝 LƯU Ý QUAN TRỌNG

### ✅ NÊNCẦN:
- Backup database trước khi thêm indexes
- Test indexes trên môi trường dev trước
- Monitor query performance sau khi deploy
- Update statistics định kỳ (hàng tuần)

### ❌ KHÔNG NÊN:
- Tạo quá nhiều indexes trên 1 bảng (giảm INSERT/UPDATE performance)
- Tạo index cho cột có ít giá trị duy nhất (boolean, enum với 2-3 values)
- Tạo duplicate indexes (2 indexes giống nhau)

### ⚠️ TRADE-OFFS:
- **Ưu điểm:** SELECT nhanh hơn 10-100 lần
- **Nhược điểm:** INSERT/UPDATE/DELETE chậm hơn 5-10% (phải update indexes)
- **Dung lượng:** Indexes chiếm thêm 20-30% disk space

Với ứng dụng Tour Booking (nhiều SELECT, ít INSERT), trade-off này **RẤT ĐÁNG GIÁ**!

---

## 🎓 HỌC THÊM

### Tài liệu tham khảo:
- [MySQL Indexing Best Practices](https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html)
- [EXPLAIN Output Format](https://dev.mysql.com/doc/refman/8.0/en/explain-output.html)
- [HikariCP Configuration](https://github.com/brettwooldridge/HikariCP#configuration-knobs-baby)

### Tools hữu ích:
- **MySQL Workbench** - Visual EXPLAIN
- **pt-query-digest** - Phân tích slow queries
- **MySQLTuner** - Đề xuất tối ưu database

---

## ✅ CHECKLIST

- [ ] Backup database
- [ ] Chạy migration V5 (thêm indexes)
- [ ] Kiểm tra indexes đã được tạo
- [ ] Test query với EXPLAIN
- [ ] Benchmark performance
- [ ] Update statistics (ANALYZE TABLE)
- [ ] Monitor application performance
- [ ] Document kết quả

---

**Hoàn thành:** Database Indexing Optimization ✅  
**Tác động:** Tăng tốc độ truy vấn 10-100 lần  
**Chi phí:** ~5-10% chậm hơn khi INSERT/UPDATE, +20-30% disk space  
**Đánh giá:** **Rất đáng giá** cho ứng dụng Tour Booking!

