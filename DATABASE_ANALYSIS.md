# Phân Tích Cơ Sở Dữ Liệu - Hệ Thống Đặt Tour Du Lịch

## 📊 Tổng Quan
- **Tổng số bảng**: 33 bảng
- **Engine**: InnoDB
- **Character Set**: utf8mb4_unicode_ci
- **Mục đích**: Hệ thống đặt tour du lịch trong nước và quốc tế

---

## 🗂️ Phân Loại Bảng Theo Chức Năng

### 1. **BẢNG CORE - QUẢN LÝ NGƯỜI DÙNG & XÁC THỰC**

#### `users` - Quản lý người dùng
- **Mục đích**: Lưu trữ thông tin người dùng (admin, staff, customer)
- **Trường quan trọng**: 
  - `role_id` (FK → roles)
  - `status` (PENDING, ACTIVE, INACTIVE, BANNED)
  - `email_verified_at`, `gender`, `dob`
- **Đánh giá**: ✅ **Tốt** - Có đầy đủ thông tin cần thiết

#### `roles` - Phân quyền
- **Mục đích**: Định nghĩa vai trò (ADMIN, STAFF, USER)
- **Đánh giá**: ✅ **Tốt** - Cần thiết cho hệ thống phân quyền

#### `blacklisted_tokens` - Quản lý token bị cấm
- **Mục đích**: Lưu JWT token đã logout để bảo mật
- **Trường quan trọng**: `token`, `expires_at`, `reason`
- **Đánh giá**: ✅ **Tốt** - Bảo mật tốt

#### `refresh_tokens` - Token làm mới
- **Mục đích**: Quản lý refresh token cho JWT
- **Đánh giá**: ✅ **Tốt** - Cần thiết cho authentication

#### `email_verification_tokens` - Xác thực email
- **Mục đích**: Lưu token xác thực email
- **Đánh giá**: ✅ **Tốt** - Cần thiết cho xác thực

---

### 2. **BẢNG TOUR & SẢN PHẨM**

#### `tours` - Thông tin tour
- **Mục đích**: Lưu trữ thông tin tour du lịch
- **Trường quan trọng**:
  - `tour_type` (DOMESTIC, INTERNATIONAL)
  - `category_id` (FK → categories)
  - `country_id` (FK → countries)
  - `average_rating`, `review_count` (cache)
- **Đánh giá**: ✅ **Rất tốt** - Có đầy đủ thông tin, hỗ trợ cả tour trong nước và quốc tế

#### `categories` - Danh mục tour
- **Mục đích**: Phân loại tour (du lịch biển, mạo hiểm, văn hóa...)
- **Đánh giá**: ✅ **Tốt** - Cần thiết

#### `countries` - Quốc gia
- **Mục đích**: Quản lý danh sách quốc gia
- **Đánh giá**: ✅ **Tốt** - Cần thiết cho tour quốc tế

#### `tour_schedules` - Lịch trình tour
- **Mục đích**: Lưu các ngày khởi hành của tour
- **Trường quan trọng**: `departure_date`, `available_slots`
- **Đánh giá**: ✅ **Tốt** - Cần thiết

#### `tour_prices` - Giá tour
- **Mục đích**: Quản lý giá theo loại khách (adult, child, infant)
- **Đánh giá**: ✅ **Tốt** - Linh hoạt

#### `tour_images` - Hình ảnh tour
- **Mục đích**: Lưu trữ hình ảnh tour
- **Đánh giá**: ✅ **Tốt** - Cần thiết

#### `tour_itineraries` - Lịch trình chi tiết
- **Mục đích**: Lưu lịch trình từng ngày của tour
- **Đánh giá**: ✅ **Tốt** - Cần thiết

#### `tour_faqs` - Câu hỏi thường gặp
- **Mục đích**: FAQ cho từng tour
- **Đánh giá**: ✅ **Tốt** - Hữu ích

#### `target_audiences` - Đối tượng mục tiêu
- **Mục đích**: Phân loại đối tượng (gia đình, cặp đôi, nhóm...)
- **Đánh giá**: ✅ **Tốt** - Hữu ích

#### `tour_target_audience` - Liên kết tour-đối tượng
- **Mục đích**: Bảng liên kết many-to-many
- **Đánh giá**: ✅ **Tốt** - Cần thiết

---

### 3. **BẢNG BOOKING & THANH TOÁN**

#### `bookings` - Đặt tour
- **Mục đích**: Lưu thông tin đặt tour
- **Trường quan trọng**:
  - `booking_code` (unique)
  - `confirmation_status` (PENDING, CONFIRMED, CANCELLED...)
  - `payment_status` (PAID, UNPAID, REFUNDED...)
  - `reminder_sent`, `reminder_sent_at` (nhắc nhở)
- **Đánh giá**: ✅ **Rất tốt** - Có đầy đủ thông tin và tính năng nhắc nhở

#### `booking_participants` - Thông tin người tham gia
- **Mục đích**: Lưu thông tin chi tiết người tham gia tour
- **Đánh giá**: ✅ **Tốt** - Cần thiết

#### `booking_modifications` - Chỉnh sửa booking
- **Mục đích**: Theo dõi các thay đổi booking
- **Đánh giá**: ✅ **Tốt** - Audit trail tốt

#### `payments` - Thanh toán
- **Mục đích**: Lưu thông tin thanh toán
- **Trường quan trọng**: `payment_method`, `status`, `vnpay_transaction_id`
- **Đánh giá**: ✅ **Tốt** - Hỗ trợ VnPay

---

### 4. **BẢNG HỦY TOUR & CHÍNH SÁCH**

#### `booking_cancellations` - Hủy tour
- **Mục đích**: Quản lý việc hủy tour
- **Trường quan trọng**:
  - `reason_category` (PERSONAL_EMERGENCY, MEDICAL_EMERGENCY...)
  - `refund_status` (PENDING, PROCESSING, COMPLETED...)
  - `is_medical_emergency`, `is_weather_related`, `is_force_majeure`
- **Đánh giá**: ✅ **Rất tốt** - Chi tiết và linh hoạt

#### `cancellation_policies` - Chính sách hủy
- **Mục đích**: Định nghĩa chính sách hủy tour
- **Đánh giá**: ✅ **Tốt** - Cần thiết

---

### 5. **BẢNG KHUYẾN MÃI & MARKETING**

#### `promotions` - Khuyến mãi
- **Mục đích**: Quản lý mã giảm giá
- **Trường quan trọng**: `discount_type`, `discount_value`, `usage_limit`
- **Đánh giá**: ✅ **Tốt** - Linh hoạt

#### `banners` - Banner quảng cáo
- **Mục đích**: Quản lý banner trên trang chủ
- **Trường quan trọng**: `display_order`, `is_active`, `start_date`, `end_date`
- **Đánh giá**: ✅ **Tốt** - Có thể lên lịch hiển thị

---

### 6. **BẢNG ĐÁNH GIÁ & TƯƠNG TÁC**

#### `reviews` - Đánh giá tour
- **Mục đích**: Lưu đánh giá của khách hàng
- **Trường quan trọng**: `rating`, `status`, `admin_reply`, `helpful_count`
- **Đánh giá**: ✅ **Rất tốt** - Có admin reply và like system

#### `wishlists` - Danh sách yêu thích
- **Mục đích**: Lưu tour yêu thích của user
- **Đánh giá**: ✅ **Tốt** - Cần thiết

---

### 7. **BẢNG ĐỐI TÁC**

#### `partners` - Đối tác
- **Mục đích**: Quản lý thông tin đối tác
- **Trường quan trọng**: `business_type`, `status`, `contact_info`
- **Đánh giá**: ✅ **Tốt** - Cần thiết cho mô hình B2B

#### `partner_images` - Hình ảnh đối tác
- **Mục đích**: Lưu hình ảnh đối tác
- **Đánh giá**: ✅ **Tốt** - Cần thiết

---

### 8. **BẢNG LIÊN HỆ & HỖ TRỢ**

#### `contact_requests` - Yêu cầu liên hệ
- **Mục đích**: Lưu yêu cầu liên hệ và đăng ký đối tác
- **Trường quan trọng**: `subject`, `tour_interest`, `status`
- **Đánh giá**: ✅ **Tốt** - Đa mục đích (liên hệ + đối tác)

---

### 9. **BẢNG THÔNG BÁO & LOG**

#### `notifications` - Thông báo
- **Mục đích**: Gửi thông báo cho user
- **Trường quan trọng**: `type`, `is_read`, `link`
- **Đánh giá**: ✅ **Tốt** - Cần thiết

#### `logs` - Log hệ thống
- **Mục đích**: Ghi log hoạt động
- **Đánh giá**: ✅ **Tốt** - Cần thiết cho debug

#### `user_activities` - Hoạt động user
- **Mục đích**: Theo dõi hoạt động user
- **Đánh giá**: ✅ **Tốt** - Analytics

#### `user_sessions` - Phiên đăng nhập
- **Mục đích**: Quản lý session
- **Đánh giá**: ✅ **Tốt** - Bảo mật

---

### 10. **BẢNG CẤU HÌNH**

#### `system_settings` - Cài đặt hệ thống
- **Mục đích**: Lưu cấu hình hệ thống
- **Đánh giá**: ✅ **Tốt** - Cần thiết

---

## 🔍 **ĐÁNH GIÁ TỔNG QUAN**

### ✅ **ĐIỂM MẠNH**

1. **Thiết kế toàn diện**: Bao phủ đầy đủ các chức năng của hệ thống đặt tour
2. **Bảo mật tốt**: Có blacklisted tokens, refresh tokens, email verification
3. **Linh hoạt**: Hỗ trợ cả tour trong nước và quốc tế
4. **Audit trail**: Có logs, user activities, booking modifications
5. **Tính năng nâng cao**: 
   - Hệ thống đánh giá với admin reply
   - Chính sách hủy linh hoạt
   - Nhắc nhở booking
   - Cache rating và review count
6. **Quan hệ tốt**: Foreign keys được thiết kế hợp lý
7. **Indexing**: Có đầy đủ index cho performance

### ⚠️ **ĐIỂM CẦN LƯU Ý**

1. **Không có bảng nào không phù hợp** - Tất cả đều cần thiết
2. **Trùng lặp giá cả**:
   - `tours.price`, `tours.child_price`, `tours.infant_price` **TRÙNG LẶP** với `tour_prices`
   - `tours.sale_price` có thể được thay thế bằng `tour_prices` với `season = 'PROMOTION'`
3. **Một số trường có thể tối ưu**:
   - `bookings.contact_phone` có thể trùng với `customer_phone`

### 🎯 **KẾT LUẬN**

**Cơ sở dữ liệu được thiết kế rất tốt và phù hợp với yêu cầu hệ thống đặt tour du lịch.** 

- ✅ **Không có bảng nào không cần thiết**
- ✅ **Cấu trúc hợp lý và mở rộng được**
- ✅ **Hỗ trợ đầy đủ tính năng từ cơ bản đến nâng cao**
- ✅ **Bảo mật và performance được quan tâm**

**Điểm số: 9.5/10** 🌟

---

## 🔍 **PHÂN TÍCH CHI TIẾT: TRÙNG LẶP GIÁ CẢ**

### **Vấn đề hiện tại:**

#### `tours` table:
```sql
price decimal(12,2) NOT NULL,           -- Giá người lớn
sale_price decimal(12,2) DEFAULT NULL,  -- Giá khuyến mãi  
child_price decimal(12,2) DEFAULT NULL, -- Giá trẻ em
infant_price decimal(12,2) DEFAULT NULL -- Giá trẻ sơ sinh
```

#### `tour_prices` table:
```sql
adult_price decimal(12,2) NOT NULL,     -- Giá người lớn
child_price decimal(12,2) DEFAULT NULL, -- Giá trẻ em
infant_price decimal(12,2) DEFAULT NULL, -- Giá trẻ sơ sinh
single_supplement decimal(12,2) DEFAULT NULL, -- Phụ thu phòng đơn
season enum('HIGH_SEASON','LOW_SEASON','NORMAL_SEASON','PEAK_SEASON'),
valid_from date NOT NULL,               -- Áp dụng từ ngày
valid_to date NOT NULL                  -- Áp dụng đến ngày
```

### **So sánh chức năng:**

| Tính năng | `tours.price` | `tour_prices` |
|-----------|---------------|---------------|
| **Giá cơ bản** | ✅ Có | ✅ Có |
| **Giá theo mùa** | ❌ Không | ✅ Có (HIGH/LOW/PEAK) |
| **Giá theo thời gian** | ❌ Không | ✅ Có (valid_from/valid_to) |
| **Phụ thu phòng đơn** | ❌ Không | ✅ Có |
| **Linh hoạt** | ❌ Cố định | ✅ Linh hoạt |

### **🎯 KẾT LUẬN:**

**`tour_prices` là bảng CHÍNH và cần thiết hơn `tours.price`** vì:

1. **Linh hoạt theo mùa**: Giá cao điểm vs thấp điểm
2. **Linh hoạt theo thời gian**: Có thể thay đổi giá theo từng giai đoạn
3. **Phụ thu phòng đơn**: Tính năng quan trọng cho tour
4. **Mở rộng tương lai**: Dễ thêm các loại giá khác

### **💡 GỢI Ý TỐI ƯU:**

**Option 1: Xóa trường giá trong `tours`**
```sql
-- Xóa các trường này khỏi tours table:
-- price, sale_price, child_price, infant_price
-- Chỉ giữ lại tour_prices làm nguồn giá duy nhất
```

**Option 2: Giữ `tours.price` làm giá mặc định**
```sql
-- Giữ tours.price làm giá cơ bản
-- tour_prices dùng cho giá theo mùa/thời gian
-- Khi không có tour_prices, dùng tours.price
```

**Option 3: Thêm season mặc định**
```sql
-- Thêm trường season vào tours table
-- Tạo tour_prices mặc định khi tạo tour mới
```

---

## 📋 **GỢI Ý TỐI ƯU HÓA**

1. **🔥 ƯU TIÊN CAO: Giải quyết trùng lặp giá cả** - Chọn 1 trong 3 options trên
2. **Thêm bảng `tour_availability`** để quản lý số chỗ còn lại theo ngày
3. **Thêm bảng `tour_departure_points`** để quản lý nhiều điểm khởi hành
4. **Thêm bảng `tour_inclusions_exclusions`** để quản lý chi tiết dịch vụ bao gồm/không bao gồm
5. **Thêm bảng `tour_highlights`** để quản lý điểm nổi bật của tour
6. **Thêm bảng `tour_difficulty_levels`** để phân loại độ khó tour

---

*Phân tích được thực hiện vào: $(date)*
