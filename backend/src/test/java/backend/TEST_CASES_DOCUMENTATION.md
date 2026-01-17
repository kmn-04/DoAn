# Tài liệu Test Cases - Hệ thống Đặt Tour Du Lịch

## Tổng quan

Tài liệu này mô tả các test case tự động đã được tạo cho hệ thống đặt tour du lịch. Các test case được viết bằng JUnit 5 và Spring Boot Test, bao gồm:

- **Controller Tests**: Test các API endpoints
- **Service Integration Tests**: Test logic nghiệp vụ với database

## Cấu trúc Test Cases

### 1. Authentication Controller Tests (TC001-TC012)

#### TC001: Đăng ký tài khoản thành công
- **Mô tả**: Test đăng ký user mới với thông tin hợp lệ
- **Input**: RegisterRequest với email, password, name, phone hợp lệ
- **Expected**: Status 200, trả về JWT token và user info

#### TC002: Đăng ký thất bại - Email đã tồn tại
- **Mô tả**: Test đăng ký với email đã được sử dụng
- **Input**: RegisterRequest với email đã tồn tại
- **Expected**: Status 400, thông báo lỗi

#### TC003: Đăng ký thất bại - Validation error (email không hợp lệ)
- **Mô tả**: Test validation email format
- **Input**: RegisterRequest với email không hợp lệ
- **Expected**: Status 400

#### TC004: Đăng ký thất bại - Mật khẩu không khớp
- **Mô tả**: Test validation password confirmation
- **Input**: RegisterRequest với password và confirmPassword khác nhau
- **Expected**: Status 400

#### TC005: Đăng nhập thành công
- **Mô tả**: Test đăng nhập với thông tin đúng
- **Input**: LoginRequest với email và password hợp lệ
- **Expected**: Status 200, trả về JWT token

#### TC006: Đăng nhập thất bại - Sai mật khẩu
- **Mô tả**: Test đăng nhập với mật khẩu sai
- **Input**: LoginRequest với password sai
- **Expected**: Status 400

#### TC007: Lấy thông tin user hiện tại
- **Mô tả**: Test API lấy thông tin user đang đăng nhập
- **Input**: Request với JWT token hợp lệ
- **Expected**: Status 200, trả về user info

#### TC008: Kiểm tra email đã tồn tại
- **Mô tả**: Test API kiểm tra email đã được sử dụng
- **Input**: Email đã tồn tại
- **Expected**: Status 200, data = true

#### TC009: Kiểm tra email chưa tồn tại
- **Mô tả**: Test API kiểm tra email chưa được sử dụng
- **Input**: Email mới
- **Expected**: Status 200, data = false

#### TC010: Refresh token thành công
- **Mô tả**: Test refresh JWT token
- **Input**: Refresh token hợp lệ
- **Expected**: Status 200, trả về JWT token mới

#### TC011: Refresh token thất bại - Token không hợp lệ
- **Mô tả**: Test refresh với token không hợp lệ
- **Input**: Refresh token không hợp lệ
- **Expected**: Status 400

#### TC012: Logout thành công
- **Mô tả**: Test logout user
- **Input**: JWT token hợp lệ
- **Expected**: Status 200, thông báo logout successful

---

### 2. Tour Controller Tests (TC013-TC023)

#### TC013: Lấy danh sách tour với phân trang
- **Mô tả**: Test API lấy danh sách tour có phân trang
- **Input**: Page = 0, Size = 20
- **Expected**: Status 200, trả về danh sách tour

#### TC014: Lấy tour theo ID thành công
- **Mô tả**: Test API lấy chi tiết tour
- **Input**: Tour ID hợp lệ
- **Expected**: Status 200, trả về tour details

#### TC015: Lấy tour theo ID thất bại - Tour không tồn tại
- **Mô tả**: Test API với tour ID không tồn tại
- **Input**: Tour ID = 999
- **Expected**: Status 404

#### TC016: Tìm kiếm tour theo từ khóa
- **Mô tả**: Test tìm kiếm tour bằng keyword
- **Input**: Keyword = "Đà Lạt"
- **Expected**: Status 200, trả về danh sách tour phù hợp

#### TC017: Tìm kiếm tour với bộ lọc giá
- **Mô tả**: Test tìm kiếm tour với khoảng giá
- **Input**: MinPrice = 3,000,000, MaxPrice = 6,000,000
- **Expected**: Status 200, trả về tour trong khoảng giá

#### TC018: Lấy danh sách tour nổi bật
- **Mô tả**: Test API lấy tour featured
- **Input**: None
- **Expected**: Status 200, trả về danh sách tour nổi bật

#### TC019: Lấy tour theo category
- **Mô tả**: Test API lấy tour theo category
- **Input**: Category ID = 1
- **Expected**: Status 200, trả về danh sách tour của category

#### TC020: Lấy top tour được đánh giá cao
- **Mô tả**: Test API lấy top rated tours
- **Input**: Limit = 10
- **Expected**: Status 200, trả về top 10 tour

#### TC021: Tạo tour mới thành công
- **Mô tả**: Test API tạo tour mới
- **Input**: TourCreateRequest hợp lệ
- **Expected**: Status 200, trả về tour đã tạo

#### TC022: Tạo tour thất bại - Validation error
- **Mô tả**: Test validation khi tạo tour
- **Input**: TourCreateRequest không hợp lệ (name quá ngắn, price âm)
- **Expected**: Status 400

#### TC023: Kiểm tra slug đã tồn tại
- **Mô tả**: Test API kiểm tra slug
- **Input**: Slug đã tồn tại
- **Expected**: Status 200, data = true

---

### 3. Booking Controller Tests (TC024-TC033)

#### TC024: Tính giá booking thành công
- **Mô tả**: Test API tính giá booking
- **Input**: Tour ID, số người lớn, số trẻ em
- **Expected**: Status 200, trả về giá tính toán

#### TC025: Tính giá booking với mã giảm giá
- **Mô tả**: Test tính giá với promotion code
- **Input**: Tour ID, số người, promotion code
- **Expected**: Status 200, trả về giá sau khi giảm

#### TC026: Tính giá booking thất bại - Tour không tồn tại
- **Mô tả**: Test với tour ID không hợp lệ
- **Input**: Tour ID = 999
- **Expected**: Status 400

#### TC027: Tạo booking thành công
- **Mô tả**: Test API tạo booking mới
- **Input**: BookingCreateRequest hợp lệ
- **Expected**: Status 201, trả về booking đã tạo

#### TC028: Tạo booking thất bại - Validation error
- **Mô tả**: Test validation khi tạo booking
- **Input**: BookingCreateRequest không hợp lệ
- **Expected**: Status 400

#### TC029: Tạo booking thất bại - Ngày bắt đầu trong quá khứ
- **Mô tả**: Test validation ngày bắt đầu
- **Input**: Start date là ngày trong quá khứ
- **Expected**: Status 400

#### TC030: Lấy danh sách booking
- **Mô tả**: Test API lấy tất cả booking
- **Input**: None
- **Expected**: Status 200, trả về danh sách booking

#### TC031: Lấy booking theo ID thành công
- **Mô tả**: Test API lấy chi tiết booking
- **Input**: Booking ID hợp lệ
- **Expected**: Status 200, trả về booking details

#### TC032: Lấy booking theo ID thất bại - Booking không tồn tại
- **Mô tả**: Test với booking ID không tồn tại
- **Input**: Booking ID = 999
- **Expected**: Status 404

#### TC033: Lấy booking theo user ID
- **Mô tả**: Test API lấy booking của user
- **Input**: User ID = 1
- **Expected**: Status 200, trả về danh sách booking của user

---

### 4. Review Controller Tests (TC034-TC042)

#### TC034: Lấy danh sách review đã được duyệt
- **Mô tả**: Test API lấy review đã approved
- **Input**: None
- **Expected**: Status 200, trả về danh sách review

#### TC035: Tạo review thành công
- **Mô tả**: Test API tạo review mới
- **Input**: ReviewCreateRequest hợp lệ
- **Expected**: Status 200, trả về review đã tạo

#### TC036: Tạo review thất bại - Rating quá cao
- **Mô tả**: Test validation rating (max = 5)
- **Input**: Rating = 6
- **Expected**: Status 400

#### TC037: Tạo review thất bại - Comment quá ngắn
- **Mô tả**: Test validation comment (min 10 ký tự)
- **Input**: Comment = "OK"
- **Expected**: Status 400

#### TC038: Tạo review thất bại - Comment quá dài
- **Mô tả**: Test validation comment (max 1000 ký tự)
- **Input**: Comment > 1000 ký tự
- **Expected**: Status 400

#### TC039: Lấy review theo tour ID
- **Mô tả**: Test API lấy review của tour
- **Input**: Tour ID = 1
- **Expected**: Status 200, trả về danh sách review

#### TC040: Lấy review theo user ID
- **Mô tả**: Test API lấy review của user
- **Input**: User ID = 1
- **Expected**: Status 200, trả về danh sách review

#### TC041: Cập nhật review thành công
- **Mô tả**: Test API cập nhật review
- **Input**: ReviewUpdateRequest hợp lệ
- **Expected**: Status 200, trả về review đã cập nhật

#### TC042: Xóa review thành công
- **Mô tả**: Test API xóa review
- **Input**: Review ID = 1
- **Expected**: Status 200, thông báo xóa thành công

---

### 5. Category Controller Tests (TC043-TC051)

#### TC043: Lấy danh sách tất cả category
- **Mô tả**: Test API lấy tất cả category
- **Input**: None
- **Expected**: Status 200, trả về danh sách category

#### TC044: Lấy danh sách category đang hoạt động
- **Mô tả**: Test API lấy category active
- **Input**: None
- **Expected**: Status 200, trả về danh sách category active

#### TC045: Lấy category theo ID thành công
- **Mô tả**: Test API lấy chi tiết category
- **Input**: Category ID = 1
- **Expected**: Status 200, trả về category details

#### TC046: Lấy category theo ID thất bại - Category không tồn tại
- **Mô tả**: Test với category ID không tồn tại
- **Input**: Category ID = 999
- **Expected**: Status 404

#### TC047: Lấy category theo slug thành công
- **Mô tả**: Test API lấy category bằng slug
- **Input**: Slug = "du-lich-trong-nuoc"
- **Expected**: Status 200, trả về category

#### TC048: Tạo category mới thành công
- **Mô tả**: Test API tạo category mới
- **Input**: CategoryCreateRequest hợp lệ
- **Expected**: Status 200, trả về category đã tạo

#### TC049: Tạo category thất bại - Validation error
- **Mô tả**: Test validation khi tạo category
- **Input**: CategoryCreateRequest không hợp lệ (name quá ngắn)
- **Expected**: Status 400

#### TC050: Kiểm tra slug đã tồn tại
- **Mô tả**: Test API kiểm tra slug
- **Input**: Slug đã tồn tại
- **Expected**: Status 200, data = true

#### TC051: Kiểm tra slug chưa tồn tại
- **Mô tả**: Test API kiểm tra slug
- **Input**: Slug mới
- **Expected**: Status 200, data = false

---

### 6. Tour Service Integration Tests (TC052-TC060)

#### TC052: Tìm tour theo ID thành công
- **Mô tả**: Integration test tìm tour trong database
- **Input**: Tour ID hợp lệ
- **Expected**: Trả về tour từ database

#### TC053: Tìm tour theo ID không tồn tại
- **Mô tả**: Test với tour ID không tồn tại
- **Input**: Tour ID = 999
- **Expected**: Optional.empty()

#### TC054: Tìm kiếm tour theo từ khóa
- **Mô tả**: Integration test tìm kiếm tour
- **Input**: Keyword = "Test"
- **Expected**: Trả về danh sách tour phù hợp

#### TC055: Tìm kiếm tour với bộ lọc giá
- **Mô tả**: Integration test tìm kiếm với filter giá
- **Input**: MinPrice, MaxPrice
- **Expected**: Trả về tour trong khoảng giá

#### TC056: Lấy danh sách tour đang hoạt động
- **Mô tả**: Integration test lấy tour active
- **Input**: None
- **Expected**: Trả về danh sách tour có status = ACTIVE

#### TC057: Lấy danh sách tour nổi bật
- **Mô tả**: Integration test lấy tour featured
- **Input**: None
- **Expected**: Trả về danh sách tour có isFeatured = true

#### TC058: Lấy tour theo category
- **Mô tả**: Integration test lấy tour theo category
- **Input**: Category ID
- **Expected**: Trả về danh sách tour của category

#### TC059: Kiểm tra slug đã tồn tại
- **Mô tả**: Integration test kiểm tra slug
- **Input**: Slug đã tồn tại
- **Expected**: true

#### TC060: Kiểm tra slug chưa tồn tại
- **Mô tả**: Integration test kiểm tra slug
- **Input**: Slug mới
- **Expected**: false

---

## Cách chạy Test

### ⚠️ QUAN TRỌNG: KHÔNG CẦN SHUTDOWN BACKEND!

Test chạy **độc lập** với backend đang chạy vì:
- Sử dụng **mock objects** và **in-memory database** (H2)
- Chạy trên **port khác** hoặc không cần port
- **KHÔNG** kết nối đến database thật

### Chạy tất cả test cases:

Mở **terminal mới** (không cần shutdown backend) và chạy:

```bash
cd d:\DoAn\backend
mvn test
```

### Chạy test theo class:

```bash
# Test Authentication
mvn test -Dtest=AuthControllerTest

# Test Tour Management
mvn test -Dtest=TourControllerTest

# Test Booking Management
mvn test -Dtest=BookingControllerTest

# Test Review Management
mvn test -Dtest=ReviewControllerTest

# Test Category Management
mvn test -Dtest=CategoryControllerTest

# Test Service Integration
mvn test -Dtest=TourServiceIntegrationTest
```

### Chạy test với coverage report:

```bash
mvn test jacoco:report
# Xem report tại: target/site/jacoco/index.html
```

### Xem hướng dẫn chi tiết:

Xem file `HUONG_DAN_CHAY_TEST.md` để biết thêm chi tiết về:
- Cấu hình test profile
- Troubleshooting
- Best practices
- Debug test

## Thống kê Test Cases

- **Tổng số test cases**: 60
- **Controller Tests**: 51 test cases
- **Service Integration Tests**: 9 test cases
- **Các chức năng được test**:
  - Authentication (12 test cases)
  - Tour Management (11 test cases)
  - Booking Management (10 test cases)
  - Review Management (9 test cases)
  - Category Management (9 test cases)
  - Service Integration (9 test cases)

## Lưu ý

1. Các test cases sử dụng MockMvc để test controller layer
2. Integration tests sử dụng TestEntityManager và in-memory database
3. Cần cấu hình test profile trong `application-test.yml`
4. Một số test cần mock authentication context với `@WithMockUser`

## Kết luận

Các test cases này bao phủ các chức năng chính của hệ thống, đảm bảo chất lượng code và giúp phát hiện lỗi sớm trong quá trình phát triển. Các test cases có thể được sử dụng trong khóa luận tốt nghiệp để chứng minh việc kiểm thử tự động của hệ thống.
