# HỆ THỐNG QUẢN LÝ TOUR DU LỊCH - TÀI LIỆU CHỨC NĂNG CHI TIẾT
## PHẦN 2: CHỨC NĂNG NÂNG CAO CHO NGƯỜI DÙNG VÀ ADMIN CƠ BẢN

---

## MỤC LỤC
1. [Đặt Tour và Thanh toán](#1-đặt-tour-và-thanh-toán)
2. [Đánh giá và Review](#2-đánh-giá-và-review)
3. [Loyalty Program](#3-loyalty-program)
4. [Hủy Tour và Hoàn tiền](#4-hủy-tour-và-hoàn-tiền)
5. [Quản lý Profile](#5-quản-lý-profile)
6. [Admin - Quản lý Tour](#6-admin---quản-lý-tour)
7. [Admin - Quản lý Booking](#7-admin---quản-lý-booking)

---

## 1. ĐẶT TOUR VÀ THANH TOÁN

### 1.1. Tạo Booking

#### 1.1.1. Luồng đặt tour
**URL:** `/booking/checkout`

**Các bước:**
1. User chọn tour, schedule, số người lớn/trẻ em
2. Click "Đặt ngay" → Redirect `/booking/checkout?tourId=...&scheduleId=...`
3. Frontend load:
   - Tour details
   - Schedule details
   - User info (từ token)
   - Available promotions
   - User vouchers (nếu có)
4. User nhập:
   - Số người lớn, trẻ em
   - Thông tin người tham gia (tên, tuổi, CMND/Passport)
   - Yêu cầu đặc biệt
   - Promotion code (optional)
   - Voucher code (optional)
5. Click "Tính giá" → Gọi API calculate price
6. Hiển thị:
   - Subtotal (giá gốc)
   - Promotion discount
   - Voucher discount
   - Total (tổng thanh toán)
7. Click "Xác nhận đặt tour"
8. Tạo booking → Redirect `/booking/confirmation/{bookingId}`

**API Endpoints:**
```
GET /api/bookings/calculate-price?tourId=...&adults=...&children=...
     &promotionCode=...&voucherCode=...

POST /api/bookings
Body: {
  "tourId": 1,
  "startDate": "2024-03-15",
  "numAdults": 2,
  "numChildren": 1,
  "specialRequests": "...",
  "contactPhone": "0123456789",
  "promotionCode": "SUMMER2024",
  "voucherCode": "VOUCHER123",
  "participants": [
    { "name": "Nguyễn Văn A", "age": 30, "idNumber": "..." }
  ]
}
```

#### 1.1.2. Tính giá với Promotion và Voucher
**Luồng tính giá:**
1. Frontend gửi GET `/api/bookings/calculate-price` với params
2. Backend:
   - Lấy tour, tính giá gốc (adult + child price)
   - Validate promotion code (nếu có):
     - Kiểm tra code tồn tại, còn hiệu lực
     - Kiểm tra min order amount
     - Tính discount (percentage hoặc fixed)
     - Apply max discount (nếu có)
   - Validate voucher code (nếu có, user phải đăng nhập):
     - Kiểm tra voucher thuộc user
     - Kiểm tra còn hiệu lực
     - Kiểm tra min order amount
     - Tính discount
   - Tính total = subtotal - promotion discount - voucher discount
3. Return breakdown:
   ```json
   {
     "subtotal": 5000000,
     "promotionDiscount": 500000,
     "voucherDiscount": 200000,
     "total": 4300000,
     "adultPrice": 2000000,
     "childPrice": 1400000
   }
   ```

**Validation Rules:**
- Promotion: Có thể dùng cho mọi user, có min order, có max discount
- Voucher: Chỉ user sở hữu, có min order, một lần sử dụng

#### 1.1.3. Tạo Booking
**Luồng tạo booking:**
1. Frontend gửi POST `/api/bookings` với booking data
2. Backend:
   - Validate tour, schedule, user
   - Kiểm tra số chỗ còn lại
   - Tạo booking với status `PENDING`
   - Apply promotion (nếu có)
   - Tính totalPrice (sau promotion)
   - Apply voucher (nếu có):
     - Validate voucher
     - Tính voucher discount
     - Update finalAmount = totalPrice - voucher discount
     - Mark voucher as used
   - Tạo payment record với status `PENDING`
   - Tạo participants (nếu có)
   - Gửi email xác nhận booking
   - Tạo notification
3. Return booking response với bookingCode

**Booking Status:**
- `PENDING`: Chờ thanh toán
- `CONFIRMED`: Đã thanh toán, đã xác nhận
- `CANCELLED`: Đã hủy
- `COMPLETED`: Đã hoàn thành tour

**Payment Status:**
- `PENDING`: Chờ thanh toán
- `PAID`: Đã thanh toán
- `FAILED`: Thanh toán thất bại
- `REFUNDED`: Đã hoàn tiền

### 1.2. Thanh toán VNPay

#### 1.2.1. Tạo Payment URL
**Luồng thanh toán:**
1. Sau khi tạo booking, user click "Thanh toán"
2. Frontend gửi POST `/api/payment/vnpay/create-payment`
3. Backend:
   - Lấy booking details
   - Tạo VNPay payment request:
     - Order ID: bookingCode
     - Amount: finalAmount
     - Order Description: Tour name
     - Return URL: `/vnpay-return`
     - IP Address: Client IP
   - Tạo secure hash (HMAC SHA512)
   - Tạo payment URL
4. Return payment URL
5. Frontend redirect user đến VNPay gateway

**API Endpoint:**
```
POST /api/payment/vnpay/create-payment
Body: {
  "bookingId": 123,
  "amount": 4300000,
  "orderDescription": "Tour du lịch..."
}
Response: {
  "paymentUrl": "https://sandbox.vnpayment.vn/...",
  "orderId": "BOOKING123"
}
```

#### 1.2.2. Xử lý kết quả thanh toán
**Luồng return:**
1. VNPay redirect về `/vnpay-return` với query params
2. Backend validate:
   - Kiểm tra hash (security)
   - Kiểm tra response code:
     - `00`: Thành công
     - Khác: Thất bại
3. Nếu thành công:
   - Update payment status = `PAID`
   - Update booking status = `CONFIRMED`
   - Tạo transaction record
   - Gửi email xác nhận thanh toán
   - Tạo notification
   - Cộng loyalty points (nếu có)
4. Redirect đến `/booking/confirmation/{bookingId}`

**API Endpoint:**
```
GET /api/payment/vnpay/payment-return?vnp_Amount=...&vnp_BankCode=...
     &vnp_ResponseCode=00&vnp_TxnRef=...&vnp_SecureHash=...
```

#### 1.2.3. IPN Callback (Webhook)
**Luồng:**
1. VNPay gửi GET `/api/payment/vnpay/payment-callback` (webhook)
2. Backend xử lý tương tự return
3. Return `RspCode=00` để confirm với VNPay

### 1.3. Xác nhận Booking

#### 1.3.1. Trang xác nhận
**URL:** `/booking/confirmation/{bookingId}`

**Hiển thị:**
- Booking code
- Tour name, schedule
- Số người, tổng tiền
- Payment status
- Booking status
- Thông tin liên hệ
- Actions:
  - Xem chi tiết booking
  - Tải invoice (PDF)
  - Hủy booking (nếu chưa thanh toán)

**API Endpoint:**
```
GET /api/bookings/{bookingId}
```

### 1.4. Lịch sử Booking

#### 1.4.1. Xem lịch sử
**URL:** `/dashboard/bookings`

**Tính năng:**
- Danh sách booking của user
- Filters: Status, date range
- Sort: Ngày tạo, tổng tiền
- Pagination
- Actions:
  - Xem chi tiết
  - Hủy booking
  - Đánh giá (nếu completed)

**API Endpoint:**
```
GET /api/bookings/user/{userId}?status=...&fromDate=...&toDate=...
```

---

## 2. ĐÁNH GIÁ VÀ REVIEW

### 2.1. Tạo Review

#### 2.1.1. Điều kiện đánh giá
- User phải có booking `CONFIRMED` hoặc `COMPLETED` cho tour
- Chưa đánh giá tour đó
- Booking đã hoàn thành (endDate < today)

**API Endpoint:**
```
GET /api/reviews/tour/{tourId}/can-review
Response: true/false
```

#### 2.1.2. Tạo Review
**Luồng:**
1. User vào tour detail hoặc booking history
2. Click "Viết đánh giá"
3. Form:
   - Rating (1-5 sao)
   - Comment (text)
   - Images (tối đa 5 ảnh, mỗi ảnh max 10MB)
4. Upload images:
   - Frontend upload lên `/api/upload/review-images`
   - Backend lưu vào `/uploads/review-images/`
   - Return image URLs
5. Submit POST `/api/reviews`
6. Backend:
   - Validate user có booking
   - Tạo review với status `PENDING`
   - Lưu images
   - Gửi notification cho admin
7. Review chờ admin duyệt

**API Endpoints:**
```
POST /api/reviews
Body: {
  "tourId": 1,
  "bookingId": 123,
  "rating": 5,
  "comment": "Tour rất tuyệt vời!",
  "images": ["url1", "url2"]
}

POST /api/upload/review-images
Content-Type: multipart/form-data
Files: image1, image2, ...
```

### 2.2. AI Summary Review

#### 2.2.1. Tổng hợp đánh giá bằng AI
**Luồng:**
1. Frontend load tour detail
2. Gọi GET `/api/reviews/tour/{tourId}/ai-summary`
3. Backend:
   - Lấy tất cả reviews đã approved
   - Gửi đến chatbot service với prompt:
     - "Phân tích các review sau và tóm tắt: điểm tích cực, điểm tiêu cực, tổng kết"
   - Chatbot dùng GPT-4 để phân tích
   - Return structured summary
4. Frontend hiển thị:
   - Overall rating (làm tròn 1 chữ số)
   - Total reviews
   - Rating distribution (1-5 sao với bars)
   - Positive points (bullet list)
   - Negative points (bullet list)
   - Summary (paragraph)

**API Endpoint:**
```
GET /api/reviews/tour/{tourId}/ai-summary
Response: {
  "overallRating": 4.5,
  "totalReviews": 25,
  "positivePoints": ["...", "..."],
  "negativePoints": ["...", "..."],
  "summary": "..."
}
```

**Rating Distribution:**
- Backend luôn return đầy đủ 1-5 sao (count = 0 nếu không có)
- Frontend hiển thị bars với width = (count / total) * 100%

### 2.3. Xem Reviews

#### 2.3.1. Danh sách Reviews
**Trên tour detail page:**
- Hiển thị tất cả reviews đã approved
- Pagination (10 reviews/trang)
- Sort: Mới nhất, hữu ích nhất, rating cao nhất
- Filter: Rating (1-5 sao)
- Mỗi review hiển thị:
  - User name (ẩn email)
  - Rating (sao)
  - Comment
  - Images (nếu có)
  - Date
  - Helpful count
  - "Hữu ích" button

**API Endpoint:**
```
GET /api/reviews/tour/{tourId}/paginated?page=0&size=10
     &sortBy=createdAt&sortDirection=desc
```

#### 2.3.2. Vote Helpful
**Luồng:**
1. User click "Hữu ích" trên review
2. POST `/api/reviews/{reviewId}/helpful`
3. Backend:
   - Kiểm tra user chưa vote (một user chỉ vote 1 lần)
   - Tăng helpful count
   - Lưu vote record
4. Frontend update UI

**API Endpoint:**
```
POST /api/reviews/{reviewId}/helpful
```

### 2.4. Quản lý Reviews của User

#### 2.4.1. Xem Reviews của mình
**URL:** `/dashboard/reviews`

**Tính năng:**
- Danh sách reviews user đã viết
- Status: PENDING, APPROVED, REJECTED
- Actions:
  - Xem chi tiết
  - Sửa (nếu PENDING)
  - Xóa

**API Endpoint:**
```
GET /api/reviews/my-reviews
PUT /api/reviews/{reviewId}
DELETE /api/reviews/{reviewId}
```

---

## 3. LOYALTY PROGRAM

### 3.1. Điểm thưởng (Loyalty Points)

#### 3.1.1. Cách tích điểm
**Các nguồn tích điểm:**
- **Booking**: 1% giá trị booking (sau khi thanh toán thành công)
- **Review**: 50 points (sau khi review được approve)
- **Referral**: 100 points (khi người được giới thiệu đặt tour đầu tiên)
- **Admin adjustment**: Admin có thể cộng/trừ điểm thủ công

**Luồng tích điểm khi booking:**
1. User thanh toán thành công
2. Backend tự động:
   - Tính points = finalAmount * 0.01
   - Tạo PointTransaction với sourceType = `BOOKING`
   - Cộng vào LoyaltyPoints.totalPoints
   - Check và update level (nếu đủ điểm)

**API Endpoint:**
```
GET /api/loyalty/points
Response: {
  "totalPoints": 5000,
  "currentLevel": "GOLD",
  "pointsToNextLevel": 2000
}
```

#### 3.1.2. Cấp độ (Levels)
**Các cấp độ:**
- **BRONZE**: 0-999 points
- **SILVER**: 1000-4999 points
- **GOLD**: 5000-9999 points
- **PLATINUM**: 10000+ points

**Quyền lợi:**
- Mỗi level có discount rate khác nhau khi đổi voucher
- Level cao hơn → Đổi voucher rẻ hơn

### 3.2. Voucher (Point Voucher)

#### 3.2.1. Đổi điểm lấy Voucher
**Luồng:**
1. User vào `/dashboard/loyalty`
2. Xem redemption options:
   - Voucher 100k: 1000 points
   - Voucher 200k: 1800 points
   - Voucher 500k: 4000 points
3. Chọn voucher, nhập số điểm
4. POST `/api/loyalty/redeem`
5. Backend:
   - Kiểm tra đủ điểm
   - Trừ points
   - Tạo PointVoucher:
     - Code: Random unique code
     - Value: Giá trị voucher
     - Valid days: 30 ngày
     - Status: ACTIVE
   - Tạo transaction với sourceType = `REDEMPTION`
6. Return voucher code

**API Endpoint:**
```
POST /api/loyalty/redeem
Body: {
  "points": 1000,
  "voucherValue": 100000,
  "validDays": 30
}
```

#### 3.2.2. Sử dụng Voucher
**Luồng:**
1. Khi đặt tour, user nhập voucher code
2. Frontend gọi validate API
3. Backend kiểm tra:
   - Voucher thuộc user
   - Còn hiệu lực (chưa hết hạn)
   - Chưa sử dụng
   - Đạt min order amount
4. Tính discount
5. Khi thanh toán thành công:
   - Mark voucher as used
   - Tạo transaction record

**API Endpoint:**
```
GET /api/loyalty/vouchers/validate?voucherCode=...&bookingAmount=...
Response: {
  "valid": true,
  "discount": 100000
}
```

#### 3.2.3. Quản lý Voucher
**URL:** `/dashboard/loyalty`

**Tính năng:**
- Xem tất cả vouchers
- Filter: ACTIVE, USED, EXPIRED
- Xem chi tiết voucher
- Hủy voucher (nếu chưa dùng) → Hoàn điểm

**API Endpoints:**
```
GET /api/loyalty/vouchers
GET /api/loyalty/vouchers/active
POST /api/loyalty/vouchers/{voucherId}/cancel
```

### 3.3. Referral Program

#### 3.3.1. Lấy Referral Code
**Luồng:**
1. User vào `/dashboard/loyalty`
2. Xem referral code và link
3. Share link: `/register?ref={code}`
4. Khi người được giới thiệu đăng ký và đặt tour đầu tiên:
   - Người giới thiệu: +100 points
   - Người được giới thiệu: +50 points (welcome bonus)

**API Endpoint:**
```
GET /api/loyalty/referral/code
Response: {
  "referralCode": "USER123",
  "referralLink": "http://.../register?ref=USER123"
}
```

#### 3.3.2. Thống kê Referral
**API Endpoint:**
```
GET /api/loyalty/referral/stats
Response: {
  "totalReferrals": 5,
  "totalPointsEarned": 500,
  "activeReferrals": 3
}
```

### 3.4. Lịch sử giao dịch Points

#### 3.4.1. Xem lịch sử
**Tính năng:**
- Danh sách tất cả transactions
- Filters: Source type (BOOKING, REVIEW, REFERRAL, REDEMPTION, ADMIN)
- Pagination
- Hiển thị: Date, type, points (+/-), description, balance

**API Endpoint:**
```
GET /api/loyalty/transactions?page=0&size=20
```

---

## 4. HỦY TOUR VÀ HOÀN TIỀN

### 4.1. Yêu cầu hủy Booking

#### 4.1.1. Điều kiện hủy
- Booking status = `CONFIRMED` hoặc `PENDING`
- Payment status = `PAID` hoặc `PENDING`
- Chưa đến ngày khởi hành (hoặc trong thời gian cho phép)

**API Endpoint:**
```
GET /api/cancellations/booking/{bookingId}/can-cancel
Response: true/false
```

#### 4.1.2. Tạo yêu cầu hủy
**Luồng:**
1. User vào booking detail
2. Click "Hủy booking"
3. Form:
   - Reason (dropdown): Personal, Emergency, Weather, Other
   - Description (text)
   - Is Emergency (checkbox)
4. Click "Tính hoàn tiền" → Preview refund amount
5. Submit POST `/api/cancellations/request`
6. Backend:
   - Validate booking có thể hủy
   - Tính refund amount dựa trên cancellation policy
   - Tạo BookingCancellation với status `PENDING`
   - Gửi notification cho admin
7. Booking status → `CANCELLED` (tạm thời)

**API Endpoint:**
```
POST /api/cancellations/request
Body: {
  "bookingId": 123,
  "reason": "PERSONAL",
  "description": "...",
  "isEmergency": false
}
```

#### 4.1.3. Tính hoàn tiền
**Cancellation Policy:**
- **Trước 30 ngày**: Hoàn 100%
- **Trước 14 ngày**: Hoàn 80%
- **Trước 7 ngày**: Hoàn 50%
- **Trước 3 ngày**: Hoàn 30%
- **Dưới 3 ngày**: Không hoàn tiền (trừ emergency)

**Emergency Cancellation:**
- Có thể hủy bất kỳ lúc nào
- Hoàn 100% (admin quyết định)

**API Endpoint:**
```
POST /api/cancellations/booking/{bookingId}/evaluate
Body: {
  "reason": "PERSONAL",
  "isEmergency": false
}
Response: {
  "refundAmount": 4000000,
  "refundPercentage": 80,
  "cancellationFee": 1000000,
  "policyApplied": "14_DAYS"
}
```

### 4.2. Xử lý hủy (Admin)

#### 4.2.1. Duyệt hủy
**Luồng Admin:**
1. Admin vào `/admin/cancellations`
2. Xem danh sách pending cancellations
3. Click vào cancellation:
   - Booking details
   - Reason, description
   - Refund amount (calculated)
   - User info
4. Actions:
   - **Approve**: Duyệt hủy
     - Update cancellation status = `APPROVED`
     - Update booking status = `CANCELLED`
     - Update payment status = `REFUNDED`
     - Tạo refund record
     - Gửi email thông báo
     - Hoàn tiền (manual hoặc tự động)
   - **Reject**: Từ chối
     - Update cancellation status = `REJECTED`
     - Update booking status = `CONFIRMED` (restore)
     - Gửi email thông báo lý do

**API Endpoints:**
```
PUT /api/cancellations/admin/{cancellationId}/approve?adminNotes=...
PUT /api/cancellations/admin/{cancellationId}/reject?adminNotes=...
```

### 4.3. Lịch sử hủy

#### 4.3.1. User xem lịch sử
**URL:** `/dashboard/bookings` (filter cancelled)

**Hiển thị:**
- Danh sách cancellations
- Status: PENDING, APPROVED, REJECTED
- Refund status: PENDING, PROCESSED, FAILED
- Refund amount

**API Endpoint:**
```
GET /api/cancellations/my-cancellations?page=0&size=20
```

---

## 5. QUẢN LÝ PROFILE

### 5.1. Xem và Sửa Profile

#### 5.1.1. Trang Profile
**URL:** `/dashboard/profile`

**Thông tin hiển thị:**
- Name, Email, Phone
- Avatar
- Date joined
- Loyalty level, points
- Total bookings
- Total reviews

**API Endpoint:**
```
GET /api/auth/me
PUT /api/users/{userId}
```

#### 5.1.2. Cập nhật thông tin
**Luồng:**
1. User sửa name, phone
2. Upload avatar (optional)
3. Submit
4. Backend update user
5. Frontend refresh

**API Endpoint:**
```
PUT /api/users/{userId}
Body: {
  "name": "...",
  "phone": "...",
  "avatar": "url"
}
```

#### 5.1.3. Đổi mật khẩu
**Luồng:**
1. User nhập:
   - Current password
   - New password
   - Confirm password
2. POST `/api/users/{userId}/password`
3. Backend:
   - Verify current password
   - Validate new password strength
   - Update password
4. Logout và yêu cầu đăng nhập lại

**API Endpoint:**
```
PUT /api/users/{userId}/password
Body: {
  "currentPassword": "...",
  "newPassword": "...",
  "confirmPassword": "..."
}
```

### 5.2. Thông báo

#### 5.2.1. Real-time Notifications
**Cơ chế:**
- Server-Sent Events (SSE)
- Frontend subscribe `/api/notifications/stream/{userId}`
- Backend push notifications khi có sự kiện

**Các loại thông báo:**
- Booking confirmed
- Payment success
- Review approved/rejected
- Promotion mới
- Cancellation approved/rejected
- Points earned

**API Endpoint:**
```
GET /api/notifications/stream/{userId}
Event: notification
Data: {
  "message": "...",
  "type": "info|success|warning|error",
  "link": "/dashboard/bookings/123"
}
```

#### 5.2.2. Xem thông báo
**URL:** `/dashboard/notifications`

**Tính năng:**
- Danh sách notifications
- Mark as read
- Mark all as read
- Delete
- Filter: All, Unread

**API Endpoints:**
```
GET /api/notifications/user/{userId}?page=0&size=20&unreadOnly=false
PUT /api/notifications/{notificationId}/read
PUT /api/notifications/user/{userId}/read-all
DELETE /api/notifications/{notificationId}
```

---

## 6. ADMIN - QUẢN LÝ TOUR

### 6.1. Dashboard Admin

#### 6.1.1. Overview
**URL:** `/admin/dashboard`

**Các KPI:**
- Doanh thu tháng này
- Booking tháng này
- Khách hàng mới
- Tour đang hoạt động

**Biểu đồ:**
- Doanh thu theo ngày/tháng
- Booking theo status
- Top tours doanh thu cao
- Top partners

**API Endpoint:**
```
GET /api/admin/statistics/overview
GET /api/admin/statistics/revenue/chart
GET /api/admin/statistics/booking/chart
```

### 6.2. CRUD Tour

#### 6.2.1. Danh sách Tour
**URL:** `/admin/tours`

**Tính năng:**
- Table với pagination
- Search: Tên, slug, mô tả
- Filters:
  - Status (ACTIVE, INACTIVE, DRAFT)
  - Featured (Yes/No)
  - Category
  - Price range
- Sort: ID, tên, giá, ngày tạo
- Actions:
  - Xem chi tiết
  - Sửa
  - Xóa (soft delete)
  - Toggle featured
  - Change status

**API Endpoint:**
```
GET /api/admin/tours?page=0&size=20&search=...&status=...&categoryId=...
```

#### 6.2.2. Tạo Tour
**Luồng:**
1. Click "Tạo tour mới"
2. Form với các tab:
   - **Basic Info**: Tên, slug, mô tả ngắn, mô tả dài
   - **Details**: Loại tour, địa điểm, giá, sale price, duration
   - **Images**: Main image, gallery images
   - **Itinerary**: Lịch trình từng ngày
   - **Policies**: Included, excluded, cancellation policy
   - **Settings**: Status, featured, category
3. Upload images:
   - Frontend upload lên `/api/upload/images`
   - Backend lưu vào `/uploads/tours/`
4. Submit → POST `/api/admin/tours`
5. Backend:
   - Validate data
   - Tạo tour
   - Lưu images
   - Tạo itineraries
   - Tạo schedules (nếu có)

**API Endpoint:**
```
POST /api/admin/tours
Content-Type: multipart/form-data
Body: {
  "name": "...",
  "slug": "...",
  "description": "...",
  "price": 2000000,
  "categoryId": 1,
  "images": [...],
  "itineraries": [...]
}
```

#### 6.2.3. Sửa Tour
**Luồng tương tự tạo**, nhưng:
- Load existing data
- PUT `/api/admin/tours/{tourId}`
- Update thay vì create

**API Endpoint:**
```
PUT /api/admin/tours/{tourId}
```

#### 6.2.4. Xóa Tour
**Soft Delete:**
- Không xóa khỏi database
- Set status = `INACTIVE`
- Ẩn khỏi public listing

**API Endpoint:**
```
DELETE /api/admin/tours/{tourId}
```

### 6.3. Quản lý Categories

#### 6.3.1. CRUD Categories
**URL:** `/admin/categories`

**Tính năng:**
- List, Create, Edit, Delete
- Set featured category
- Upload icon/image

**API Endpoints:**
```
GET /api/admin/categories
POST /api/admin/categories
PUT /api/admin/categories/{id}
DELETE /api/admin/categories/{id}
```

---

## 7. ADMIN - QUẢN LÝ BOOKING

### 7.1. Danh sách Booking

#### 7.1.1. Quản lý Booking
**URL:** `/admin/bookings`

**Tính năng:**
- Table với pagination
- Search: Booking code, customer name, email
- Filters:
  - Confirmation status (PENDING, CONFIRMED, CANCELLED)
  - Payment status (PENDING, PAID, FAILED, REFUNDED)
  - Date range (created date)
  - Tour ID
- Sort: Ngày tạo, tổng tiền
- Actions:
  - Xem chi tiết
  - Confirm booking
  - Cancel booking
  - Update payment status
  - Export CSV/Excel

**API Endpoint:**
```
GET /api/admin/bookings?page=0&size=20&search=...&confirmationStatus=...
     &paymentStatus=...&fromDate=...&toDate=...
```

### 7.2. Export Booking

#### 7.2.1. Export CSV/Excel
**Luồng:**
1. Admin apply filters
2. Click "Xuất dữ liệu" → Dropdown
3. Chọn "Xuất CSV" hoặc "Xuất Excel"
4. Frontend gọi API với current filters
5. Backend:
   - Query bookings với filters
   - Generate CSV/Excel với Apache POI
   - Headers tiếng Việt
   - Format dates, prices
6. Return file download

**API Endpoints:**
```
GET /api/admin/bookings/export/csv?confirmationStatus=...&fromDate=...
GET /api/admin/bookings/export/excel?confirmationStatus=...&fromDate=...
```

**CSV/Excel Columns:**
- Mã booking
- Khách hàng
- Tour
- Ngày khởi hành
- Số người
- Tổng tiền
- Trạng thái
- Ngày tạo

---

**Kết thúc Phần 2**

Tiếp tục với Phần 3: Admin nâng cao và các tính năng đặc biệt (Chatbot AI, Statistics, Partners, etc.)...

