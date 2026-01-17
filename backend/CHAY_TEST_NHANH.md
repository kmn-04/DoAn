# 🚀 Hướng Dẫn Chạy Test Nhanh

## ⚠️ QUAN TRỌNG: KHÔNG CẦN SHUTDOWN BACKEND!

Test chạy độc lập với backend đang chạy.

## 📝 Lệnh Chạy Test (PowerShell)

### Chạy Tất Cả Test

```powershell
cd d:\DoAn\backend
.\mvnw.cmd test
```

### Chạy Test Theo Class

```powershell
# Test Authentication
.\mvnw.cmd test -Dtest=AuthControllerTest

# Test Tour
.\mvnw.cmd test -Dtest=TourControllerTest

# Test Booking
.\mvnw.cmd test -Dtest=BookingControllerTest

# Test Review
.\mvnw.cmd test -Dtest=ReviewControllerTest

# Test Category
.\mvnw.cmd test -Dtest=CategoryControllerTest
```

## 🔧 Nếu Gặp Lỗi "mvn is not recognized"

**Giải pháp**: Sử dụng Maven Wrapper (`mvnw.cmd`) thay vì `mvn`

```powershell
# ❌ SAI
mvn test

# ✅ ĐÚNG
.\mvnw.cmd test
```

## 📊 Xem Kết Quả

Sau khi chạy, bạn sẽ thấy:

```
[INFO] Tests run: 60, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

## 💡 Tips

- **Không cần** cài Maven nếu dùng `mvnw.cmd`
- Test chạy **song song** với backend
- Xem chi tiết tại: `HUONG_DAN_CHAY_TEST.md`
