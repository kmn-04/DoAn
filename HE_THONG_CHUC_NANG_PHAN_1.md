# HỆ THỐNG QUẢN LÝ TOUR DU LỊCH - TÀI LIỆU CHỨC NĂNG CHI TIẾT
## PHẦN 1: TỔNG QUAN HỆ THỐNG VÀ CHỨC NĂNG CƠ BẢN CHO NGƯỜI DÙNG

---

## MỤC LỤC
1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Kiến trúc và công nghệ](#2-kiến-trúc-và-công-nghệ)
3. [Chức năng cơ bản cho người dùng](#3-chức-năng-cơ-bản-cho-người-dùng)
4. [Xác thực và phân quyền](#4-xác-thực-và-phân-quyền)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Mô tả hệ thống
Hệ thống quản lý tour du lịch là một nền tảng web toàn diện cho phép:
- **Người dùng (Customer)**: Tìm kiếm, xem chi tiết, đặt tour, thanh toán, đánh giá, quản lý booking
- **Quản trị viên (Admin)**: Quản lý toàn bộ hệ thống, tour, booking, user, thống kê, báo cáo
- **Đối tác (Partner)**: Quản lý thông tin đối tác và tour liên kết

### 1.2. Các module chính
1. **Module Quản lý Tour**: CRUD tour, danh mục, lịch trình, hình ảnh
2. **Module Đặt Tour (Booking)**: Tạo booking, thanh toán, xác nhận
3. **Module Thanh toán**: Tích hợp VNPay, xử lý giao dịch
4. **Module Đánh giá**: Review tour, AI summary, rating
5. **Module Loyalty**: Điểm thưởng, voucher, referral
6. **Module Hủy Tour**: Quản lý hủy booking, hoàn tiền
7. **Module Quản trị**: Dashboard, thống kê, export dữ liệu
8. **Module Chatbot AI**: Tư vấn tour thông minh, tìm kiếm bằng hình ảnh
9. **Module Thông báo**: Real-time notifications, email notifications
10. **Module Đối tác**: Quản lý partner, partnership

---

## 2. KIẾN TRÚC VÀ CÔNG NGHỆ

### 2.1. Kiến trúc hệ thống
```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Vite
│   (Port 5173)   │  Tailwind CSS, React Query
└────────┬────────┘
         │ HTTP/REST API
┌────────▼────────┐
│   Backend       │  Spring Boot 3.x
│   (Port 8080)   │  Java 17, Maven
└────────┬────────┘
         │
┌────────▼────────┐
│   Database      │  MySQL
│   (Port 3306)   │  Flyway Migration
└─────────────────┘

┌─────────────────┐
│   Chatbot AI    │  Python Flask
│   (Port 5000)   │  OpenAI GPT, FAISS, RAG
└─────────────────┘
```

### 2.2. Công nghệ Frontend
- **Framework**: React 18+ với TypeScript
- **Build Tool**: Vite
- **UI Library**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Internationalization**: react-i18next (Vi/En)
- **Charts**: Recharts
- **Icons**: Heroicons
- **Forms**: React Hook Form (implicit)
- **Notifications**: react-hot-toast

### 2.3. Công nghệ Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Build Tool**: Maven
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Spring Security + JWT
- **API Documentation**: OpenAPI 3 (Swagger)
- **File Upload**: MultipartFile
- **Email**: JavaMailSender (SMTP)
- **Scheduling**: Spring @Scheduled
- **Export**: Apache POI (Excel), CSV

### 2.4. Công nghệ AI/Chatbot
- **Framework**: Flask (Python)
- **LLM**: OpenAI GPT-4/GPT-3.5
- **Vector Database**: FAISS
- **RAG**: Retrieval-Augmented Generation
- **Image Search**: CLIP embeddings
- **Intent Classification**: AI-based

### 2.5. Cơ sở dữ liệu
- **RDBMS**: MySQL 8.0
- **Migration**: Flyway
- **Connection Pool**: HikariCP
- **Các bảng chính**:
  - `users`, `roles`, `tours`, `categories`, `bookings`, `payments`
  - `reviews`, `loyalty_points`, `point_vouchers`, `promotions`
  - `partners`, `notifications`, `contacts`, `banners`
  - `booking_cancellations`, `wishlists`, `newsletters`

---

## 3. CHỨC NĂNG CƠ BẢN CHO NGƯỜI DÙNG

### 3.1. Đăng ký và Đăng nhập

#### 3.1.1. Đăng ký tài khoản
**Luồng hoạt động:**
1. User truy cập `/register`
2. Nhập thông tin: Email, Password, Name, Phone
3. Frontend validate form (email format, password strength)
4. Gửi POST `/api/auth/register`
5. Backend:
   - Kiểm tra email đã tồn tại
   - Hash password bằng BCrypt
   - Tạo user với role `USER` (CUSTOMER)
   - Tạo email verification token
   - Gửi email xác thực
   - Trả về JWT token + refresh token
6. Frontend lưu token vào localStorage
7. Redirect đến trang xác thực email

**API Endpoint:**
```
POST /api/auth/register
Body: {
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "Nguyễn Văn A",
  "phone": "0123456789"
}
Response: {
  "status": "SUCCESS",
  "data": {
    "jwt": "eyJhbGci...",
    "refreshToken": "uuid-token",
    "user": { ... }
  }
}
```

**Tính năng:**
- Validation email format
- Password strength check (min 8 chars)
- Email verification required
- Auto-login sau đăng ký
- JWT token authentication

#### 3.1.2. Đăng nhập
**Luồng hoạt động:**
1. User truy cập `/login`
2. Nhập email và password
3. Gửi POST `/api/auth/login`
4. Backend:
   - Xác thực credentials
   - Kiểm tra user status (ACTIVE/INACTIVE/BANNED)
   - Tạo JWT token (expires 24h)
   - Tạo refresh token (expires 7 days)
   - Lưu refresh token vào database
   - Trả về tokens + user info
5. Frontend lưu tokens
6. Redirect đến dashboard hoặc trang trước đó

**API Endpoint:**
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Tính năng:**
- Remember me (extend token expiry)
- Auto-redirect sau login
- Error handling (invalid credentials, banned account)

#### 3.1.3. Xác thực Email
**Luồng hoạt động:**
1. Sau đăng ký, user nhận email verification link
2. Click link → `/verify-email?token=xxx`
3. Backend validate token
4. Activate user account
5. Redirect đến login

**API Endpoint:**
```
GET /api/auth/verify-email?token={token}
```

#### 3.1.4. Quên mật khẩu
**Luồng hoạt động:**
1. User nhập email tại `/forgot-password`
2. Gửi POST `/api/auth/forgot-password`
3. Backend:
   - Tạo reset token (JWT, expires 1h)
   - Lưu token vào database
   - Gửi email với reset link
4. User click link → `/reset-password?token=xxx`
5. Nhập password mới
6. Gửi POST `/api/auth/reset-password`
7. Backend validate token, update password
8. Redirect đến login

**API Endpoints:**
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }

POST /api/auth/reset-password
Body: {
  "token": "reset-token",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

#### 3.1.5. Đăng nhập Google OAuth
**Luồng hoạt động:**
1. User click "Đăng nhập với Google"
2. Redirect đến Google OAuth consent screen
3. User authorize
4. Google redirect về `/auth/google/callback?code=xxx`
5. Backend exchange code lấy access token
6. Lấy user info từ Google API
7. Tìm hoặc tạo user trong database
8. Tạo JWT token
9. Redirect đến dashboard

**API Endpoint:**
```
GET /oauth2/authorization/google
GET /auth/google/callback
```

### 3.2. Tìm kiếm và Xem Tour

#### 3.2.1. Trang chủ (Landing Page)
**URL:** `/dashboard`

**Các section:**
1. **Hero Section**: Banner carousel tự động chuyển, CTA buttons
2. **Featured Tours**: Tour nổi bật (isFeatured = true)
3. **Hot Deals**: Tour có khuyến mãi, countdown timer
4. **Browse by Category**: Grid các danh mục tour
5. **Popular Destinations**: Điểm đến phổ biến
6. **Personalized Recommendations**: AI gợi ý tour dựa trên lịch sử

**API Endpoints:**
```
GET /api/tours/featured
GET /api/promotions/active
GET /api/categories
GET /api/recommendations/personalized
```

#### 3.2.2. Danh sách Tour
**URL:** `/tours`

**Tính năng:**
- **Pagination**: 20 tours/trang
- **Search**: Tìm theo tên, mô tả, địa điểm
- **Filters**:
  - Category (Danh mục)
  - Price range (Khoảng giá)
  - Duration (Thời lượng)
  - Tour Type (DOMESTIC/INTERNATIONAL)
  - Location (Địa điểm)
  - Country (Quốc gia)
  - Continent (Châu lục)
  - Rating (Đánh giá tối thiểu)
  - Visa Required (Cần visa)
  - Flight Included (Bao gồm vé máy bay)
- **Sort**: Theo giá, rating, ngày tạo, tên
- **View**: Grid/List view

**API Endpoint:**
```
GET /api/tours/search?keyword=...&categoryId=...&minPrice=...&maxPrice=...
     &minDuration=...&maxDuration=...&tourType=...&location=...
     &countryCode=...&continent=...&minRating=...&visaRequired=...
     &flightIncluded=...&page=0&size=20&sortBy=createdAt&sortDirection=desc

POST /api/tours/search (same params in body)
```

**Luồng hoạt động:**
1. User vào `/tours`
2. Frontend load categories, countries, destinations
3. User nhập search hoặc chọn filters
4. Gửi request với query params
5. Backend:
   - Query database với các điều kiện
   - Apply pagination
   - Return tours với images, category, rating
6. Frontend hiển thị grid/list
7. User click tour → `/tours/{slug}`

#### 3.2.3. Chi tiết Tour
**URL:** `/tours/{slug}`

**Các section:**
1. **Header**: Tên tour, rating, price, sale price
2. **Image Gallery**: Carousel hình ảnh, zoom
3. **Quick Info**: Duration, max people, departure, destination
4. **Overview**: Mô tả tổng quan
5. **Highlights**: Điểm nổi bật
6. **Itinerary**: Lịch trình chi tiết (ngày 1, 2, 3...)
7. **Included/Excluded**: Bao gồm/Không bao gồm
8. **Important Notes**: Lưu ý quan trọng
9. **Schedule Selector**: Chọn ngày khởi hành
10. **Booking Form**: Số người lớn, trẻ em, yêu cầu đặc biệt
11. **Reviews**: Đánh giá khách hàng, AI summary
12. **FAQ**: Câu hỏi thường gặp
13. **Related Tours**: Tour tương tự

**API Endpoints:**
```
GET /api/tours/slug/{slug}
GET /api/reviews/tour/{tourId}
GET /api/reviews/tour/{tourId}/ai-summary
GET /api/reviews/tour/{tourId}/stats
GET /api/tours/{tourId}/schedules
GET /api/tour-faqs/tour/{tourId}
```

**Luồng hoạt động:**
1. User click tour từ danh sách
2. Frontend load tour detail bằng slug
3. Load reviews, AI summary, schedules, FAQ
4. User xem thông tin, chọn schedule, số người
5. Click "Đặt ngay" → `/booking/checkout?tourId=...&scheduleId=...`

#### 3.2.4. Tìm kiếm nâng cao
**Tính năng:**
- **Smart Search**: Tìm kiếm thông minh với AI
- **Image Search**: Upload hình ảnh, tìm tour tương tự
- **Advanced Filters**: Modal với nhiều filter options

**API Endpoints:**
```
POST /api/tours/search-by-image
Body: {
  "imageData": "base64-encoded-image",
  "limit": 5
}

POST /api/chatbot/ask (for smart search)
Body: {
  "query": "tour du lịch biển giá rẻ",
  "session_id": "uuid"
}
```

**Luồng Image Search:**
1. User click "Tìm bằng hình ảnh"
2. Upload hoặc chụp ảnh
3. Frontend convert sang base64
4. Gửi POST `/api/tours/search-by-image`
5. Backend gọi chatbot service
6. Chatbot dùng CLIP embeddings tìm tour tương tự
7. Return list tour IDs
8. Frontend hiển thị kết quả

### 3.3. Wishlist (Danh sách yêu thích)

#### 3.3.1. Thêm/Xóa Tour khỏi Wishlist
**Luồng hoạt động:**
1. User đã đăng nhập
2. Click icon "Yêu thích" trên tour card
3. Frontend gửi POST `/api/wishlists/tour/{tourId}`
4. Backend:
   - Kiểm tra tour đã có trong wishlist chưa
   - Nếu chưa: Tạo wishlist entry
   - Nếu có: Xóa entry
5. Frontend update UI (filled/outline icon)

**API Endpoints:**
```
POST /api/wishlists/tour/{tourId}
DELETE /api/wishlists/tour/{tourId}
GET /api/wishlists/check/{tourId}
```

#### 3.3.2. Xem Wishlist
**URL:** `/dashboard/wishlist`

**Tính năng:**
- Hiển thị danh sách tour đã yêu thích
- Pagination
- Xóa từng item
- Xóa tất cả
- Click tour → Chi tiết tour

**API Endpoint:**
```
GET /api/wishlists?page=0&size=20
DELETE /api/wishlists/clear
```

---

## 4. XÁC THỰC VÀ PHÂN QUYỀN

### 4.1. JWT Authentication
**Cơ chế:**
- **Access Token**: JWT, expires 24h, chứa user info (id, email, roles)
- **Refresh Token**: UUID, expires 7 days, lưu trong database
- **Token Storage**: localStorage (frontend)
- **Auto-refresh**: Tự động refresh token khi gần hết hạn

**API Endpoints:**
```
POST /api/auth/refresh?refreshToken={token}
GET /api/auth/validate-token
GET /api/auth/me
POST /api/auth/logout
```

### 4.2. Phân quyền (Roles)
**Các role:**
- **CUSTOMER (USER)**: Người dùng thông thường
- **ADMIN**: Quản trị viên
- **PARTNER**: Đối tác

**Spring Security:**
```java
@PreAuthorize("hasRole('ADMIN')")  // Chỉ admin
@PreAuthorize("isAuthenticated()")  // Đã đăng nhập
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")  // Customer hoặc Admin
```

### 4.3. Protected Routes (Frontend)
**Component:** `ProtectedRoute`

**Logic:**
- Kiểm tra token trong localStorage
- Validate token với backend
- Nếu chưa đăng nhập → Redirect `/login`
- Nếu không đủ quyền → 403 error

**Sử dụng:**
```tsx
<Route path="/booking/checkout" element={
  <ProtectedRoute>
    <BookingCheckoutPage />
  </ProtectedRoute>
} />
```

---
