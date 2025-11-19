# MÔ TẢ DỰ ÁN: HỆ THỐNG QUẢN LÝ VÀ ĐẶT TOUR DU LỊCH

## 1. TỔNG QUAN

**Tên dự án:** Hệ thống quản lý và đặt tour du lịch thông minh tích hợp trí tuệ nhân tạo

**Mục đích:** Xây dựng nền tảng đặt tour du lịch trực tuyến với các tính năng hỗ trợ khách hàng thông minh bằng AI, cho phép khách hàng tìm kiếm, đặt tour và quản trị viên quản lý toàn bộ hoạt động kinh doanh.

## 2. CÔNG NGHỆ SỬ DỤNG

### Backend
- **Framework:** Spring Boot 3.5.6 (Java 21)
- **Database:** MySQL 8.0
- **Security:** Spring Security + JWT + OAuth2 (Google Login)
- **Payment:** VNPay Gateway

### Frontend
- **Framework:** React 19 + TypeScript 5.8
- **Build Tool:** Vite 7
- **UI:** Tailwind CSS + Headless UI
- **State Management:** Zustand + React Query

### AI Service
- **Framework:** Flask (Python)
- **AI Engine:** OpenAI GPT
- **Vector Database:** FAISS (RAG)
- **Tính năng:** Chatbot thông minh, phân loại ý định, tìm kiếm ảnh, tóm tắt review

## 3. KIẾN TRÚC HỆ THỐNG

```
Frontend (React) ↔ Backend (Spring Boot) ↔ Database (MySQL)
                            ↕
                     Chatbot AI (Flask)
```

## 4. CÁC CHỨC NĂNG CHÍNH

### 4.1. Chức năng khách hàng
- Đăng ký/Đăng nhập (Email, Google OAuth)
- Tìm kiếm và lọc tour theo nhiều tiêu chí
- Xem chi tiết tour (lịch trình, hình ảnh, reviews)
- Đặt tour và thanh toán online (VNPay)
- Hủy tour với tính toán hoàn tiền tự động
- Đánh giá và review tour
- Wishlist tour yêu thích
- Chatbot AI hỗ trợ 24/7
- Thông báo real-time (SSE)
- Gợi ý tour cá nhân hóa

### 4.2. Chức năng quản trị
- Dashboard với thống kê tổng quan
- Quản lý tour (CRUD, lịch trình, hình ảnh)
- Quản lý booking và xử lý hủy tour
- Quản lý người dùng
- Quản lý promotions và loyalty points
- Quản lý reviews và đối tác
- Thống kê doanh thu và báo cáo

### 4.3. Tích hợp AI
- **Chatbot thông minh:** Sử dụng RAG với FAISS để trả lời câu hỏi về tour
- **Tìm kiếm ảnh:** Upload ảnh địa điểm → AI tìm tour tương tự
- **Tóm tắt review:** Tự động tóm tắt hàng trăm reviews thành các điểm chính
- **Gợi ý cá nhân hóa:** AI gợi ý tour phù hợp với từng khách hàng

## 5. ĐIỂM NỔI BẬT

1. ✅ **Tích hợp AI mạnh mẽ:** Chatbot RAG, tìm kiếm ảnh, phân tích review
2. ✅ **Real-time notifications:** Server-Sent Events (SSE)
3. ✅ **Quy trình hủy tour tự động:** Tính hoàn tiền theo chính sách
4. ✅ **Loyalty Program:** Hệ thống điểm tích lũy và phân cấp thành viên
5. ✅ **Bảo mật cao:** JWT, OAuth2, role-based access control
6. ✅ **Tối ưu hiệu năng:** Caching, query optimization

## 6. ĐỘ HOÀN THIỆN

- **Tổng thể:** ~85-90%
- **Chức năng cốt lõi:** Hoàn thiện (Tour, Booking, Payment, Review)
- **Tích hợp AI:** Đã triển khai cơ bản, có thể mở rộng
- **Admin Panel:** Hoàn chỉnh với đầy đủ tính năng quản trị

## 7. HƯỚNG PHÁT TRIỂN

- Đa ngôn ngữ (i18n): Tiếng Anh, Trung, Hàn
- Tích hợp Review AI Summary vào UI
- Hoàn thiện Image Search UI
- SMS notifications
- Live chat hỗ trợ
- Export báo cáo PDF/Excel

---

**Lưu ý:** Dự án phù hợp cho khóa luận tốt nghiệp với mức độ phức tạp vừa phải, tích hợp nhiều công nghệ hiện đại và có tính ứng dụng thực tế cao.
