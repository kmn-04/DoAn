# 📊 TÀI LIỆU THAY ĐỔI CSDL

## 🎯 Mục tiêu
Tái cấu trúc CSDL để:
- ✅ Sửa logic sai (categories là theme chứ không phải location)
- ✅ Bổ sung đầy đủ các bảng và trường cần thiết
- ✅ Tách rời trách nhiệm rõ ràng giữa các bảng
- ✅ Tối ưu performance với indexes và views

---

## 🔄 DANH SÁCH THAY ĐỔI

### 1. ✅ **Bảng `categories` - THAY ĐỔI HOÀN TOÀN**

#### **Trước đây (SAI):**
```sql
- Du lịch miền Bắc (OK)
- Du lịch miền Trung (OK)
- Du lịch miền Nam (OK)
- Du lịch Nhật Bản ❌ (Đây là LOCATION, không phải category!)
- Du lịch Hàn Quốc ❌
- Du lịch Châu Á ❌
```

#### **Bây giờ (ĐÚNG):**
```sql
Categories theo THEME/LOẠI HÌNH du lịch:
1. Du lịch biển đảo 🏖️
2. Du lịch núi rừng ⛰️
3. Du lịch văn hóa 🏛️
4. Du lịch tâm linh 🙏
5. Du lịch nghỉ dưỡng 💆
6. Du lịch khám phá 🧭
7. Du lịch ẩm thực 🍜
8. Du lịch mạo hiểm 🪂
9. Du lịch MICE 🎯
10. Du lịch cao cấp 💎
```

#### **Thêm trường mới:**
- `icon VARCHAR(100)` - Icon emoji cho category
- `parent_id BIGINT` - Tạo sub-category (tree structure)
- `display_order INT` - Thứ tự hiển thị
- `is_featured BOOLEAN` - Category nổi bật

---

### 2. ✅ **Bảng `tours` - BỔ SUNG LỚN**

#### **XÓA các trường:**
- ~~`continent VARCHAR(20)`~~ - Có thể tính từ `country_code`
- ~~`rating DECIMAL(2,1)`~~ - Tính từ view `tour_ratings`
- ~~`review_count INT`~~ - Tính từ view `tour_ratings`

#### **SỬA logic trường:**
- ~~`location VARCHAR(100)`~~ → **TÁCH THÀNH:**
  - `departure_location VARCHAR(100)` - Điểm khởi hành
  - `destination VARCHAR(255)` - Điểm đến chính
  - `destinations TEXT` - JSON array các điểm đến

#### **THÊM trường mới (27 trường):**

**Giá cả:**
- `child_price DECIMAL(12,2)` - Giá trẻ em
- `infant_price DECIMAL(12,2)` - Giá trẻ nhỏ

**Số lượng:**
- `min_people INT` - Số người tối thiểu

**Địa điểm:**
- `departure_location VARCHAR(100)` - Điểm khởi hành
- `destination VARCHAR(255)` - Điểm đến
- `destinations TEXT` - Các điểm (JSON)
- `region VARCHAR(50)` - Vùng: "Miền Bắc", "Đông Nam Á"
- `country VARCHAR(100)` - Quốc gia đầy đủ

**Phương tiện & dịch vụ:**
- `transportation VARCHAR(100)` - Phương tiện
- `accommodation VARCHAR(100)` - Loại khách sạn
- `meals_included VARCHAR(100)` - Bữa ăn
- `included_services TEXT` - Dịch vụ bao gồm (JSON)
- `excluded_services TEXT` - Dịch vụ không bao gồm (JSON)

**Visa:**
- `visa_info TEXT` - Thông tin visa chi tiết

**Chính sách & ghi chú:**
- `cancellation_policy TEXT` - Chính sách hủy
- `note TEXT` - Ghi chú quan trọng
- `suitable_for VARCHAR(255)` - Phù hợp với

**Nội dung:**
- `highlights TEXT` - Điểm nhấn (JSON array)

**Thống kê:**
- `view_count INT` - Số lượt xem

**Status:**
- `status` → Thêm `'Sold_Out'` vào ENUM

---

### 3. ✅ **Bảng `tour_schedules` - BẢNG MỚI (QUAN TRỌNG)**

**Tại sao cần:**
- 1 tour có thể có nhiều lịch khởi hành
- Mỗi lịch có số chỗ riêng, giá riêng
- Quản lý available seats tự động

**Cấu trúc:**
```sql
- id
- tour_id
- departure_date DATE
- return_date DATE
- total_seats INT
- available_seats INT
- adult_price, child_price (có thể khác giá cơ bản)
- status (Available, Full, Cancelled, Completed)
```

**Trigger tự động:**
- Giảm `available_seats` khi có booking mới
- Tăng lại khi booking bị hủy

---

### 4. ✅ **Bảng `tour_prices` - BẢNG MỚI**

**Tại sao cần:**
- Giá thay đổi theo mùa (cao điểm, thấp điểm)
- Giá khác nhau cho Adult/Child/Infant
- Giá phụ thu phòng đơn

**Cấu trúc:**
```sql
- tour_id
- price_type (Adult, Child, Infant, Single_Supplement)
- base_price, season_price
- valid_from, valid_to DATE
```

---

### 5. ✅ **Bảng `bookings` - THAY ĐỔI LỚN**

#### **TÁCH `status` thành 2 trường:**

**Trước:**
```sql
status ENUM('Pending','Confirmed','Paid','Cancelled','Completed')
```
❌ **Vấn đề:** Gộp cả xác nhận + thanh toán → khó quản lý!

**Sau:**
```sql
confirmation_status ENUM('Pending','Confirmed','Cancelled','Rejected')
payment_status ENUM('Unpaid','Partially_Paid','Paid','Refunded')
```
✅ **Lợi ích:** Tách biệt rõ ràng!

#### **THÊM trường mới (12 trường):**

**Thông tin người đặt:**
- `customer_name VARCHAR(150)` - Có thể khác user
- `customer_email VARCHAR(150)`
- `customer_phone VARCHAR(20)`
- `customer_address VARCHAR(255)`

**Link đến lịch:**
- `schedule_id BIGINT` - Link đến `tour_schedules`

**Số lượng:**
- `num_infants INT` - Số trẻ nhỏ

**Giá chi tiết:**
- `unit_price DECIMAL(12,2)` - Giá đơn vị
- `discount_amount DECIMAL(12,2)` - Số tiền giảm
- `final_amount DECIMAL(12,2)` - Số tiền cuối

**Hủy booking:**
- `cancellation_reason TEXT`
- `cancelled_by BIGINT` - User ID
- `cancelled_at TIMESTAMP`

---

### 6. ✅ **Bảng `booking_participants` - BẢNG MỚI (QUAN TRỌNG)**

**Tại sao cần:**
- Lưu thông tin TỪNG hành khách (CMND, Passport...)
- Cần cho tour quốc tế (làm visa, xuất vé máy bay)
- Yêu cầu đặc biệt mỗi người (ăn chay, dị ứng...)

**Cấu trúc:**
```sql
- booking_id
- full_name, gender, dob
- id_number, id_type (CMND/Passport)
- nationality
- participant_type (Adult/Child/Infant)
- special_requirements TEXT
```

---

### 7. ✅ **Bảng `payments` - BỔ SUNG**

**THÊM trường mới (10 trường):**

**Mã thanh toán:**
- `payment_code VARCHAR(100)` - Mã nội bộ
- `payment_provider VARCHAR(50)` - MoMo, VNPay...
- `provider_transaction_id VARCHAR(200)` - Mã từ provider

**Thời gian:**
- `paid_at TIMESTAMP`
- `refunded_at TIMESTAMP`

**Hoàn tiền:**
- `refund_amount DECIMAL(12,2)`
- `refund_reason TEXT`

**Ghi chú:**
- `payment_note TEXT`

**Status:**
- Thêm `'Cancelled'` vào ENUM

---

### 8. ✅ **Bảng `reviews` - BỔ SUNG**

**THÊM trường mới (6 trường):**

**Hình ảnh:**
- `images TEXT` - JSON array URLs

**Thống kê:**
- `helpful_count INT` - Số người thấy hữu ích

**Phản hồi admin:**
- `admin_reply TEXT`
- `replied_by BIGINT` - Admin ID
- `replied_at TIMESTAMP`

**Từ chối:**
- `rejection_reason TEXT`

---

### 9. ✅ **Bảng `tour_itineraries` - BỔ SUNG**

**THÊM trường mới (5 trường):**

- `location VARCHAR(100)` - Địa điểm ngày này
- `activities TEXT` - Hoạt động (JSON array)
- `meals VARCHAR(100)` - Bữa ăn
- `accommodation VARCHAR(255)` - Nơi nghỉ
- `images TEXT` - Hình ảnh (JSON array)

---

### 10. ✅ **Bảng `wishlists` - BẢNG MỚI**

**Tại sao cần:**
- User lưu tour yêu thích
- Gửi thông báo khi tour giảm giá

**Cấu trúc:**
```sql
- user_id
- tour_id
- created_at
UNIQUE (user_id, tour_id)
```

---

### 11. ✅ **Bảng `tour_faqs` - BẢNG MỚI**

**Tại sao cần:**
- Câu hỏi thường gặp cho TỪNG tour
- Giảm support workload

**Cấu trúc:**
```sql
- tour_id
- question TEXT
- answer TEXT
- display_order INT
- is_active BOOLEAN
```

---

### 12. ✅ **Bảng `promotions` - BỔ SUNG**

**THÊM trường mới (7 trường):**

- `name VARCHAR(150)` - Tên chương trình
- `max_discount DECIMAL(12,2)` - Giảm tối đa
- `min_order_amount DECIMAL(12,2)` - Đơn tối thiểu
- `used_count INT` - Số lần đã dùng
- `per_user_limit INT` - Giới hạn mỗi user
- `applicable_tours TEXT` - Tour áp dụng (JSON)
- `type` → Thêm `'Free_Service'` vào ENUM

---

### 13. ✅ **Bảng `partners` - BỔ SUNG**

**THÊM trường mới (6 trường):**

- `email VARCHAR(150)`
- `website VARCHAR(255)`
- `description TEXT`
- `rating DECIMAL(2,1)`
- `status ENUM`
- `type` → Thêm `'Insurance'`, `'Other'`

---

### 14. ✅ **Bảng `tour_images` - BỔ SUNG**

**THÊM trường mới (3 trường):**

- `caption VARCHAR(255)` - Mô tả ảnh
- `display_order INT` - Thứ tự
- `is_primary BOOLEAN` - Ảnh chính

---

### 15. ✅ **Bảng `target_audiences` - CẢI TIẾN**

**THÊM data mặc định:**
```sql
- Gia đình 👨‍👩‍👧‍👦
- Cặp đôi 💑
- Nhóm bạn 👥
- Người cao tuổi 👴
- Du khách solo 🧳
- Doanh nghiệp 🏢
```

**THÊM trường:**
- `description VARCHAR(255)`
- `icon VARCHAR(50)`

---

### 16. ✅ **Bảng `contact_requests` - BỔ SUNG**

**THÊM trường mới (2 trường):**

- `assigned_to BIGINT` - Staff phụ trách
- `admin_note TEXT` - Ghi chú nội bộ

**SỬA status:**
- `'In-progress'` → `'In_Progress'` (chuẩn SQL)

---

### 17. ✅ **Bảng `notifications` - BỔ SUNG**

**THÊM trường mới (3 trường):**

- `title VARCHAR(255)` - Tiêu đề
- `type ENUM('Info','Success','Warning','Error')`
- `link VARCHAR(255)` - Link liên quan

---

### 18. ✅ **Bảng `logs` - BỔ SUNG**

**THÊM trường mới (5 trường):**

- `entity_type VARCHAR(50)` - Tour, Booking, User...
- `entity_id BIGINT`
- `old_value TEXT` - JSON giá trị cũ
- `new_value TEXT` - JSON giá trị mới
- `ip_address VARCHAR(45)`
- `user_agent TEXT`

---

### 19. ✅ **Bảng `users` - BỔ SUNG**

**THÊM trường mới (1 trường):**

- `gender ENUM('Male','Female','Other')`

**SỬA status:**
- Thêm `'Banned'` vào ENUM

---

## 📊 VIEWS - Tính toán động

### **View `tour_ratings`**
```sql
- tour_id
- review_count
- average_rating
- five_star_count, four_star_count, three_star_count...
```
✅ **Lợi ích:** Không lưu rating cứng trong bảng `tours` nữa!

### **View `tour_statistics`**
```sql
- Total bookings, paid bookings, cancelled bookings
- Average rating, review count
- View count
```
✅ **Lợi ích:** Thống kê tổng hợp real-time!

---

## ⚡ TRIGGERS - Tự động hóa

### **1. `after_booking_insert`**
- Tự động **giảm `available_seats`** khi có booking mới

### **2. `after_booking_cancel`**
- Tự động **tăng lại `available_seats`** khi booking bị hủy

### **3. `after_tour_view`**
- Tự động **tăng `view_count`** khi user xem tour

---

## 📈 INDEXES - Tối ưu performance

**Đã thêm 50+ indexes cho:**
- Các trường thường dùng trong WHERE, JOIN
- Các trường dùng cho sort, filter
- Các foreign keys
- Fulltext search cho `tours.name` và `description`

---

## 🔄 MIGRATION PLAN

### **Bước 1: Backup**
```bash
mysqldump doan > backup_before_refactor.sql
```

### **Bước 2: Tạo database mới**
```sql
CREATE DATABASE doan_v2;
USE doan_v2;
SOURCE CSDL-REFACTORED.sql;
```

### **Bước 3: Migrate data**
Chạy script `MIGRATION-DATA.sql` (sẽ tạo riêng)

### **Bước 4: Update backend code**
- Update tất cả Entity classes
- Update DTOs
- Update Services
- Update Controllers

### **Bước 5: Test**
- Test toàn bộ chức năng
- Verify data integrity

### **Bước 6: Deploy**
- Rename `doan` → `doan_old`
- Rename `doan_v2` → `doan`
- Deploy backend mới

---

## 📋 CHECKLIST

### **CSDL:**
- [x] Sửa `categories` từ location → theme
- [x] Thêm bảng `tour_schedules`
- [x] Thêm bảng `tour_prices`
- [x] Thêm bảng `booking_participants`
- [x] Thêm bảng `wishlists`
- [x] Thêm bảng `tour_faqs`
- [x] Tách `bookings.status` thành 2 trường
- [x] Xóa `tours.rating` và `tours.review_count`
- [x] Thêm 70+ trường mới
- [x] Tạo Views và Triggers

### **Backend (TODO):**
- [ ] Update Entity classes (20 classes)
- [ ] Update DTOs (30+ DTOs)
- [ ] Update Services
- [ ] Update Repositories
- [ ] Update Controllers
- [ ] Add new APIs cho các bảng mới
- [ ] Update migration scripts

### **Frontend (TODO):**
- [ ] Update category filters
- [ ] Add schedule selection
- [ ] Add participant form
- [ ] Update booking flow
- [ ] Add wishlist feature
- [ ] Add FAQ section
- [ ] Update review display

---

## 🎉 KẾT QUẢ

**CSDL cũ:**
- 19 bảng
- ~150 trường
- Nhiều logic sai
- Thiếu nhiều tính năng

**CSDL mới:**
- 25 bảng (+6 bảng mới)
- ~250 trường (+100 trường)
- Logic đúng, chuẩn
- Đầy đủ tính năng pro

---

## 📞 Support

Nếu có thắc mắc về CSDL mới, liên hệ:
- Document: `CSDL-REFACTORED.sql`
- Changes: `CSDL-CHANGES.md`
- Migration: `MIGRATION-DATA.sql` (sẽ tạo)
