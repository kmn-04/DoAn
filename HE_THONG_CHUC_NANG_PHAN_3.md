# HỆ THỐNG QUẢN LÝ TOUR DU LỊCH - TÀI LIỆU CHỨC NĂNG CHI TIẾT
## PHẦN 3: ADMIN NÂNG CAO VÀ CÁC TÍNH NĂNG ĐẶC BIỆT

---

## MỤC LỤC
1. [Admin - Quản lý User](#1-admin---quản-lý-user)
2. [Admin - Thống kê và Báo cáo](#2-admin---thống-kê-và-báo-cáo)
3. [Admin - Quản lý Reviews](#3-admin---quản-lý-reviews)
4. [Admin - Quản lý Partners](#4-admin---quản-lý-partners)
5. [Admin - Quản lý Promotions](#5-admin---quản-lý-promotions)
6. [Admin - Quản lý Loyalty](#6-admin---quản-lý-loyalty)
7. [Admin - Quản lý Notifications](#7-admin---quản-lý-notifications)
8. [Admin - Quản lý Contacts](#8-admin---quản-lý-contacts)
9. [Admin - Quản lý Banners](#9-admin---quản-lý-banners)
10. [Chatbot AI](#10-chatbot-ai)
11. [Tìm kiếm bằng hình ảnh](#11-tìm-kiếm-bằng-hình-ảnh)
12. [Recommendations](#12-recommendations)
13. [Weather Widget](#13-weather-widget)
14. [Newsletter](#14-newsletter)
15. [Live Chat](#15-live-chat)

---

## 1. ADMIN - QUẢN LÝ USER

### 1.1. Danh sách User

#### 1.1.1. Quản lý User
**URL:** `/admin/users`

**Tính năng:**
- Table với pagination
- Search: Email, tên, số điện thoại
- Filters:
  - Status (ACTIVE, INACTIVE, BANNED)
  - Role (USER, ADMIN, PARTNER)
  - Created date range
  - Last activity date range
- Sort: ID, tên, email, ngày tạo
- Actions:
  - Xem chi tiết
  - Sửa thông tin
  - Thay đổi role
  - Ban/Unban user
  - Xóa user (soft delete)
  - Export CSV/Excel

**API Endpoint:**
```
GET /api/admin/users?page=0&size=20&search=...&status=...&role=...
     &createdFrom=...&createdTo=...
```

**Stats hiển thị:**
- Total users
- Active users
- Inactive users
- Banned users
- Admin users

### 1.2. CRUD User

#### 1.2.1. Tạo User
**Luồng:**
1. Click "Tạo user mới"
2. Form:
   - Name, Email, Phone
   - Password
   - Role (dropdown)
   - Status (ACTIVE/INACTIVE)
3. Submit → POST `/api/admin/users`
4. Backend:
   - Validate email unique
   - Hash password
   - Tạo user
   - Gửi email welcome (optional)

**API Endpoint:**
```
POST /api/admin/users
Body: {
  "name": "...",
  "email": "...",
  "phone": "...",
  "password": "...",
  "roleId": 3,
  "status": "ACTIVE"
}
```

#### 1.2.2. Sửa User
**Tương tự tạo**, nhưng:
- Load existing data
- PUT `/api/admin/users/{userId}`
- Có thể đổi password (optional)

**API Endpoint:**
```
PUT /api/admin/users/{userId}
```

#### 1.2.3. Thay đổi Role
**Luồng:**
1. Click "Đổi role" trên user
2. Chọn role mới
3. PUT `/api/admin/users/{userId}/role`
4. Backend update role
5. Log activity (audit)

**API Endpoint:**
```
PUT /api/admin/users/{userId}/role?roleId=...
```

#### 1.2.4. Ban/Unban User
**Luồng:**
1. Click "Ban" hoặc "Unban"
2. PUT `/api/admin/users/{userId}/status?status=BANNED`
3. Backend:
   - Update status
   - Invalidate all tokens (nếu ban)
   - Gửi email thông báo

**API Endpoint:**
```
PUT /api/admin/users/{userId}/status?status=BANNED
```

### 1.3. Export User

#### 1.3.1. Export CSV/Excel
**Tương tự export booking:**
- Apply filters
- Click "Xuất dữ liệu" → CSV/Excel
- Backend generate file với headers tiếng Việt

**API Endpoints:**
```
GET /api/admin/users/export/csv?status=...&role=...
GET /api/admin/users/export/excel?status=...&role=...
```

**Columns:**
- ID
- Tên
- Email
- Số điện thoại
- Role
- Status
- Ngày tạo
- Lần hoạt động cuối

---

## 2. ADMIN - THỐNG KÊ VÀ BÁO CÁO

### 2.1. Statistics Dashboard

#### 2.1.1. Trang Thống kê
**URL:** `/admin/statistics`

**Các biểu đồ:**
1. **Doanh thu 12 tháng gần nhất** (Line Chart)
   - X-axis: Tháng
   - Y-axis: Doanh thu (VND)
   - Data: Revenue, Booking count

2. **Top Tours** (Bar Chart)
   - Top 10 tours doanh thu cao nhất
   - X-axis: Tour name
   - Y-axis: Doanh thu

3. **Tăng trưởng User** (Bar Chart)
   - User mới theo tháng
   - X-axis: Tháng
   - Y-axis: Số user

4. **Phân bổ Doanh thu** (Pie Chart)
   - Tháng này
   - Tháng trước
   - Các tháng khác (năm nay)

**API Endpoints:**
```
GET /api/admin/statistics/revenue/monthly
GET /api/admin/statistics/tours/top
GET /api/admin/statistics/users/growth
GET /api/admin/statistics/revenue/summary
```

**Summary Stats:**
- This month revenue
- This month bookings
- This year revenue
- Total revenue
- Last month revenue
- Growth rate (%)

### 2.2. Export Revenue Statistics

#### 2.2.1. Export Doanh thu
**Luồng:**
1. Admin vào `/admin/statistics`
2. Click "Xuất dữ liệu" → CSV/Excel
3. Backend:
   - Lấy data 12 tháng gần nhất
   - Generate file với:
     - Tháng (label tiếng Việt)
     - Doanh thu
     - Số booking
4. Return file download

**API Endpoints:**
```
GET /api/admin/statistics/export/revenue/csv
GET /api/admin/statistics/export/revenue/excel
```

**CSV/Excel Columns:**
- Tháng
- Doanh thu (VND)
- Số booking

---

## 3. ADMIN - QUẢN LÝ REVIEWS

### 3.1. Danh sách Reviews

#### 3.1.1. Quản lý Reviews
**URL:** `/admin/reviews`

**Tính năng:**
- Table với pagination
- Search: Tour name, user name, comment
- Filters:
  - Status (PENDING, APPROVED, REJECTED)
  - Rating (1-5 sao)
  - Tour ID
  - Date range
- Sort: Ngày tạo, rating
- Actions:
  - Xem chi tiết
  - Approve review
  - Reject review (với lý do)
  - Xóa review

**API Endpoint:**
```
GET /api/admin/reviews?page=0&size=20&status=PENDING&rating=...
```

### 3.2. Duyệt Review

#### 3.2.1. Approve/Reject
**Luồng:**
1. Admin click vào review
2. Xem:
   - Tour info
   - User info
   - Rating, comment
   - Images (nếu có)
3. Actions:
   - **Approve**:
     - Update status = `APPROVED`
     - Cộng loyalty points cho user (50 points)
     - Update tour rating
     - Gửi email thông báo
   - **Reject**:
     - Update status = `REJECTED`
     - Nhập lý do từ chối
     - Gửi email thông báo

**API Endpoints:**
```
PUT /api/admin/reviews/{reviewId}/approve
PUT /api/admin/reviews/{reviewId}/reject?reason=...
```

### 3.3. AI Summary cho Review tiêu cực

#### 3.3.1. Phân tích Review
**Tính năng (tương lai):**
- Khi review có rating ≤ 2 sao
- AI tự động phân tích:
  - Điểm tiêu cực chính
  - Gợi ý cải thiện cho admin
  - Phân loại vấn đề (service, quality, price, etc.)

---

## 4. ADMIN - QUẢN LÝ PARTNERS

### 4.1. Danh sách Partners

#### 4.1.1. Quản lý Partners
**URL:** `/admin/partners`

**Tính năng:**
- Table với pagination
- Search: Tên, email, phone
- Filters:
  - Status (ACTIVE, INACTIVE)
  - Date range
- Actions:
  - Xem chi tiết
  - Sửa
  - Xóa
  - Toggle status

**API Endpoint:**
```
GET /api/admin/partners?page=0&size=20&search=...&status=...
```

### 4.2. CRUD Partner

#### 4.2.1. Tạo Partner
**Form:**
- Name, Slug
- Description
- Contact: Email, Phone, Address
- Images (logo, gallery)
- Status

**API Endpoint:**
```
POST /api/admin/partners
```

#### 4.2.2. Quản lý Tour của Partner
**Tính năng:**
- Xem danh sách tour của partner
- Thêm tour cho partner
- Xóa tour khỏi partner

---

## 5. ADMIN - QUẢN LÝ PROMOTIONS

### 5.1. Danh sách Promotions

#### 5.1.1. Quản lý Promotions
**URL:** `/admin/promotions`

**Tính năng:**
- Table với pagination
- Search: Code, name, description
- Filters:
  - Status (ACTIVE, EXPIRED, INACTIVE)
  - Type (PERCENTAGE, FIXED_AMOUNT)
  - Date range
- Sort: Ngày tạo, expiry date
- Actions:
  - Xem chi tiết
  - Sửa
  - Xóa
  - Mark expired (batch)

**API Endpoint:**
```
GET /api/admin/promotions?page=0&size=20&search=...&status=...
```

### 5.2. CRUD Promotion

#### 5.2.1. Tạo Promotion
**Form:**
- Code (unique)
- Name, Description
- Type: PERCENTAGE hoặc FIXED_AMOUNT
- Value: % hoặc số tiền
- Min Order Amount (optional)
- Max Discount (optional, cho percentage)
- Start Date, End Date
- Usage Limit (optional)
- Status

**Luồng:**
1. Admin tạo promotion
2. Backend:
   - Validate code unique
   - Validate dates
   - Tạo promotion
   - Gửi notification cho tất cả users
   - Gửi email cho newsletter subscribers

**API Endpoint:**
```
POST /api/admin/promotions
Body: {
  "code": "SUMMER2024",
  "name": "Giảm giá mùa hè",
  "type": "PERCENTAGE",
  "value": 20,
  "minOrderAmount": 1000000,
  "maxDiscount": 500000,
  "startDate": "2024-06-01",
  "endDate": "2024-08-31"
}
```

#### 5.2.2. Validate Promotion
**Public API:**
```
POST /api/promotions/validate
Body: { "code": "SUMMER2024" }
Response: {
  "code": "SUMMER2024",
  "type": "PERCENTAGE",
  "value": 20,
  "minOrderAmount": 1000000
}
```

---

## 6. ADMIN - QUẢN LÝ LOYALTY

### 6.1. Quản lý Loyalty Program

#### 6.1.1. Trang Loyalty
**URL:** `/admin/loyalty`

**Tính năng:**
- Xem cấu hình loyalty:
  - Points per booking (%)
  - Points per review
  - Points per referral
  - Level thresholds
- Top users by points
- Transaction history (all users)
- Adjust points manually

**API Endpoints:**
```
GET /api/admin/loyalty/config
PUT /api/admin/loyalty/config
GET /api/loyalty/admin/top-users?limit=10
POST /api/loyalty/admin/users/{userId}/points
```

### 6.2. Điều chỉnh Points

#### 6.2.1. Cộng/Trừ điểm thủ công
**Luồng:**
1. Admin tìm user
2. Click "Điều chỉnh điểm"
3. Nhập:
   - Points (+ hoặc -)
   - Reason (lý do)
4. Submit
5. Backend:
   - Tạo transaction với sourceType = `ADMIN`
   - Update total points
   - Log activity

**API Endpoint:**
```
POST /api/loyalty/admin/users/{userId}/points
Body: {
  "points": 500,
  "reason": "Bồi thường cho sự cố"
}
```

---

## 7. ADMIN - QUẢN LÝ NOTIFICATIONS

### 7.1. Tạo và Gửi Notifications

#### 7.1.1. Quản lý Notifications
**URL:** `/admin/notifications`

**Tính năng:**
- Danh sách notifications đã gửi
- Tạo notification mới:
  - Title
  - Message
  - Type (INFO, SUCCESS, WARNING, ERROR)
  - Link (optional)
  - Target: All users, Specific user, Specific role
- Gửi notification:
  - Real-time (SSE)
  - Email (optional)
  - In-app notification

**API Endpoint:**
```
POST /api/admin/notifications
Body: {
  "title": "Khuyến mãi mới!",
  "message": "...",
  "type": "INFO",
  "link": "/tours",
  "targetType": "ALL_USERS"
}
```

### 7.2. Broadcast Notifications

#### 7.2.1. Gửi cho tất cả users
**Luồng:**
1. Admin tạo notification
2. Chọn target = "All users"
3. Submit
4. Backend:
   - Tạo notification records cho tất cả users
   - Push qua SSE (real-time)
   - Gửi email (nếu chọn)
   - Log activity

---

## 8. ADMIN - QUẢN LÝ CONTACTS

### 8.1. Quản lý Liên hệ

#### 8.1.1. Danh sách Contacts
**URL:** `/admin/contacts`

**Tính năng:**
- Table với pagination
- Search: Name, email, subject
- Filters:
  - Status (NEW, IN_PROGRESS, RESOLVED, CLOSED)
  - Date range
- Actions:
  - Xem chi tiết
  - Update status
  - Assign to admin
  - Add internal notes
  - Reply (gửi email)

**API Endpoint:**
```
GET /api/admin/contacts?page=0&size=20&status=NEW
```

### 8.2. Xử lý Contact Request

#### 8.2.1. Workflow
**Luồng:**
1. User gửi contact form (public)
2. Tạo ContactRequest với status = `NEW`
3. Admin xem danh sách
4. Click vào contact:
   - Xem message
   - Update status = `IN_PROGRESS`
   - Assign to admin
   - Add notes (nội bộ)
5. Reply:
   - Gửi email reply
   - Update status = `RESOLVED`
6. Close: status = `CLOSED`

**API Endpoints:**
```
PUT /api/admin/contacts/{contactId}/status?status=IN_PROGRESS
PUT /api/admin/contacts/{contactId}/assign?adminId=...
POST /api/admin/contacts/{contactId}/reply
```

---

## 9. ADMIN - QUẢN LÝ BANNERS

### 9.1. Quản lý Banners

#### 9.1.1. Danh sách Banners
**URL:** `/admin/banners`

**Tính năng:**
- Table với pagination
- Search: Title, subtitle
- Filters:
  - Status (ACTIVE, INACTIVE, SCHEDULED)
- Sort: Display order
- Actions:
  - Xem preview
  - Sửa
  - Xóa
  - Toggle active
  - Reorder (drag & drop)

**API Endpoint:**
```
GET /api/admin/banners?page=0&size=20&status=ACTIVE
```

### 9.2. CRUD Banner

#### 9.2.1. Tạo Banner
**Form:**
- Title, Subtitle
- Image (upload)
- Link URL (optional)
- Button Text (optional)
- Display Order
- Is Active
- Start Date, End Date (scheduled)

**API Endpoint:**
```
POST /api/admin/banners
Content-Type: multipart/form-data
```

**Hiển thị:**
- Banners hiển thị trên landing page (Hero Section)
- Tự động chuyển slide
- Click banner → Navigate to link URL

---

## 10. CHATBOT AI

### 10.1. Tổng quan Chatbot

#### 10.1.1. Kiến trúc
- **Backend**: Python Flask (Port 5000)
- **LLM**: OpenAI GPT-4/GPT-3.5
- **Vector DB**: FAISS (Facebook AI Similarity Search)
- **RAG**: Retrieval-Augmented Generation
- **Embeddings**: OpenAI text-embedding-ada-002

**Các tính năng:**
1. Tư vấn tour thông minh
2. Tìm kiếm bằng hình ảnh
3. Tổng hợp review bằng AI
4. Intent classification
5. Context-aware responses

### 10.2. Tư vấn Tour

#### 10.2.1. Luồng Chat
**Frontend:**
1. User mở chatbot (button ở góc dưới)
2. Nhập câu hỏi: "Tour du lịch biển giá rẻ"
3. Gửi POST `/api/chatbot/ask` (streaming)
4. Backend (Chatbot service):
   - **Intent Classification**: Phân loại ý định (tìm tour, hỏi giá, hỏi chính sách)
   - **Extract Filters**: Trích xuất filters từ câu hỏi (location, price, duration)
   - **RAG Search**: Tìm kiếm trong knowledge base:
     - Embed user query
     - Search similar chunks trong FAISS
     - Lấy top-k chunks
     - Tạo context từ chunks
   - **Query Database**: Tìm tours matching filters
   - **Generate Response**: Dùng GPT với context để tạo câu trả lời
   - **Stream Response**: Trả về từng chunk (SSE)

**API Endpoint:**
```
POST /api/chatbot/ask
Body: {
  "query": "Tour du lịch biển giá rẻ",
  "session_id": "uuid"
}
Response: Server-Sent Events (streaming)
```

#### 10.2.2. Knowledge Base
**Nội dung:**
- Tour descriptions
- Policies (cancellation, refund)
- FAQ
- General travel info

**Cấu trúc:**
- Chunks được embed và lưu trong FAISS
- Metadata: tour_id, chunk_type, source

#### 10.2.3. Context Creation
**Luồng:**
1. User query → Embed
2. Search FAISS → Top-k chunks
3. Filter by metadata (nếu cần)
4. Create enhanced context:
   - General info
   - Tour-specific info
   - Policies
   - FAQ
5. Send to GPT với context

### 10.3. Tổng hợp Review bằng AI

#### 10.3.1. Review Summary
**Luồng:**
1. Backend gọi chatbot service
2. Gửi tất cả reviews của tour
3. Prompt GPT:
   ```
   Phân tích các review sau và tóm tắt:
   - Điểm tích cực (3-5 điểm)
   - Điểm tiêu cực (nếu có)
   - Tổng kết (1 đoạn)
   ```
4. GPT return structured summary
5. Backend parse và return

**API Endpoint (Internal):**
```
POST /api/chatbot/review-summary
Body: {
  "tour_id": 1,
  "reviews": [...]
}
```

---

## 11. TÌM KIẾM BẰNG HÌNH ẢNH

### 11.1. Image Search

#### 11.1.1. Luồng tìm kiếm
**Frontend:**
1. User click "Tìm bằng hình ảnh"
2. Upload hoặc chụp ảnh
3. Convert sang base64
4. Gửi POST `/api/tours/search-by-image`

**Backend:**
1. Nhận image data
2. Gọi chatbot service: POST `/SearchByImage`
3. Chatbot:
   - Load CLIP model
   - Encode image → embedding
   - Search trong FAISS image index
   - Tìm top-k similar tour images
   - Verify với LLM (nếu cần)
   - Return tour IDs
4. Backend query tours từ database
5. Return tour responses

**API Endpoint:**
```
POST /api/tours/search-by-image
Body: {
  "imageData": "base64-encoded-image",
  "limit": 5
}
Response: {
  "tours": [...]
}
```

#### 11.1.2. Image Index
**Cấu trúc:**
- Tour images được embed bằng CLIP
- Lưu embeddings trong FAISS
- Metadata: tour_id, image_url

---

## 12. RECOMMENDATIONS

### 12.1. Personalized Recommendations

#### 12.1.1. Gợi ý dựa trên lịch sử
**Luồng:**
1. User vào landing page
2. Frontend gọi GET `/api/recommendations/personalized?userId=...`
3. Backend:
   - Lấy categories từ booking history của user
   - Query tours từ các categories đó
   - Nếu không có history → Fallback to featured tours
   - Return top 8 tours
4. Frontend hiển thị section "Gợi ý cho bạn"

**API Endpoint:**
```
POST /api/recommendations/personalized
Body: {
  "userId": 123,
  "limit": 8
}
```

### 12.2. Trending Tours

#### 12.2.1. Tour phổ biến
**Logic:**
- Tours có nhiều booking nhất trong 30 ngày gần nhất
- Sort by booking count

**API Endpoint:**
```
GET /api/recommendations/trending?limit=6
```

### 12.3. Similar Tours

#### 12.3.1. Tour tương tự
**Logic:**
- Dựa trên category, location, price range
- Exclude tour hiện tại

**API Endpoint:**
```
GET /api/recommendations/similar/{tourId}?limit=6
```

---

## 13. WEATHER WIDGET

### 13.1. Hiển thị thời tiết

#### 13.1.1. Widget thời tiết
**Tính năng:**
- Hiển thị trên tour detail page
- Lấy location từ tour
- Gọi weather API (OpenWeatherMap hoặc tương tự)
- Hiển thị:
  - Nhiệt độ
  - Mô tả (sunny, cloudy, etc.)
  - Icon
  - Forecast (5 ngày)

**API Endpoint:**
```
GET /api/weather?location=...&lat=...&lon=...
```

**Frontend Component:**
- `WeatherWidget`
- Auto-refresh mỗi 30 phút
- Cache để giảm API calls

---

## 14. NEWSLETTER

### 14.1. Đăng ký Newsletter

#### 14.1.1. Subscribe
**Luồng:**
1. User nhập email ở footer
2. Submit POST `/api/newsletters/subscribe`
3. Backend:
   - Kiểm tra email đã subscribe chưa
   - Tạo newsletter entry
   - Gửi email xác nhận
4. Frontend hiển thị success message

**API Endpoint:**
```
POST /api/newsletters/subscribe
Body: { "email": "user@example.com" }
```

### 14.2. Gửi Newsletter

#### 14.2.1. Admin gửi email
**Tính năng:**
- Admin có thể gửi email cho tất cả subscribers
- Khi có promotion mới → Auto-send (nếu config)

---

## 15. LIVE CHAT

### 15.1. Tawk.to Integration

#### 15.1.1. Widget Live Chat
**Tính năng:**
- Tích hợp Tawk.to
- Hiển thị widget ở góc dưới bên phải
- Ẩn trên admin pages và auth pages
- Auto-show/hide dựa trên route

**Component:**
- `TawkToWidget`
- Load Tawk.to script
- Initialize với property ID

---

## TỔNG KẾT

### Các tính năng chính đã triển khai:

#### **User Features:**
1. ✅ Đăng ký, đăng nhập, OAuth
2. ✅ Tìm kiếm tour (text, filters, image)
3. ✅ Xem chi tiết tour
4. ✅ Đặt tour, thanh toán VNPay
5. ✅ Đánh giá tour (với images)
6. ✅ AI summary reviews
7. ✅ Wishlist
8. ✅ Loyalty points, vouchers, referral
9. ✅ Hủy tour, hoàn tiền
10. ✅ Quản lý profile, notifications

#### **Admin Features:**
1. ✅ Dashboard với KPI và charts
2. ✅ CRUD Tours, Categories, Partners
3. ✅ Quản lý Bookings (filter, export CSV/Excel)
4. ✅ Quản lý Users (filter, export CSV/Excel)
5. ✅ Quản lý Reviews (approve/reject)
6. ✅ Quản lý Promotions
7. ✅ Quản lý Loyalty (config, adjust points)
8. ✅ Thống kê và báo cáo (export revenue)
9. ✅ Quản lý Notifications, Contacts, Banners
10. ✅ Security: @PreAuthorize, role-based access

#### **AI/ML Features:**
1. ✅ Chatbot tư vấn tour (RAG, GPT-4)
2. ✅ Tìm kiếm bằng hình ảnh (CLIP, FAISS)
3. ✅ AI summary reviews
4. ✅ Intent classification
5. ✅ Personalized recommendations

#### **Technical Features:**
1. ✅ JWT Authentication + Refresh Token
2. ✅ Real-time Notifications (SSE)
3. ✅ Email notifications
4. ✅ File upload (images)
5. ✅ Export CSV/Excel (Apache POI)
6. ✅ Pagination, Search, Filters
7. ✅ Internationalization (Vi/En)
8. ✅ Responsive UI (Tailwind CSS)
9. ✅ Error handling, validation
10. ✅ Database migrations (Flyway)

---

**Kết thúc tài liệu**

Tài liệu này mô tả đầy đủ các chức năng từ cơ bản đến nâng cao của hệ thống quản lý tour du lịch, phục vụ cho việc làm khóa luận tốt nghiệp.

