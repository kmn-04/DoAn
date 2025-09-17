# 🏨 Hướng dẫn Dữ liệu Mẫu - Hệ thống Quản lý Đối tác

## 📋 Tổng quan

Hệ thống quản lý đối tác bao gồm dữ liệu mẫu cho 3 loại đối tác chính:
- **Khách sạn (HOTEL)**: 6 đối tác
- **Nhà hàng (RESTAURANT)**: 6 đối tác  
- **Vận chuyển (TRANSPORT)**: 6 đối tác

**Tổng cộng: 18 đối tác mẫu** với đầy đủ thông tin và hình ảnh thực tế.

## 🗃️ Cấu trúc Dữ liệu

### 1. Bảng `partners`
Chứa thông tin cơ bản của đối tác:
- **Thông tin cơ bản**: Tên, loại, mô tả, ảnh đại diện
- **Liên hệ**: Địa chỉ, điện thoại, email, website
- **Đánh giá**: Rating (1-5 sao), khoảng giá (Budget/Mid-range/Luxury)
- **Trạng thái**: Hoạt động/Không hoạt động

### 2. Bảng `partner_gallery`
Chứa bộ sưu tập ảnh của đối tác:
- Mỗi đối tác có 2-4 ảnh gallery
- Sử dụng ảnh chất lượng cao từ Unsplash

### 3. Bảng `partner_amenities`
Chứa danh sách tiện nghi/dịch vụ:
- Mỗi đối tác có 5-12 tiện nghi
- Phù hợp với từng loại dịch vụ

## 📊 Chi tiết Dữ liệu Mẫu

### 🏨 KHÁCH SẠN (6 đối tác)

| ID | Tên | Rating | Khoảng giá | Địa điểm |
|----|-----|--------|------------|----------|
| 1 | Grand Hotel Saigon | 5⭐ | Luxury | TP.HCM |
| 2 | Riverside Resort Da Lat | 4⭐ | Mid-range | Đà Lạt |
| 3 | Boutique Hotel Hoi An | 4⭐ | Mid-range | Hội An |
| 4 | Beach Resort Nha Trang | 5⭐ | Luxury | Nha Trang |
| 5 | Budget Inn Backpacker | 3⭐ | Budget | TP.HCM |
| 6 | Mountain View Lodge | 4⭐ | Mid-range | Sa Pa |

**Tiện nghi khách sạn**: Wifi, bể bơi, gym, spa, nhà hàng, bar, bãi đậu xe, v.v.

### 🍽️ NHÀ HÀNG (6 đối tác)

| ID | Tên | Rating | Khoảng giá | Đặc sản |
|----|-----|--------|------------|---------|
| 7 | Nhà hàng Sài Gòn Xưa | 4⭐ | Mid-range | Ẩm thực truyền thống |
| 8 | Fine Dining Restaurant | 5⭐ | Luxury | Fusion cuisine |
| 9 | Quán Ăn Bình Dân | 3⭐ | Budget | Đường phố |
| 10 | Seafood Paradise | 4⭐ | Mid-range | Hải sản |
| 11 | Vegetarian Garden | 4⭐ | Mid-range | Chay |
| 12 | Street Food Corner | 3⭐ | Budget | Đa dạng |

**Tiện nghi nhà hàng**: Wifi, điều hòa, không gian riêng, karaoke, v.v.

### 🚗 VẬN CHUYỂN (6 đối tác)

| ID | Tên | Rating | Khoảng giá | Loại dịch vụ |
|----|-----|--------|------------|--------------|
| 13 | VIP Transport Service | 5⭐ | Luxury | Xe sang |
| 14 | Xe Khách Phương Trang | 4⭐ | Budget | Xe khách |
| 15 | Motorbike Rental | 3⭐ | Budget | Thuê xe máy |
| 16 | Airport Shuttle | 4⭐ | Mid-range | Đưa đón sân bay |
| 17 | Limousine Service | 5⭐ | Luxury | Limousine |
| 18 | Taxi Mai Linh | 3⭐ | Budget | Taxi |

**Tiện nghi vận chuyển**: Wifi trên xe, điều hòa, tài xế chuyên nghiệp, bảo hiểm, v.v.

## 🚀 Cách sử dụng

### Cách 1: Tự động load khi khởi động Spring Boot
Dữ liệu đã được thêm vào file `backend/src/main/resources/data.sql` và sẽ tự động load khi khởi động ứng dụng.

### Cách 2: Chạy file SQL riêng
```bash
mysql -u username -p database_name < partners_sample_data.sql
```

### Cách 3: Import qua MySQL Workbench
1. Mở MySQL Workbench
2. Chọn **File > Run SQL Script**
3. Chọn file `partners_sample_data.sql`
4. Thực thi

## 🔧 API Endpoints để test

### Lấy tất cả đối tác (Admin)
```
GET /api/partners/admin?page=0&size=10
```

### Lấy đối tác theo loại (Public)
```
GET /api/partners/type/HOTEL
GET /api/partners/type/RESTAURANT
GET /api/partners/type/TRANSPORT
```

### Tìm kiếm đối tác
```
GET /api/partners/admin?search=Grand&type=HOTEL
```

### Lấy thống kê
```
GET /api/partners/admin/stats
```

## 📱 Test trên Frontend

1. **Đăng nhập với tài khoản Admin**:
   - Email: `admin@tourism.com`
   - Password: `admin123`

2. **Truy cập trang quản lý đối tác**:
   - URL: `http://localhost:3000/partners`

3. **Các tính năng có thể test**:
   - ✅ Xem danh sách đối tác với pagination
   - ✅ Lọc theo loại (Khách sạn, Nhà hàng, Vận chuyển)
   - ✅ Lọc theo trạng thái (Hoạt động/Không hoạt động)
   - ✅ Tìm kiếm theo tên
   - ✅ Xem thống kê
   - ✅ Thêm đối tác mới
   - ✅ Chỉnh sửa thông tin đối tác
   - ✅ Xóa đối tác (có confirmation)
   - ✅ Toggle trạng thái hoạt động

## 🎨 Hình ảnh

Tất cả hình ảnh đều sử dụng từ **Unsplash** với chất lượng cao và phù hợp với từng loại dịch vụ:
- **Khách sạn**: Ảnh lobby, phòng, bể bơi, resort
- **Nhà hàng**: Ảnh không gian, món ăn, bàn ghế
- **Vận chuyển**: Ảnh xe hơi, xe khách, limousine

## 📈 Thống kê Dữ liệu

- **Tổng đối tác**: 18
- **Đang hoạt động**: 18 (100%)
- **Rating trung bình**: 4.0/5
- **Phân bố khoảng giá**:
  - Budget: 6 đối tác (33%)
  - Mid-range: 7 đối tác (39%)
  - Luxury: 5 đối tác (28%)

## 🔒 Lưu ý Bảo mật

- Tất cả email và website là **giả lập** cho mục đích demo
- Số điện thoại là **giả lập**
- Địa chỉ có thể **không chính xác**
- **KHÔNG** sử dụng dữ liệu này trong môi trường production

## 🛠️ Tùy chỉnh

Bạn có thể tùy chỉnh dữ liệu mẫu bằng cách:

1. **Thêm đối tác mới**: Sửa file SQL và thêm INSERT statements
2. **Thay đổi hình ảnh**: Thay URL ảnh từ Unsplash
3. **Cập nhật tiện nghi**: Thêm/bớt amenities phù hợp
4. **Điều chỉnh rating**: Thay đổi rating và price_range

## 📞 Hỗ trợ

Nếu gặp vấn đề khi import dữ liệu:

1. **Kiểm tra cấu trúc bảng**: Đảm bảo đã chạy migration
2. **Kiểm tra quyền MySQL**: User cần có quyền INSERT
3. **Xóa dữ liệu cũ**: Nếu cần reset, chạy DELETE trước
4. **Kiểm tra log**: Xem log Spring Boot để debug

---

🎉 **Chúc bạn test thành công hệ thống quản lý đối tác!** 🎉
