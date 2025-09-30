# 🧪 HƯỚNG DẪN TEST BỘ LỌC TOUR

## 📊 Tổng quan dữ liệu test

### Tour Trong Nước (10 tours):
- **Miền Bắc**: 6 tours
- **Miền Trung**: 2 tours  
- **Miền Nam**: 2 tours

### Tour Quốc Tế (15 tours):
- **Nhật Bản**: 2 tours (Tokyo, Hokkaido)
- **Hàn Quốc**: 2 tours (Seoul, Busan)
- **Thái Lan**: 2 tours (Bangkok, Phuket)
- **Singapore**: 1 tour
- **Malaysia**: 1 tour
- **Indonesia**: 1 tour (Bali)
- **Trung Quốc**: 1 tour
- **Châu Âu**: 2 tours (Pháp, Ý)
- **Mỹ**: 1 tour
- **Úc**: 1 tour

---

## 🎯 Test Cases cho Bộ Lọc

### 1. **Loại Tour (Tour Type)**

#### Test Case 1.1: Chọn "Trong nước"
- **Mong đợi**: Hiển thị 10 tours
- **Danh mục**: Chỉ hiện các danh mục trong nước
- **Địa điểm**: Chỉ hiện các tỉnh/thành VN

#### Test Case 1.2: Chọn "Quốc tế"
- **Mong đợi**: Hiển thị 15 tours
- **Danh mục**: Chỉ hiện các danh mục quốc tế
- **Địa điểm**: Chỉ hiện các quốc gia

#### Test Case 1.3: Chọn "Tất cả"
- **Mong đợi**: Hiển thị 25 tours
- **Danh mục**: Hiện tất cả danh mục
- **Địa điểm**: Hiện cả tỉnh/thành VN và quốc gia

---

### 2. **Danh Mục (Category)**

#### Test Case 2.1: Trong nước + Du lịch miền Bắc
- **Mong đợi**: 6 tours (Hà Nội-Hạ Long, Sapa, Đà Lạt, Tây Bắc, Tây Nguyên, Tây Bắc)

#### Test Case 2.2: Trong nước + Du lịch biển đảo
- **Mong đợi**: 2 tours (Phú Quốc, Nha Trang)

#### Test Case 2.3: Quốc tế + Du lịch Nhật Bản
- **Mong đợi**: 2 tours (Tokyo-Kyoto-Osaka, Hokkaido)

#### Test Case 2.4: Quốc tế + Du lịch Đông Nam Á
- **Mong đợi**: 5 tours (Bangkok, Phuket, Singapore, KL, Bali)

---

### 3. **Giá (Price Range)**

#### Test Case 3.1: Dưới 2 triệu
- **Mong đợi**: 2 tours
  - Sapa (1,890,000đ)
  - TP.HCM - Củ Chi (1,590,000đ)

#### Test Case 3.2: 2-5 triệu
- **Mong đợi**: 6 tours
  - Hà Nội-Hạ Long (2,490,000đ sale)
  - Đà Lạt (2,790,000đ)
  - Nha Trang (2,990,000đ sale)
  - Huế (3,290,000đ)
  - Đà Nẵng (3,490,000đ sale)
  - Tây Nguyên (4,990,000đ)

#### Test Case 3.3: 5-10 triệu
- **Mong đợi**: 4 tours
  - Phú Quốc (5,490,000đ sale)
  - Tây Bắc (6,490,000đ sale)
  - Malaysia (5,990,000đ sale)
  - Bangkok (7,490,000đ sale)

#### Test Case 3.4: 10-20 triệu
- **Mong đợi**: 4 tours
  - Phuket (11,490,000đ sale)
  - Bali (12,490,000đ sale)
  - Singapore (14,900,000đ sale)
  - Seoul (16,900,000đ sale)

#### Test Case 3.5: Trên 20 triệu
- **Mong đợi**: 9 tours quốc tế (Hokkaido, Busan, Trung Quốc, Pháp, Ý, Mỹ, Úc...)

---

### 4. **Thời Gian (Duration)**

#### Test Case 4.1: 1 ngày
- **Mong đợi**: 0 tours

#### Test Case 4.2: 2-3 ngày
- **Mong đợi**: 6 tours
  - Sapa (2 ngày)
  - TP.HCM (2 ngày)
  - Hà Nội-Hạ Long (3 ngày)
  - Huế (3 ngày)
  - Đà Lạt (3 ngày)
  - Nha Trang (3 ngày)
  - Malaysia (3 ngày)

#### Test Case 4.3: 4-7 ngày
- **Mong đợi**: 13 tours
  - Đà Nẵng (4 ngày)
  - Phú Quốc (4 ngày)
  - Tây Nguyên (4 ngày)
  - Bangkok (4 ngày)
  - Singapore (4 ngày)
  - Busan (4 ngày)
  - Seoul (5 ngày)
  - Phuket (5 ngày)
  - Bali (5 ngày)
  - Tây Bắc (5 ngày)
  - Hokkaido (6 ngày)
  - Tokyo (7 ngày)
  - Trung Quốc (7 ngày)
  - Ý (7 ngày)

#### Test Case 4.4: 8-14 ngày
- **Mong đợi**: 3 tours
  - Pháp (8 ngày)
  - Úc (9 ngày)
  - Mỹ (10 ngày)

---

### 5. **Địa Điểm (Location)**

#### Test Case 5.1: Trong nước + Quảng Ninh
- **Mong đợi**: 1 tour (Hà Nội-Hạ Long-Ninh Bình)

#### Test Case 5.2: Trong nước + Kiên Giang
- **Mong đợi**: 1 tour (Phú Quốc)

#### Test Case 5.3: Trong nước + Đà Nẵng
- **Mong đợi**: 1 tour (Đà Nẵng - Hội An - Bà Nà)

#### Test Case 5.4: Quốc tế + Tokyo
- **Mong đợi**: 1 tour (Tokyo-Kyoto-Osaka)

#### Test Case 5.5: Quốc tế + Seoul
- **Mong đợi**: 1 tour (Seoul - Jeju)

---

### 6. **Đánh Giá (Rating)**

#### Test Case 6.1: 4.5⭐ trở lên
- **Mong đợi**: 14 tours
  - Rating 5.0: Hokkaido, Pháp
  - Rating 4.9: Sapa, Phú Quốc, Phuket, Tokyo, Ý, Úc
  - Rating 4.8: Hà Nội-Hạ Long, Nha Trang, Seoul, Bali, Mỹ
  - Rating 4.7: Đà Nẵng, Đà Lạt, Singapore, Busan
  - Rating 4.6: Huế, Tây Nguyên, Bangkok, Trung Quốc
  - Rating 4.5: TP.HCM, Tây Bắc, Malaysia

#### Test Case 6.2: 4⭐ trở lên
- **Mong đợi**: Tất cả 25 tours (vì tất cả đều >= 4.5)

#### Test Case 6.3: 3.5⭐ trở lên
- **Mong đợi**: Tất cả 25 tours

---

### 7. **Sắp Xếp (Sort By)**

#### Test Case 7.1: Giá thấp nhất
- **Mong đợi**: 
  - #1: TP.HCM (1,590,000đ)
  - #2: Sapa (1,890,000đ)
  - #3: Hà Nội-Hạ Long (2,490,000đ)

#### Test Case 7.2: Giá cao nhất
- **Mong đợi**:
  - #1: Mỹ (89,900,000đ)
  - #2: Úc (82,900,000đ)
  - #3: Pháp (64,900,000đ)

#### Test Case 7.3: Đánh giá cao
- **Mong đợi**:
  - #1: Hokkaido (5.0⭐)
  - #2: Pháp (5.0⭐)
  - Tiếp theo: các tour 4.9⭐

#### Test Case 7.4: Phổ biến nhất (theo review_count)
- **Mong đợi**:
  - #1: Bangkok (892 reviews)
  - #2: Phuket (756 reviews)
  - #3: Bali (689 reviews)

---

### 8. **Bao Gồm Vé Bay (Flight Included)**

#### Test Case 8.1: Quốc tế + Có vé bay
- **Mong đợi**: 12 tours
  - Tokyo, Hokkaido (Nhật)
  - Seoul, Busan (Hàn)
  - Bangkok, Phuket (Thái)
  - Singapore
  - Malaysia
  - Bali
  - Trung Quốc
  - Pháp, Ý
  - Mỹ, Úc

#### Test Case 8.2: Quốc tế + Không vé bay
- **Mong đợi**: 3 tours không tick flight_included

---

### 9. **Cần Visa (Visa Required)**

#### Test Case 9.1: Quốc tế + Cần visa
- **Mong đợi**: 10 tours
  - Nhật: Tokyo, Hokkaido
  - Hàn: Seoul, Busan
  - Indonesia: Bali
  - Trung Quốc
  - Pháp, Ý
  - Mỹ, Úc

#### Test Case 9.2: Quốc tế + Không cần visa
- **Mong đợi**: 5 tours
  - Thái Lan: Bangkok, Phuket
  - Singapore
  - Malaysia

---

### 10. **Kết Hợp Nhiều Bộ Lọc**

#### Test Case 10.1: Trong nước + Biển đảo + 3-5 triệu + 4⭐
- **Mong đợi**: 1 tour (Nha Trang - 2,990,000đ - 4.8⭐)

#### Test Case 10.2: Quốc tế + Châu Á + Dưới 10 triệu + Không visa
- **Mong đợi**: 3 tours
  - Bangkok (7,490,000đ)
  - Malaysia (5,990,000đ)

#### Test Case 10.3: Quốc tế + 7+ ngày + 4.8⭐ + Có vé bay
- **Mong đợi**: 6 tours
  - Tokyo (7N - 4.9⭐)
  - Trung Quốc (7N - 4.6⭐)
  - Pháp (8N - 5.0⭐)
  - Ý (7N - 4.9⭐)
  - Mỹ (10N - 4.8⭐)
  - Úc (9N - 4.9⭐)

---

## 🚀 Cách Chạy Test

### Bước 1: Chạy SQL script
```bash
mysql -u root -p travelbooking < test-tour-data.sql
```

### Bước 2: Test trên Frontend
1. Mở trang `/tours`
2. Thử từng bộ lọc theo test cases trên
3. Kiểm tra số lượng kết quả
4. Kiểm tra logic reset khi đổi loại tour
5. Kiểm tra kết hợp nhiều bộ lọc

### Bước 3: Kiểm tra Edge Cases
- Chọn "Trong nước" → Chọn category quốc tế → Phải reset về "Tất cả"
- Chọn "Trong nước" → Chọn location quốc tế → Phải reset về "Tất cả"
- Chọn nhiều filter → Clear all → Tất cả về mặc định

---

## 📋 Checklist Test

- [ ] Loại tour: Trong nước, Quốc tế, Tất cả
- [ ] Danh mục động theo loại tour
- [ ] Địa điểm động theo loại tour
- [ ] Giá: Tất cả các khoảng giá
- [ ] Thời gian: 1 ngày, 2-3, 4-7, 8-14, 15+
- [ ] Đánh giá: 3⭐, 3.5⭐, 4⭐, 4.5⭐
- [ ] Sắp xếp: Phổ biến, Giá thấp, Giá cao, Rating, Mới
- [ ] Vé bay (chỉ tour quốc tế)
- [ ] Visa (chỉ tour quốc tế)
- [ ] Kết hợp nhiều bộ lọc
- [ ] Reset bộ lọc
- [ ] Tìm kiếm text

---

## 🎯 Expected Results Summary

| Loại Tour | Số Tour | Giá Min | Giá Max | Rating TB |
|-----------|---------|---------|---------|-----------|
| Trong nước | 10 | 1.59M | 6.49M | 4.7 |
| Quốc tế | 15 | 5.99M | 89.9M | 4.8 |
| **TỔNG** | **25** | **1.59M** | **89.9M** | **4.75** |

---

## ✅ Hoàn thành!

Dữ liệu test đã bao phủ:
- ✅ Tất cả loại tour (Trong nước, Quốc tế)
- ✅ Tất cả khoảng giá (từ 1.5M đến 90M)
- ✅ Tất cả thời gian (2-10 ngày)
- ✅ Đa dạng địa điểm (15 tỉnh VN + 11 quốc gia)
- ✅ Đa dạng rating (4.5-5.0)
- ✅ Visa/Không visa
- ✅ Có/Không vé bay
