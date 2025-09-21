## 🗄️ GIAI ĐOẠN 2: CƠ SỞ DỮ LIỆU

### ✅ Checklist cần hoàn thành:
- [ ] Thiết kế ERD (Entity Relationship Diagram)
- [ ] Tạo database schema
- [ ] Viết script tạo bảng
- [ ] Viết script insert dữ liệu mẫu
- [ ] Tối ưu hóa database (indexes, constraints)
- [ ] Backup và restore procedures

### 📁 Files cần tạo:
```
database/
├── ERD.png                 # Biểu đồ ERD
├── schema.sql             # Script tạo bảng
├── data.sql               # Dữ liệu mẫu
├── indexes.sql            # Indexes và constraints
└── procedures.sql         # Stored procedures (nếu có)
```

### 🔧 Công cụ gợi ý:
- **Thiết kế ERD**: draw.io, Lucidchart, MySQL Workbench
- **Database**: MySQL, PostgreSQL, SQL Server
- **GUI Tools**: phpMyAdmin, pgAdmin, DBeaver

---

## ⚙️ GIAI ĐOẠN 3: BACKEND DEVELOPMENT

### 📋 BƯỚC 1: SETUP PROJECT STRUCTURE (Ngày 1)

#### ✅ Tạo cấu trúc thư mục:
```
backend/src/main/java/backend/
├── config/                 # Configuration classes
│   ├── DatabaseConfig.java
│   ├── SecurityConfig.java
│   ├── SwaggerConfig.java
│   └── CorsConfig.java
├── controller/            # REST Controllers
│   ├── AuthController.java
│   ├── UserController.java
│   ├── TourController.java
│   ├── BookingController.java
│   ├── CategoryController.java
│   └── ReviewController.java
├── dto/                   # Data Transfer Objects
│   ├── request/           # Request DTOs
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── TourCreateRequest.java
│   │   └── BookingCreateRequest.java
│   └── response/          # Response DTOs
│       ├── UserResponse.java
│       ├── TourResponse.java
│       ├── BookingResponse.java
│       └── ApiResponse.java
├── entity/               # JPA Entities (dựa trên CSDL.md)
│   ├── Role.java
│   ├── User.java
│   ├── Category.java
│   ├── Tour.java
│   ├── TourItinerary.java
│   ├── Booking.java
│   ├── Payment.java
│   ├── Review.java
│   ├── Promotion.java
│   ├── Partner.java
│   ├── TourImage.java
│   ├── TargetAudience.java
│   ├── ContactRequest.java
│   ├── Notification.java
│   └── Log.java
├── repository/           # Data Access Layer
│   ├── RoleRepository.java
│   ├── UserRepository.java
│   ├── TourRepository.java
│   ├── BookingRepository.java
│   ├── CategoryRepository.java
│   └── ReviewRepository.java
├── service/              # Business Logic Layer
│   ├── impl/             # Service implementations
│   ├── AuthService.java
│   ├── UserService.java
│   ├── TourService.java
│   ├── BookingService.java
│   └── EmailService.java
├── security/             # Security configuration
│   ├── JwtAuthenticationFilter.java
│   ├── JwtUtils.java
│   ├── UserDetailsImpl.java
│   └── UserDetailsServiceImpl.java
├── exception/            # Exception handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   ├── BadRequestException.java
│   └── UnauthorizedException.java
└── util/                 # Utility classes
    ├── StringUtils.java
    ├── DateUtils.java
    └── ValidationUtils.java

src/main/resources/
├── application.yml       # App configuration
├── application-dev.yml   # Development config
├── application-prod.yml  # Production config
├── schema.sql           # Database schema (từ CSDL.md)
└── data.sql             # Initial data
```

### 📋 BƯỚC 2: CẤU HÌNH DATABASE CONNECTION (Ngày 1-2)

#### ✅ Cập nhật `pom.xml` - thêm dependencies:
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt</artifactId>
        <version>0.9.1</version>
    </dependency>
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-ui</artifactId>
        <version>1.7.0</version>
    </dependency>
</dependencies>
```

#### ✅ Cấu hình `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/tour_booking_db
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true

jwt:
  secret: tourBookingSecretKey
  expiration: 86400000 # 24 hours

logging:
  level:
    backend: DEBUG
    org.springframework.security: DEBUG
```

### 📋 BƯỚC 3: TẠO ENTITY CLASSES (Ngày 2-3)

#### ✅ Thứ tự tạo Entity (dựa trên CSDL.md):

**1. Tạo Role.java trước (không có dependency):**
```java
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String name;
    
    // Constructors, getters, setters
}
```

**2. Tạo User.java (phụ thuộc Role):**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 150)
    private String name;
    
    @Column(unique = true, nullable = false, length = 150)
    private String email;
    
    // ... các field khác theo CSDL.md
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;
}
```

**3. Tiếp tục với Category, Partner, TargetAudience (độc lập):**

**4. Tạo Tour.java (phụ thuộc Category):**

**5. Tạo các entity phụ thuộc Tour: TourItinerary, TourImage, TourTargetAudience**

**6. Tạo Booking (phụ thuộc User, Tour)**

**7. Cuối cùng: Payment, Review, Promotion, ContactRequest, Notification, Log**

### 📋 BƯỚC 4: TẠO REPOSITORY LAYER (Ngày 4)

#### ✅ Tạo Repository interfaces:
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByRoleId(Long roleId);
}

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {
    List<Tour> findByCategoryId(Long categoryId);
    List<Tour> findByStatusAndIsFeatured(String status, Boolean isFeatured);
    Page<Tour> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
```

### 📋 BƯỚC 5: TẠO DTO CLASSES (Ngày 5)

#### ✅ Tạo Request/Response DTOs:
```java
// Request DTOs
public class TourCreateRequest {
    @NotBlank
    private String name;
    
    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal price;
    
    // ... validation annotations
}

// Response DTOs
public class TourResponse {
    private Long id;
    private String name;
    private String slug;
    private BigDecimal price;
    private CategoryResponse category;
    private List<TourImageResponse> images;
    // ...
}
```

### 📋 BƯỚC 6: TẠO SERVICE LAYER (Ngày 6-8)

#### ✅ Thứ tự tạo Service:
1. **AuthService** (authentication, registration)
2. **UserService** (user management)
3. **CategoryService** (category CRUD)
4. **TourService** (tour CRUD, search, filter)
5. **BookingService** (booking process)
6. **PaymentService** (payment processing)
7. **ReviewService** (review management)

### 📋 BƯỚC 7: TẠO CONTROLLER LAYER (Ngày 9-10)

#### ✅ Tạo REST Controllers:
```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Implementation
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        // Implementation
    }
}
```

### 📋 BƯỚC 8: IMPLEMENT SECURITY (Ngày 11-12)

#### ✅ Cấu hình Spring Security:
1. JWT Authentication Filter
2. Security Configuration
3. User Details Service
4. Password Encoder

### 📋 BƯỚC 9: API DOCUMENTATION (Ngày 13)

#### ✅ Swagger Configuration:
```java
@Configuration
@EnableOpenApi
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Tour Booking API")
                        .version("1.0")
                        .description("API documentation for Tour Booking System"));
    }
}
```

### 📋 BƯỚC 10: TESTING (Ngày 14-15)

#### ✅ Tạo Test Classes:
- Unit tests cho Service layer
- Integration tests cho Repository
- API tests cho Controller

### 🛠️ Công nghệ sử dụng:
- **Framework**: Spring Boot, Spring Security, Spring Data JPA
- **Database**: MySQL + JPA/Hibernate
- **API Documentation**: Swagger/OpenAPI
- **Testing**: JUnit, Mockito, TestContainers
- **Build Tool**: Maven

### 📝 Timeline Chi Tiết (15 ngày):
- **Ngày 1**: Setup project structure + Database config
- **Ngày 2-3**: Tạo Entity classes
- **Ngày 4**: Repository layer
- **Ngày 5**: DTO classes
- **Ngày 6-8**: Service layer
- **Ngày 9-10**: Controller layer
- **Ngày 11-12**: Security implementation
- **Ngày 13**: API documentation
- **Ngày 14-15**: Testing

---

## 🎨 GIAI ĐOẠN 4: FRONTEND DEVELOPMENT

### ✅ Checklist cần hoàn thành:
- [ ] Setup project structure
- [ ] Thiết kế component architecture
- [ ] Implement routing
- [ ] Tạo reusable components
- [ ] Implement state management
- [ ] API integration
- [ ] Form validation
- [ ] Responsive design
- [ ] Unit testing
- [ ] E2E testing

### 📁 Cấu trúc Frontend (React/Vue):
```
src/
├── components/           # Reusable components
├── pages/               # Page components
├── services/            # API services
├── store/               # State management
├── hooks/               # Custom hooks
├── utils/               # Utility functions
├── styles/              # CSS/SCSS files
├── assets/              # Images, fonts, etc.
└── types/               # TypeScript types
```

### 🛠️ Công nghệ gợi ý:
- **Framework**: React, Vue.js, Angular
- **Styling**: Tailwind CSS, Material-UI, Bootstrap
- **State Management**: Redux, Zustand, Pinia
- **HTTP Client**: Axios, Fetch API
- **Testing**: Jest, React Testing Library, Cypress
- **Build Tool**: Vite, Create React App

### 📝 Thứ tự phát triển Frontend:
1. **Setup & Routing**: Project setup → Router configuration
2. **UI Components**: Layout → Reusable components
3. **Pages**: Static pages → Dynamic pages
4. **API Integration**: Services → API calls
5. **State Management**: Global state → Local state
6. **Testing**: Component tests → E2E tests

---

## 🔗 GIAI ĐOẠN 5: TÍCH HỢP VÀ KIỂM THỬ

### ✅ Checklist cần hoàn thành:
- [ ] CORS configuration
- [ ] API testing với Postman/Insomnia
- [ ] Frontend-Backend integration
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security testing
- [ ] User acceptance testing
- [ ] Bug fixing và optimization

### 🧪 Loại kiểm thử:
- **Unit Testing**: Test từng function/component riêng lẻ
- **Integration Testing**: Test tương tác giữa các module
- **API Testing**: Test API endpoints
- **E2E Testing**: Test toàn bộ user flow
- **Performance Testing**: Test hiệu suất ứng dụng
- **Security Testing**: Test bảo mật

---

## 🚀 GIAI ĐOẠN 6: DEPLOYMENT

### ✅ Checklist cần hoàn thành:
- [ ] Setup CI/CD pipeline
- [ ] Configure production environment
- [ ] Database migration
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Setup monitoring
- [ ] Setup logging
- [ ] Performance monitoring

### 🌐 Deployment Options:
- **Backend**: Heroku, AWS EC2, DigitalOcean, Railway
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Database**: AWS RDS, MongoDB Atlas, PlanetScale
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins

---

## 📚 TÀI LIỆU THAM KHẢO

### Backend (Spring Boot):
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/)
- [Spring Data JPA Reference](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)

### Frontend:
- [React Documentation](https://react.dev/)
- [Vue.js Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

### Database:
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🎯 TIPS QUAN TRỌNG

### ✨ Best Practices:
1. **Version Control**: Sử dụng Git từ đầu, commit thường xuyên
2. **Code Quality**: Tuân thủ coding standards, code review
3. **Documentation**: Viết tài liệu rõ ràng cho API và code
4. **Testing**: Viết test ngay từ đầu, không để cuối dự án
5. **Security**: Luôn nghĩ về bảo mật từ thiết kế đến implementation

### ⚠️ Những lỗi thường gặp:
- Bỏ qua giai đoạn thiết kế và đi thẳng vào code
- Không có kế hoạch rõ ràng cho database schema
- Thiếu error handling và validation
- Bỏ qua testing và security
- Không có backup plan

### 📅 Timeline gợi ý (dự án 12 tuần):
- **Tuần 1-2**: Phân tích và thiết kế
- **Tuần 3-4**: Thiết kế và tạo CSDL
- **Tuần 5-8**: Phát triển Backend
- **Tuần 9-11**: Phát triển Frontend
- **Tuần 12**: Tích hợp, testing và deployment

---

## 🎉 HOÀN THÀNH DỰ ÁN

Khi đã hoàn thành tất cả các giai đoạn trên, bạn sẽ có:
- ✅ Một ứng dụng web hoàn chỉnh
- ✅ Tài liệu đầy đủ
- ✅ Code quality cao
- ✅ Testing coverage tốt
- ✅ Ready for production

**Chúc bạn thành công với dự án! 🚀**
