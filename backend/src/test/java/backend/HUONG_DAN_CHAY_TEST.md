# Hướng Dẫn Chạy Test Cases

## 📋 Tổng Quan

Các test cases được viết bằng JUnit 5 và Spring Boot Test. **KHÔNG CẦN** shutdown backend đang chạy vì:
- Test sử dụng **in-memory database** (H2) hoặc **TestContainers** cho integration tests
- Test chạy trên **port khác** hoặc **mock** toàn bộ dependencies
- Test **độc lập** với backend đang chạy

## 🚀 Cách Chạy Test

### 1. Chạy Tất Cả Test Cases

Mở **terminal mới** (không cần shutdown backend) và chạy:

**Cách 1: Sử dụng Maven Wrapper (KHUYẾN NGHỊ - Không cần cài Maven)**

```powershell
cd d:\DoAn\backend
.\mvnw.cmd test
```

**Cách 2: Nếu đã cài Maven và thêm vào PATH**

```powershell
cd d:\DoAn\backend
mvn test
```

> **Lưu ý**: Nếu gặp lỗi "mvn is not recognized", hãy dùng `.\mvnw.cmd` thay vì `mvn`

### 2. Chạy Test Theo Class Cụ Thể

**Sử dụng Maven Wrapper (PowerShell):**

```powershell
# Test Authentication
.\mvnw.cmd test -Dtest=AuthControllerTest

# Test Tour Management
.\mvnw.cmd test -Dtest=TourControllerTest

# Test Booking Management
.\mvnw.cmd test -Dtest=BookingControllerTest

# Test Review Management
.\mvnw.cmd test -Dtest=ReviewControllerTest

# Test Category Management
.\mvnw.cmd test -Dtest=CategoryControllerTest

# Test Service Integration
.\mvnw.cmd test -Dtest=TourServiceIntegrationTest
```

**Hoặc nếu đã cài Maven:**

```powershell
mvn test -Dtest=AuthControllerTest
```

### 3. Chạy Test Theo Method Cụ Thể

```powershell
# Chạy một test method cụ thể
.\mvnw.cmd test -Dtest=AuthControllerTest#testRegister_Success

# Chạy nhiều test methods
.\mvnw.cmd test -Dtest=AuthControllerTest#testRegister_Success+testLogin_Success
```

### 4. Chạy Test Với Coverage Report

```powershell
# Chạy test với coverage
.\mvnw.cmd clean test jacoco:report

# Xem report tại: target/site/jacoco/index.html
```

### 5. Chạy Test Và Bỏ Qua Failures

```bash
# Chạy tất cả test, không dừng khi có lỗi
mvn test -Dmaven.test.failure.ignore=true
```

## 📝 Cấu Hình Test Profile

### Tạo File `application-test.yml`

Tạo file `src/main/resources/application-test.yml`:

```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: 
  
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: false
    properties:
      hibernate:
        format_sql: false
  
  h2:
    console:
      enabled: true

# Tắt các service không cần thiết trong test
app:
  chatbot:
    url: http://localhost:5000
```

### Hoặc Sử Dụng TestContainers (Đã có trong pom.xml)

TestContainers sẽ tự động tạo MySQL container cho integration tests.

## 🔧 Các Lệnh Hữu Ích

### Xem Log Chi Tiết

```bash
# Chạy với log level DEBUG
mvn test -Dtest=AuthControllerTest -X

# Chạy với log đầy đủ
mvn test -Dtest=AuthControllerTest -Dorg.slf4j.simpleLogger.defaultLogLevel=debug
```

### Chạy Test Nhanh (Skip Tests)

```bash
# Skip tests khi build
mvn clean install -DskipTests

# Skip tests và compilation
mvn clean install -Dmaven.test.skip=true
```

### Chạy Test Song Song

```bash
# Chạy test song song (nếu có nhiều CPU cores)
mvn test -T 4
```

## 📊 Kết Quả Test

### Xem Kết Quả Trong Terminal

Sau khi chạy `mvn test`, bạn sẽ thấy:

```
[INFO] Tests run: 60, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### Xem Report Chi Tiết

Report được tạo tại: `target/surefire-reports/`

- `TEST-*.xml`: Kết quả chi tiết từng test
- `*.txt`: Log của từng test class

## ⚠️ Lưu Ý Quan Trọng

### 1. **KHÔNG CẦN SHUTDOWN BACKEND**

- Test chạy **độc lập** với backend đang chạy
- Test sử dụng **mock objects** và **in-memory database**
- Có thể chạy test **song song** với backend

### 2. **Port Conflicts**

Nếu gặp lỗi port đã được sử dụng:
- Test sử dụng port khác (random port)
- Hoặc có thể cấu hình trong `application-test.yml`:
  ```yaml
  server:
    port: 0  # Random port
  ```

### 3. **Database**

- **Controller Tests**: Sử dụng **@WebMvcTest** - không cần database
- **Integration Tests**: Sử dụng **H2 in-memory** hoặc **TestContainers**
- **KHÔNG** kết nối đến database thật

### 4. **Dependencies**

Đảm bảo đã cài đặt:
- Java 21
- Maven 3.6+
- MySQL (chỉ cần cho backend, không cần cho test)

## 🐛 Troubleshooting

### Lỗi: "Port already in use"

**Giải pháp**: Test tự động sử dụng random port, không cần fix.

### Lỗi: "ClassNotFoundException"

**Giải pháp**: 
```bash
mvn clean compile test-compile
mvn test
```

### Lỗi: "No tests found"

**Giải pháp**: 
```bash
# Đảm bảo test files có đuôi *Test.java hoặc *Tests.java
# Kiểm tra package structure đúng
mvn clean test
```

### Lỗi: "MockBean deprecated"

**Giải pháp**: Đây chỉ là warning, không ảnh hưởng. Có thể bỏ qua hoặc update Spring Boot version.

## 📈 Best Practices

### 1. Chạy Test Trước Khi Commit

```bash
# Chạy test trước khi commit code
mvn clean test
```

### 2. Chạy Test Trong CI/CD

Thêm vào `.github/workflows/test.yml` hoặc CI config:

```yaml
- name: Run Tests
  run: mvn test
```

### 3. Test Coverage

Mục tiêu: **> 70% coverage** cho các chức năng chính

```bash
mvn test jacoco:report
# Xem tại: target/site/jacoco/index.html
```

## 🎯 Ví Dụ Thực Tế

### Scenario 1: Chạy Test Khi Backend Đang Chạy

```bash
# Terminal 1: Backend đang chạy
cd d:\DoAn\backend
mvn spring-boot:run

# Terminal 2: Chạy test (KHÔNG cần shutdown Terminal 1)
cd d:\DoAn\backend
mvn test -Dtest=AuthControllerTest
```

### Scenario 2: Chạy Test Trước Khi Deploy

```bash
# Chạy tất cả test
mvn clean test

# Nếu pass, tiếp tục build
mvn clean package
```

### Scenario 3: Debug Test

```bash
# Chạy test với debug mode
mvn test -Dtest=AuthControllerTest -Dmaven.surefire.debug
# Sau đó attach debugger tại port 5005
```

## 📚 Tài Liệu Tham Khảo

- [Spring Boot Testing](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)
- [JUnit 5 User Guide](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)

## ✅ Checklist Trước Khi Chạy Test

- [ ] Đã cài đặt Java 21
- [ ] Đã cài đặt Maven 3.6+
- [ ] Đã chạy `mvn clean install` ít nhất 1 lần
- [ ] Đã kiểm tra pom.xml có đầy đủ dependencies
- [ ] Đã tạo `application-test.yml` (nếu cần)

## 🎉 Kết Luận

**TÓM TẮT**: 
- ✅ **KHÔNG CẦN** shutdown backend
- ✅ Chạy test ở **terminal mới**
- ✅ Test **độc lập** với backend đang chạy
- ✅ Sử dụng **mock** và **in-memory database**

Chúc bạn test thành công! 🚀
