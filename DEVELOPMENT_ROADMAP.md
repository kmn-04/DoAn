# 📋 THỨ TỰ CHỨC NĂNG CẦN LÀM

## 🔧 1. SETUP BAN ĐẦU
1. [ ] Setup MySQL database từ file `csdl.sql`
2. [ ] Cấu hình `application.properties` với database connection
3. [ ] Setup Spring Boot project structure
4. [ ] Setup React project với Vite và TailwindCSS
5. [ ] Setup Git repository

## 🔐 2. HỆ THỐNG ĐĂNG NHẬP
6. [ ] Tạo User entity và repository
7. [ ] Implement Spring Security + JWT
8. [ ] API đăng ký tài khoản (`/api/auth/register`)
9. [ ] API đăng nhập (`/api/auth/login`)
10. [ ] Frontend: Form đăng ký/đăng nhập
11. [ ] Frontend: Xử lý JWT token và protected routes

## 📝 3. QUẢN LÝ DANH MỤC (ADMIN) ✅ HOÀN THÀNH
12. [x] Tạo Category entity và repository
13. [x] API CRUD categories (`/api/categories`)
14. [x] Frontend Admin: Quản lý danh mục với drag-and-drop
    - [x] Component CategoryManagement với bảng danh sách
    - [x] Component CategoryFormModal cho thêm/sửa
    - [x] Drag & drop reordering với @dnd-kit
    - [x] Upload ảnh đại diện và gallery
    - [x] Tìm kiếm và filter danh mục
    - [x] API endpoints đầy đủ với phân quyền
    - [x] Responsive design và error handling

## 🗺️ 4. QUẢN LÝ TOUR (ADMIN)
15. [ ] Tạo Tour entity với relationships
16. [ ] API CRUD tours (`/api/tours`)
17. [ ] API upload ảnh tour
18. [ ] Frontend Admin: Form tạo/sửa tour
19. [ ] Frontend Admin: Danh sách tour với search/filter

## 🌍 5. HIỂN THỊ TOUR (PUBLIC)
20. [ ] API public tours (`/api/public/tours`)
21. [ ] API chi tiết tour (`/api/public/tours/{id}`)
22. [ ] Frontend: Trang chủ với danh sách tour
23. [ ] Frontend: Trang chi tiết tour
24. [ ] Frontend: Tìm kiếm và lọc tour

## 📅 6. HỆ THỐNG ĐẶT TOUR
25. [ ] Tạo Booking entity và repository
26. [ ] API tạo booking (`/api/bookings`)
27. [ ] API lịch sử booking user (`/api/bookings/user/{id}`)
28. [ ] Frontend: Form đặt tour
29. [ ] Frontend: Trang xác nhận booking
30. [ ] Frontend: Lịch sử đặt tour của user

## 💳 7. HỆ THỐNG THANH TOÁN
31. [ ] Tạo Payment entity và repository
32. [ ] Tích hợp cổng thanh toán (VNPay/MoMo)
33. [ ] API tạo payment (`/api/payments/create`)
34. [ ] API callback payment (`/api/payments/callback`)
35. [ ] Frontend: Chọn phương thức thanh toán
36. [ ] Frontend: Trang kết quả thanh toán

## 👤 8. QUẢN LỸ NGƯỜI DÙNG (ADMIN)
37. [ ] API quản lý users (`/api/admin/users`)
38. [ ] API quản lý bookings (`/api/admin/bookings`)
39. [ ] Frontend Admin: Danh sách users
40. [ ] Frontend Admin: Quản lý booking

## ⭐ 9. ĐÁNH GIÁ VÀ BÌNH LUẬN
41. [ ] Tạo Review entity và repository
42. [ ] API đánh giá tour (`/api/reviews`)
43. [ ] Frontend: Form đánh giá tour
44. [ ] Frontend: Hiển thị đánh giá trên tour

## 👨‍💼 10. QUẢN LÝ ĐỐI TÁC
45. [ ] API quản lý partners (`/api/partners`)
46. [ ] Frontend Admin: Quản lý đối tác

## 📰 11. QUẢN LÝ BLOG/TIN TỨC
47. [ ] API quản lý blog posts (`/api/blog`)
48. [ ] Frontend Admin: Tạo/sửa bài viết
49. [ ] Frontend: Trang blog và chi tiết bài viết

## 🔔 12. HỆ THỐNG THÔNG BÁO
50. [ ] API notifications (`/api/notifications`)
51. [ ] Frontend: Hiển thị thông báo cho user

## 📊 13. BÁO CÁO VÀ THỐNG KÊ (ADMIN)
52. [ ] API thống kê doanh thu (`/api/admin/stats`)
53. [ ] Frontend Admin: Dashboard với charts

## 📱 14. RESPONSIVE VÀ UX
54. [ ] Responsive design cho mobile
55. [ ] Loading states và error handling
56. [ ] Form validation
57. [ ] Toast notifications

## 🔒 15. BẢO MẬT VÀ TỐI ƯU
58. [ ] Implement CORS
59. [ ] Input validation và sanitization
60. [ ] API rate limiting
61. [ ] Performance optimization

## 🚀 16. DEPLOYMENT
62. [ ] Setup production database
63. [ ] Configure environment variables
64. [ ] Build và deploy backend
65. [ ] Build và deploy frontend
66. [ ] Domain và SSL setup

---

## ⚡ LƯU Ý QUAN TRỌNG

**Thứ tự làm theo từng nhóm:**
- Làm xong setup (1-5) mới chuyển sang login (6-11)
- Làm xong login mới làm quản lý tour (12-19)
- Làm xong hiển thị tour mới làm booking (25-30)
- Các chức năng khác có thể làm song song sau khi có booking

**Mỗi chức năng cần test kỹ trước khi chuyển sang chức năng tiếp theo!**
