# Query Optimization - Giải quyết N+1 Query Problem

## 📊 Tổng quan

Đã triển khai **Query Optimization** để giảm số lượng query xuống database bằng cách sử dụng **fetch joins** thay vì **force initialization**.

### Trước khi tối ưu (N+1 Problem):
```java
// ❌ CÁCH CŨ: Force initialization - tạo ra nhiều queries
List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
bookings.forEach(booking -> {
    booking.getTour().getName();           // Query 1 cho mỗi booking
    booking.getUser().getName();           // Query 2 cho mỗi booking  
    booking.getSchedule().getDepartureDate(); // Query 3 cho mỗi booking
});
// Tổng: 1 query chính + N*3 queries phụ = 1 + 300 = 301 queries (với N=100)
```

### Sau khi tối ưu (Fetch Joins):
```java
// ✅ CÁCH MỚI: Fetch joins - chỉ 1 query duy nhất
List<Booking> bookings = bookingRepository.findByUserIdWithDetails(userId);
// Tổng: CHỈ 1 query để load tất cả (booking + tour + user + schedule + promotion)
```

---

## 🎯 Các thay đổi đã triển khai

### 1. BookingRepository
**Queries mới được thêm:**
- `findByIdWithAllDetails` - Load booking với tour, user, schedule, promotion
- `findByUserIdWithDetails` - Load bookings của user với pagination
- `findByBookingCodeWithDetails` - Load booking theo code với đầy đủ thông tin

```java
@Query("SELECT DISTINCT b FROM Booking b " +
       "LEFT JOIN FETCH b.tour t " +
       "LEFT JOIN FETCH b.user u " +
       "LEFT JOIN FETCH b.schedule s " +
       "LEFT JOIN FETCH b.promotion p " +
       "WHERE b.id = :bookingId")
Optional<Booking> findByIdWithAllDetails(@Param("bookingId") Long bookingId);
```

### 2. PaymentRepository
**Queries mới được thêm:**
- `findByIdWithBookingDetails` - Load payment với booking và tất cả related entities

```java
@Query("SELECT DISTINCT p FROM Payment p " +
       "LEFT JOIN FETCH p.booking b " +
       "LEFT JOIN FETCH b.tour t " +
       "LEFT JOIN FETCH b.user u " +
       "LEFT JOIN FETCH b.schedule s " +
       "LEFT JOIN FETCH b.promotion pr " +
       "WHERE p.id = :paymentId")
Optional<Payment> findByIdWithBookingDetails(@Param("paymentId") Long paymentId);
```

### 3. TourRepository
**Queries mới được thêm:**
- `findBySlugWithDetails` - Load tour với category và images
- `findBySlugWithImagesAndCategory` - Step 1 cho tour details
- `findByIdWithItinerariesAndPartners` - Step 2 load itineraries và partners

**Lưu ý:** Hibernate không hỗ trợ fetch nhiều collections cùng lúc, nên phải load theo 2 bước.

```java
// Step 1: Load tour với category và images
@Query("SELECT DISTINCT t FROM Tour t " +
       "LEFT JOIN FETCH t.category c " +
       "LEFT JOIN FETCH t.images " +
       "WHERE t.slug = :slug AND t.deletedAt IS NULL")
Optional<Tour> findBySlugWithImagesAndCategory(@Param("slug") String slug);

// Step 2: Load itineraries và partners
@Query("SELECT DISTINCT t FROM Tour t " +
       "LEFT JOIN FETCH t.itineraries i " +
       "LEFT JOIN FETCH i.accommodationPartner " +
       "LEFT JOIN FETCH i.mealsPartner " +
       "LEFT JOIN FETCH i.transportPartner " +
       "WHERE t.id = :tourId")
Optional<Tour> findByIdWithItinerariesAndPartners(@Param("tourId") Long tourId);
```

### 4. PartnerRepository
**Queries mới được thêm:**
- `findBySlugWithImages` - Load partner với images
- `findByIdWithTourItineraries` - Load partner với tour itineraries và tours

---

## 🧪 Cách test và verify

### Bước 1: Enable SQL logging
Thêm vào `application.yml`:

```yaml
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

Hoặc trong `application.properties`:
```properties
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

### Bước 2: Enable Hibernate Statistics
Thêm vào `application.yml`:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        generate_statistics: true
        format_sql: true
```

### Bước 3: Test các endpoints và đếm queries

#### Test 1: Booking Dashboard (User Dashboard)
```bash
# API: GET /api/bookings/user/{userId}
curl -X GET "http://localhost:8080/api/bookings/user/1" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

**Kiểm tra log:**
- ✅ Cách mới: Chỉ **1-2 queries** (1 query cho bookings với details)
- ❌ Cách cũ: **100+ queries** (1 + N*3 với N là số bookings)

#### Test 2: VNPay Return Page
```bash
# API: GET /api/bookings/payment/{paymentId}
curl -X GET "http://localhost:8080/api/bookings/payment/49"
```

**Kiểm tra log:**
- ✅ Cách mới: Chỉ **1 query** (load payment → booking → tour → user → schedule)
- ❌ Cách cũ: **5+ queries** (1 payment + 1 booking + 1 tour + 1 user + 1 schedule)

#### Test 3: Tour Detail Page
```bash
# API: GET /api/tours/{slug}
curl -X GET "http://localhost:8080/api/tours/ha-noi-ha-long-sapa-5n4d"
```

**Kiểm tra log:**
- ✅ Cách mới: Chỉ **2 queries** (1 cho tour+images+category, 1 cho itineraries+partners)
- ❌ Cách cũ: **10-50 queries** (tùy số lượng itineraries và partners)

#### Test 4: Partner Detail Page
```bash
# API: GET /api/partners/{slug}
curl -X GET "http://localhost:8080/api/partners/vinpearl-resort-phu-quoc"
```

**Kiểm tra log:**
- ✅ Cách mới: Chỉ **2 queries** (1 cho partner+images, 1 cho itineraries+tours)
- ❌ Cách cũ: **20-100 queries** (tùy số lượng tour itineraries)

---

## 📈 Kết quả dự kiến

### Giảm số lượng queries:
| Endpoint | Trước | Sau | Cải thiện |
|----------|-------|-----|-----------|
| User Dashboard (100 bookings) | ~301 queries | 1 query | **99.7%** ⬇️ |
| VNPay Return | 5 queries | 1 query | **80%** ⬇️ |
| Tour Detail (10 itineraries) | ~50 queries | 2 queries | **96%** ⬇️ |
| Partner Detail (20 tours) | ~100 queries | 2 queries | **98%** ⬇️ |

### Cải thiện thời gian phản hồi:
- **User Dashboard**: Từ ~2-3s → ~200-300ms (**90% nhanh hơn**)
- **Tour Detail**: Từ ~1s → ~100-150ms (**85% nhanh hơn**)
- **VNPay Return**: Từ ~500ms → ~80-100ms (**80% nhanh hơn**)

### Giảm database load:
- **Read operations**: Giảm 80-95%
- **Connection pool usage**: Giảm 70-80%
- **Network latency**: Giảm 85-90%

---

## 🔍 Debugging với Hibernate Statistics

Thêm code để log statistics sau mỗi transaction:

```java
import org.hibernate.stat.Statistics;
import jakarta.persistence.EntityManagerFactory;

@Service
public class DebugService {
    
    @Autowired
    private EntityManagerFactory entityManagerFactory;
    
    public void logStatistics() {
        Statistics stats = entityManagerFactory.unwrap(SessionFactory.class).getStatistics();
        
        log.info("=== Hibernate Statistics ===");
        log.info("Queries executed: {}", stats.getQueryExecutionCount());
        log.info("Entities loaded: {}", stats.getEntityLoadCount());
        log.info("Entities fetched: {}", stats.getEntityFetchCount());
        log.info("Collections loaded: {}", stats.getCollectionLoadCount());
        log.info("Collections fetched: {}", stats.getCollectionFetchCount());
        log.info("===========================");
    }
}
```

---

## ⚠️ Lưu ý quan trọng

### 1. Hibernate Multiple Bag Fetch Exception
Hibernate **KHÔNG** cho phép fetch nhiều collections cùng lúc:

```java
// ❌ LỖI: Cannot simultaneously fetch multiple bags
@Query("SELECT t FROM Tour t " +
       "LEFT JOIN FETCH t.images " +
       "LEFT JOIN FETCH t.itineraries " +  // LỖI!
       "WHERE t.id = :id")
```

**Giải pháp**: Chia thành 2 queries:
```java
// ✅ ĐÚNG: Fetch từng collection riêng biệt
// Query 1: Load images
Optional<Tour> tour = repository.findByIdWithImages(id);
// Query 2: Load itineraries
repository.findByIdWithItineraries(id).ifPresent(t -> {
    tour.get().setItineraries(t.getItineraries());
});
```

### 2. DISTINCT keyword
Luôn dùng `DISTINCT` khi fetch collections để tránh duplicate rows:

```java
// ✅ ĐÚNG
@Query("SELECT DISTINCT b FROM Booking b LEFT JOIN FETCH b.tour ...")

// ❌ SAI: Có thể tạo ra duplicate bookings
@Query("SELECT b FROM Booking b LEFT JOIN FETCH b.tour ...")
```

### 3. Pagination với Fetch Joins
Cần dùng cả `value` và `countQuery`:

```java
@Query(value = "SELECT DISTINCT b FROM Booking b LEFT JOIN FETCH b.tour ...",
       countQuery = "SELECT COUNT(DISTINCT b) FROM Booking b WHERE ...")
Page<Booking> findByUserIdWithDetails(@Param("userId") Long userId, Pageable pageable);
```

---

## ✅ Checklist hoàn thành

- [x] Tạo fetch join queries trong BookingRepository
- [x] Tạo fetch join queries trong TourRepository  
- [x] Tạo fetch join queries trong PartnerRepository
- [x] Tạo fetch join queries trong PaymentRepository
- [x] Update BookingServiceImpl sử dụng fetch joins
- [x] Update TourServiceImpl sử dụng fetch joins
- [x] Update BookingController sử dụng fetch joins
- [x] Update PartnerController sử dụng fetch joins
- [x] Xóa force initialization code
- [ ] Enable SQL logging và test
- [ ] Verify số lượng queries đã giảm
- [ ] Benchmark thời gian phản hồi

---

## 📝 Các bước tiếp theo (optional)

1. **Thêm caching** cho tour listings và categories
2. **Database indexing** cho các query phổ biến
3. **Image optimization** (compression, lazy loading)
4. **Code splitting** cho frontend bundle
5. **API response time monitoring** (Prometheus, Grafana)

---

## 🎓 Tài liệu tham khảo

- [Hibernate N+1 Problem](https://vladmihalcea.com/n-plus-1-query-problem/)
- [JPA Fetch Joins](https://www.baeldung.com/jpa-join-types)
- [Spring Data JPA Performance](https://vladmihalcea.com/spring-data-jpa-dto-projection/)

