# 🚀 HƯỚNG DẪN TỐI ƯU HÓA TOÀN BỘ DỰ ÁN TOUR BOOKING

> **Mục tiêu**: Tối ưu hóa hiệu suất, bảo mật, và trải nghiệm người dùng cho hệ thống Tour Booking

---

## 📋 MỤC LỤC

1. [Database Optimization](#1-database-optimization)
2. [Backend Optimization](#2-backend-optimization)
3. [Frontend Optimization](#3-frontend-optimization)
4. [Chatbot Optimization](#4-chatbot-optimization)
5. [Security Optimization](#5-security-optimization)
6. [DevOps & Infrastructure](#6-devops--infrastructure)
7. [Testing & Quality Assurance](#7-testing--quality-assurance)

---

## 1. DATABASE OPTIMIZATION

### 1.1. Indexing Strategy

#### **Phân tích truy vấn hiện tại**

**Bước 1**: Bật slow query log
```sql
-- Trong MySQL, thêm vào my.cnf hoặc my.ini
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2; -- Log queries > 2 seconds
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow-query.log';
```

**Bước 2**: Tìm các query chậm
```sql
-- Xem các query chậm
SHOW PROCESSLIST;

-- Phân tích EXPLAIN cho các query quan trọng
EXPLAIN SELECT * FROM tours WHERE status = 'ACTIVE';
EXPLAIN SELECT * FROM bookings WHERE user_id = 1;
```

**Bước 3**: Tạo indexes cho các trường thường xuyên query

```sql
-- Tours table
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_category_id ON tours(category_id);
CREATE INDEX idx_tours_destination_id ON tours(destination_id);
CREATE INDEX idx_tours_featured ON tours(is_featured);
CREATE INDEX idx_tours_price ON tours(price);
CREATE INDEX idx_tours_departure_date ON tours(departure_date);

-- Composite indexes cho filter phức tạp
CREATE INDEX idx_tours_status_featured ON tours(status, is_featured);
CREATE INDEX idx_tours_status_category ON tours(status, category_id);
CREATE INDEX idx_tours_price_range ON tours(status, price);

-- Bookings table
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);

-- Composite indexes
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_tour_status ON bookings(tour_id, status);

-- Payments table
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_code ON payments(payment_code);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Reviews table
CREATE INDEX idx_reviews_tour_id ON reviews(tour_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);

-- Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);

-- Notifications table
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Newsletter subscribers
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_status ON newsletter_subscribers(status);

-- Promotions
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_valid_dates ON promotions(valid_from, valid_to);

-- User activities
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created ON user_activities(created_at);
```

**Bước 4**: Kiểm tra hiệu quả của indexes
```sql
-- Trước khi thêm index
EXPLAIN SELECT * FROM bookings WHERE user_id = 1;
-- Ghi lại "rows" examined

-- Sau khi thêm index
EXPLAIN SELECT * FROM bookings WHERE user_id = 1;
-- So sánh "rows" examined (nên giảm đáng kể)

-- Kiểm tra index usage
SHOW INDEX FROM bookings;
SELECT * FROM information_schema.STATISTICS 
WHERE table_schema = 'doan' AND table_name = 'bookings';
```

---

### 1.2. Query Optimization (N+1 Problem)

**✅ ĐÃ THỰC HIỆN** (xem `QUERY_OPTIMIZATION_GUIDE.md`)

**Kiểm tra lại các repository còn lại:**

**BookingCancellationRepository**
```java
// Thêm vào BookingCancellationRepository.java
@Query("SELECT bc FROM BookingCancellation bc " +
       "LEFT JOIN FETCH bc.booking b " +
       "LEFT JOIN FETCH b.tour t " +
       "LEFT JOIN FETCH b.user u " +
       "LEFT JOIN FETCH bc.cancellationPolicy cp " +
       "WHERE bc.id = :cancellationId")
Optional<BookingCancellation> findByIdWithDetails(@Param("cancellationId") Long cancellationId);

@Query("SELECT bc FROM BookingCancellation bc " +
       "LEFT JOIN FETCH bc.booking b " +
       "LEFT JOIN FETCH b.tour t " +
       "LEFT JOIN FETCH bc.cancellationPolicy cp " +
       "WHERE b.user.id = :userId")
List<BookingCancellation> findByUserIdWithDetails(@Param("userId") Long userId);
```

**ReviewRepository**
```java
// Thêm vào ReviewRepository.java
@Query("SELECT r FROM Review r " +
       "LEFT JOIN FETCH r.tour t " +
       "LEFT JOIN FETCH r.user u " +
       "WHERE r.tour.id = :tourId")
List<Review> findByTourIdWithUserDetails(@Param("tourId") Long tourId);

@Query("SELECT r FROM Review r " +
       "LEFT JOIN FETCH r.tour t " +
       "LEFT JOIN FETCH r.user u " +
       "WHERE r.user.id = :userId")
List<Review> findByUserIdWithTourDetails(@Param("userId") Long userId);
```

**NotificationRepository**
```java
// Thêm vào NotificationRepository.java
@Query("SELECT n FROM Notification n " +
       "LEFT JOIN FETCH n.user u " +
       "WHERE n.user.id = :userId " +
       "ORDER BY n.createdAt DESC")
List<Notification> findByUserIdWithDetails(@Param("userId") Long userId, Pageable pageable);
```

**WishlistRepository**
```java
// Thêm vào WishlistRepository.java
@Query("SELECT w FROM Wishlist w " +
       "LEFT JOIN FETCH w.tour t " +
       "LEFT JOIN FETCH t.category c " +
       "LEFT JOIN FETCH t.images " +
       "WHERE w.user.id = :userId")
List<Wishlist> findByUserIdWithTourDetails(@Param("userId") Long userId);
```

**CategoryRepository**
```java
// Thêm vào CategoryRepository.java
@Query("SELECT c FROM Category c " +
       "LEFT JOIN FETCH c.tours t " +
       "WHERE c.id = :categoryId")
Optional<Category> findByIdWithTours(@Param("categoryId") Long categoryId);
```

**Cập nhật Service methods để dùng queries mới:**

Xem chi tiết trong `QUERY_OPTIMIZATION_GUIDE.md` và áp dụng pattern tương tự cho các services còn lại.

---

### 1.3. Database Connection Pool Tuning

**Cấu hình HikariCP trong `application.yml`:**

```yaml
spring:
  datasource:
    hikari:
      # Connection pool settings
      maximum-pool-size: 20          # Số connection tối đa (tùy server)
      minimum-idle: 5                # Số connection idle tối thiểu
      connection-timeout: 30000      # 30 seconds
      idle-timeout: 600000           # 10 minutes
      max-lifetime: 1800000          # 30 minutes
      
      # Performance tuning
      auto-commit: false             # Tắt auto-commit cho performance
      pool-name: TourBookingHikariCP
      
      # Leak detection (development only)
      leak-detection-threshold: 60000 # 60 seconds
      
      # Connection test
      connection-test-query: SELECT 1
```

**Giải thích:**
- `maximum-pool-size`: 20 cho server có ~4GB RAM, ~8 CPU cores
- `minimum-idle`: 5 để đảm bảo luôn có connection sẵn sàng
- `connection-timeout`: 30s để tránh đợi quá lâu
- `idle-timeout`: 10 phút trước khi đóng connection không dùng
- `max-lifetime`: 30 phút để tránh connection cũ

---

### 1.4. Partitioning & Archiving (Cho production lớn)

**Partition cho bảng lớn (khi có hàng triệu records):**

```sql
-- Partition bookings table theo năm
ALTER TABLE bookings 
PARTITION BY RANGE (YEAR(booking_date)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Partition user_activities theo tháng (nếu log quá nhiều)
ALTER TABLE user_activities
PARTITION BY RANGE (YEAR(created_at) * 100 + MONTH(created_at)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    -- ... add more partitions monthly
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

**Archive old data:**

```sql
-- Tạo bảng archive cho bookings cũ
CREATE TABLE bookings_archive LIKE bookings;

-- Di chuyển bookings > 2 năm sang archive
INSERT INTO bookings_archive 
SELECT * FROM bookings 
WHERE booking_date < DATE_SUB(NOW(), INTERVAL 2 YEAR);

-- Xóa data đã archive
DELETE FROM bookings 
WHERE booking_date < DATE_SUB(NOW(), INTERVAL 2 YEAR);
```

---

## 2. BACKEND OPTIMIZATION

### 2.1. Caching Strategy

#### **2.1.1. Bật Spring Cache**

**Bước 1**: Thêm dependency vào `pom.xml`
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

**Bước 2**: Tạo `CacheConfig.java`
```java
package backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
            "tours",           // Cache danh sách tours
            "tourDetails",     // Cache chi tiết tour
            "categories",      // Cache categories
            "destinations",    // Cache destinations
            "partners",        // Cache partners
            "promotions",      // Cache promotions
            "reviews",         // Cache reviews
            "weatherData"      // Cache weather data
        );
        
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)              // Tối đa 1000 entries
            .expireAfterWrite(10, TimeUnit.MINUTES)  // Expire sau 10 phút
            .recordStats());                // Ghi stats để monitor
        
        return cacheManager;
    }
}
```

**Bước 3**: Áp dụng cache trong Services

**TourServiceImpl.java:**
```java
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;

@Service
public class TourServiceImpl implements TourService {
    
    // Cache chi tiết tour
    @Cacheable(value = "tourDetails", key = "#slug")
    @Override
    @Transactional(readOnly = true)
    public TourResponse getTourBySlugWithDetails(String slug) {
        // ... existing code
    }
    
    // Cache danh sách tours (với params)
    @Cacheable(value = "tours", key = "#categoryId + '-' + #status")
    @Override
    @Transactional(readOnly = true)
    public List<TourResponse> getToursByCategory(Long categoryId, String status) {
        // ... existing code
    }
    
    // Xóa cache khi tạo tour mới
    @CacheEvict(value = {"tours", "tourDetails"}, allEntries = true)
    @Override
    @Transactional
    public TourResponse createTour(TourRequest request) {
        // ... existing code
    }
    
    // Xóa cache khi update tour
    @CacheEvict(value = {"tours", "tourDetails"}, allEntries = true)
    @Override
    @Transactional
    public TourResponse updateTour(Long tourId, TourRequest request) {
        // ... existing code
    }
    
    // Xóa cache khi delete tour
    @CacheEvict(value = {"tours", "tourDetails"}, allEntries = true)
    @Override
    @Transactional
    public void deleteTour(Long tourId) {
        // ... existing code
    }
}
```

**CategoryServiceImpl.java:**
```java
@Service
public class CategoryServiceImpl implements CategoryService {
    
    @Cacheable(value = "categories")
    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        // ... existing code
    }
    
    @CacheEvict(value = "categories", allEntries = true)
    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        // ... existing code
    }
}
```

**WeatherServiceImpl.java:**
```java
@Service
public class WeatherServiceImpl implements WeatherService {
    
    // Cache weather data 30 phút
    @Cacheable(value = "weatherData", key = "#city")
    @Override
    public WeatherResponse getWeatherByCity(String city) {
        // ... existing code
    }
}
```

---

#### **2.1.2. Redis Cache (Cho production scale lớn)**

**Nếu cần cache distributed cho multiple server instances:**

**Bước 1**: Thêm Redis dependency
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

**Bước 2**: Cấu hình Redis
```yaml
# application.yml
spring:
  redis:
    host: localhost
    port: 6379
    password: ${REDIS_PASSWORD:}
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 2
```

**Bước 3**: Cấu hình Redis Cache
```java
@Configuration
@EnableCaching
public class RedisCacheConfig {
    
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()))
            .disableCachingNullValues();
        
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build();
    }
}
```

---

### 2.2. Async Processing

**Tối ưu email sending và notification bằng @Async:**

**Bước 1**: Bật Async trong `BackendApplication.java`
```java
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
```

**Bước 2**: Cấu hình Thread Pool
```java
package backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class AsyncConfig {
    
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.initialize();
        return executor;
    }
}
```

**Bước 3**: Áp dụng @Async

**EmailServiceImpl.java:**
```java
import org.springframework.scheduling.annotation.Async;

@Service
public class EmailServiceImpl implements EmailService {
    
    @Async("taskExecutor")
    @Override
    public void sendBookingConfirmation(Long bookingId, String userEmail) {
        // ... existing code
        // Method này sẽ chạy async, không block main thread
    }
    
    @Async("taskExecutor")
    @Override
    public void sendNewTourNotification(Long tourId, String tourName, String tourSlug) {
        // ... existing code
    }
    
    @Async("taskExecutor")
    @Override
    public void sendPromotionNotification(String code, String name, 
                                          String promotionType, BigDecimal discountValue,
                                          BigDecimal minOrderAmount, BigDecimal maxDiscount) {
        // ... existing code
    }
}
```

**NotificationServiceImpl.java:**
```java
@Service
public class NotificationServiceImpl implements NotificationService {
    
    @Async("taskExecutor")
    @Override
    public void createNotificationForUser(Long userId, String title, String message, String type) {
        // ... existing code
    }
    
    @Async("taskExecutor")
    @Override
    public void createNotificationForUsers(List<Long> userIds, String title, String message, String type) {
        // ... existing code
    }
}
```

---

### 2.3. API Response Compression

**Bật GZIP compression trong `application.yml`:**

```yaml
server:
  compression:
    enabled: true
    mime-types:
      - application/json
      - application/xml
      - text/html
      - text/xml
      - text/plain
      - text/css
      - application/javascript
    min-response-size: 1024  # Chỉ compress response > 1KB
```

---

### 2.4. Pagination Optimization

**Đảm bảo tất cả list endpoints đều có pagination:**

**TourController.java:**
```java
@GetMapping("/search")
public ResponseEntity<Page<TourResponse>> searchTours(
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(defaultValue = "createdAt,desc") String sort) {
    
    Pageable pageable = PageRequest.of(page, size, Sort.by(parseSortParam(sort)));
    Page<TourResponse> tours = tourService.searchTours(keyword, categoryId, minPrice, maxPrice, pageable);
    return ResponseEntity.ok(tours);
}
```

**ReviewController.java:**
```java
@GetMapping("/tour/{tourId}")
public ResponseEntity<Page<ReviewResponse>> getReviewsByTour(
        @PathVariable Long tourId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    
    Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
    Page<ReviewResponse> reviews = reviewService.getReviewsByTour(tourId, pageable);
    return ResponseEntity.ok(reviews);
}
```

---

### 2.5. DTO Optimization

**Sử dụng Projection cho các API chỉ cần một số field:**

**TourSummaryProjection.java:**
```java
public interface TourSummaryProjection {
    Long getId();
    String getName();
    String getSlug();
    BigDecimal getPrice();
    String getThumbnailUrl();
    Double getAverageRating();
}
```

**TourRepository.java:**
```java
@Query("SELECT t.id as id, t.name as name, t.slug as slug, " +
       "t.price as price, t.thumbnailUrl as thumbnailUrl, " +
       "t.averageRating as averageRating " +
       "FROM Tour t WHERE t.status = 'ACTIVE'")
List<TourSummaryProjection> findAllActiveToursSummary();
```

---

### 2.6. Logging Optimization

**Giảm logging trong production:**

**application-prod.yml:**
```yaml
logging:
  level:
    root: WARN
    backend: INFO
    org.hibernate.SQL: WARN               # Tắt SQL logging
    org.hibernate.type: WARN              # Tắt parameter logging
    org.springframework.security: WARN
    org.springframework.web: WARN
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: logs/application.log
    max-size: 10MB
    max-history: 30  # Giữ log 30 ngày
```

---

## 3. FRONTEND OPTIMIZATION

### 3.1. Code Splitting & Lazy Loading

**Đã có trong project, nhưng cần kiểm tra lại:**

**main.tsx:**
```typescript
import React, { Suspense } from 'react';

// Lazy load tất cả pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const ToursListingPage = React.lazy(() => import('./pages/ToursListingPage'));
const TourDetailPage = React.lazy(() => import('./pages/TourDetailPage'));
const BookingCheckoutPage = React.lazy(() => import('./pages/BookingCheckoutPage'));
// ... all other pages

// Lazy load admin pages
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));
const AdminTours = React.lazy(() => import('./pages/admin/AdminTours'));
// ... all admin pages

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* ... other routes */}
      </Routes>
    </Suspense>
  );
}
```

---

### 3.2. Image Optimization

**Bước 1**: Thêm image optimization libraries

```bash
npm install react-lazy-load-image-component
npm install --save-dev imagemin imagemin-webp
```

**Bước 2**: Tạo `LazyImage` component

**components/ui/LazyImage.tsx:**
```typescript
import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className,
  width,
  height 
}) => {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      effect="blur"
      placeholderSrc={`${src}?w=50`} // Low quality placeholder
    />
  );
};
```

**Bước 3**: Thay thế `<img>` bằng `<LazyImage>`

**components/tours/TourCard.tsx:**
```typescript
import { LazyImage } from '@/components/ui/LazyImage';

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  return (
    <div className="tour-card">
      <LazyImage
        src={tour.imageUrl}
        alt={tour.name}
        className="tour-card-image"
      />
      {/* ... rest of card */}
    </div>
  );
};
```

---

### 3.3. React Query Optimization

**Tối ưu caching và stale time:**

**services/api.ts:**
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 phút
      cacheTime: 10 * 60 * 1000,     // 10 phút
      refetchOnWindowFocus: false,   // Không refetch khi focus window
      refetchOnReconnect: true,      // Refetch khi reconnect
      retry: 1,                      // Chỉ retry 1 lần
    },
  },
});
```

**Prefetch data cho UX tốt hơn:**

**pages/ToursListingPage.tsx:**
```typescript
import { useQueryClient } from '@tanstack/react-query';

export const ToursListingPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Prefetch tour details khi hover vào tour card
  const handleTourHover = (tourSlug: string) => {
    queryClient.prefetchQuery(
      ['tour', tourSlug],
      () => tourService.getTourBySlug(tourSlug)
    );
  };
  
  return (
    <div className="tours-grid">
      {tours.map(tour => (
        <div 
          key={tour.id} 
          onMouseEnter={() => handleTourHover(tour.slug)}
        >
          <TourCard tour={tour} />
        </div>
      ))}
    </div>
  );
};
```

---

### 3.4. Bundle Size Optimization

**Bước 1**: Phân tích bundle size
```bash
npm run build
npx vite-bundle-visualizer
```

**Bước 2**: Code splitting cho dependencies lớn

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Tách vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@headlessui/react', '@heroicons/react'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', 'zod'],
          'date-vendor': ['date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
```

**Bước 3**: Tree shaking - Import đúng cách
```typescript
// ❌ BAD - Import toàn bộ library
import * as _ from 'lodash';

// ✅ GOOD - Import chỉ function cần dùng
import debounce from 'lodash/debounce';

// ❌ BAD - Import toàn bộ icons
import * as Icons from '@heroicons/react/24/outline';

// ✅ GOOD - Import specific icons
import { MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';
```

---

### 3.5. Memoization

**Sử dụng React.memo, useMemo, useCallback:**

**components/tours/TourCard.tsx:**
```typescript
import React, { memo } from 'react';

export const TourCard: React.FC<TourCardProps> = memo(({ tour }) => {
  return (
    <div className="tour-card">
      {/* ... tour card content */}
    </div>
  );
});

// Chỉ re-render khi tour.id thay đổi
TourCard.displayName = 'TourCard';
```

**pages/ToursListingPage.tsx:**
```typescript
import { useMemo, useCallback } from 'react';

export const ToursListingPage: React.FC = () => {
  const [filters, setFilters] = useState({});
  
  // Memoize filtered tours
  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      // ... filter logic
    });
  }, [tours, filters]);
  
  // Memoize callback
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);
  
  return (
    <div>
      <TourFilters onChange={handleFilterChange} />
      <TourList tours={filteredTours} />
    </div>
  );
};
```

---

### 3.6. Debouncing & Throttling

**Search input với debounce:**

**components/search/SearchBox.tsx:**
```typescript
import { useState, useEffect } from 'react';
import { debounce } from 'lodash';

export const SearchBox: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  
  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedTerm(searchTerm);
    }, 500); // Đợi 500ms sau khi user ngưng gõ
    
    handler();
    
    return () => {
      handler.cancel();
    };
  }, [searchTerm]);
  
  // Use debouncedTerm để search
  const { data: results } = useQuery(
    ['search', debouncedTerm],
    () => tourService.search(debouncedTerm),
    { enabled: debouncedTerm.length > 2 }
  );
  
  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Tìm kiếm tour..."
    />
  );
};
```

---

### 3.7. Virtual Scrolling (Cho danh sách dài)

**Dùng react-window cho danh sách tour:**

```bash
npm install react-window
```

**components/tours/VirtualTourList.tsx:**
```typescript
import { FixedSizeList as List } from 'react-window';

interface VirtualTourListProps {
  tours: Tour[];
}

export const VirtualTourList: React.FC<VirtualTourListProps> = ({ tours }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <TourCard tour={tours[index]} />
    </div>
  );
  
  return (
    <List
      height={800}
      itemCount={tours.length}
      itemSize={350}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

---

## 4. CHATBOT OPTIMIZATION

### 4.1. Response Caching

**Mở rộng TTL cache trong `review_summary.py`:**

**chatbot/review_summary.py:**
```python
from functools import lru_cache
from datetime import datetime, timedelta

class ReviewSummarizer:
    def __init__(self):
        self.cache = {}
        self.cache_ttl = timedelta(hours=24)  # Tăng lên 24h
    
    def get_cached_summary(self, tour_id):
        if tour_id in self.cache:
            cached_data, timestamp = self.cache[tour_id]
            if datetime.now() - timestamp < self.cache_ttl:
                return cached_data
        return None
    
    def cache_summary(self, tour_id, summary):
        self.cache[tour_id] = (summary, datetime.now())
        
        # Cleanup old cache (giữ tối đa 1000 entries)
        if len(self.cache) > 1000:
            oldest_keys = sorted(
                self.cache.keys(),
                key=lambda k: self.cache[k][1]
            )[:100]
            for key in oldest_keys:
                del self.cache[key]
```

---

### 4.2. FAISS Index Optimization

**Optimize FAISS index trong `setup_faiss.py`:**

**chatbot/setup_faiss.py:**
```python
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

def create_optimized_faiss_index(embeddings):
    """
    Tạo FAISS index với IVF (Inverted File Index) cho tốc độ nhanh hơn
    """
    dimension = embeddings.shape[1]
    
    # Nếu có > 10000 vectors, dùng IVF
    if len(embeddings) > 10000:
        nlist = 100  # Số clusters
        quantizer = faiss.IndexFlatL2(dimension)
        index = faiss.IndexIVFFlat(quantizer, dimension, nlist)
        
        # Train index
        index.train(embeddings)
        index.add(embeddings)
        
        # Set search params
        index.nprobe = 10  # Số clusters search
    else:
        # Dùng flat index cho dataset nhỏ
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)
    
    return index
```

---

### 4.3. Reduce OpenAI API Calls

**Implement conversation context window:**

**chatbot/app.py:**
```python
from collections import deque

class ChatBot:
    def __init__(self):
        self.conversation_history = {}
        self.max_history = 5  # Chỉ giữ 5 messages gần nhất
    
    def get_conversation_history(self, user_id):
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = deque(maxlen=self.max_history)
        return list(self.conversation_history[user_id])
    
    def add_to_history(self, user_id, role, content):
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = deque(maxlen=self.max_history)
        self.conversation_history[user_id].append({
            'role': role,
            'content': content
        })
```

**Use streaming response để tăng perceived performance:**

```python
from openai import OpenAI

def stream_chat_response(messages):
    client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    
    stream = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        stream=True
    )
    
    for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content
```

---

### 4.4. Rate Limiting

**Thêm rate limiting cho chatbot API:**

```bash
pip install Flask-Limiter
```

**chatbot/app.py:**
```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/chat', methods=['POST'])
@limiter.limit("10 per minute")  # 10 requests/minute
def chat():
    # ... existing code
```

---

## 5. SECURITY OPTIMIZATION

### 5.1. Rate Limiting (Backend)

**Thêm Bucket4j cho rate limiting:**

**pom.xml:**
```xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.1.0</version>
</dependency>
```

**config/RateLimitConfig.java:**
```java
package backend.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class RateLimitConfig {
    
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    public Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, k -> createNewBucket());
    }
    
    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(
            100,                                    // 100 requests
            Refill.intervally(100, Duration.ofMinutes(1))  // per minute
        );
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }
}
```

**filter/RateLimitFilter.java:**
```java
package backend.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class RateLimitFilter implements Filter {
    
    private final RateLimitConfig rateLimitConfig;
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String key = getClientIP(httpRequest);
        Bucket bucket = rateLimitConfig.resolveBucket(key);
        
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        
        if (probe.isConsumed()) {
            httpResponse.addHeader("X-Rate-Limit-Remaining", 
                String.valueOf(probe.getRemainingTokens()));
            chain.doFilter(request, response);
        } else {
            httpResponse.setStatus(429); // Too Many Requests
            httpResponse.getWriter().write("{\"error\": \"Too many requests\"}");
        }
    }
    
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
```

---

### 5.2. SQL Injection Prevention

**Đảm bảo tất cả queries đều dùng Parameterized Queries:**

**✅ GOOD - Sử dụng JPA/JPQL:**
```java
@Query("SELECT t FROM Tour t WHERE t.name LIKE %:keyword%")
List<Tour> searchByName(@Param("keyword") String keyword);
```

**❌ BAD - String concatenation:**
```java
// NEVER DO THIS
String query = "SELECT * FROM tours WHERE name = '" + userInput + "'";
```

**Kiểm tra Native Queries:**
```bash
# Tìm tất cả native queries
grep -r "@Query.*nativeQuery.*true" backend/src/
```

Nếu có native query, đảm bảo dùng parameters:
```java
@Query(value = "SELECT * FROM tours WHERE name = :name", nativeQuery = true)
List<Tour> findByName(@Param("name") String name);
```

---

### 5.3. XSS Protection

**Thêm Content Security Policy header:**

**config/SecurityConfig.java:**
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        // ... existing config
        .headers(headers -> headers
            .contentSecurityPolicy(csp -> csp
                .policyDirectives("default-src 'self'; " +
                    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
                    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
                    "font-src 'self' https://fonts.gstatic.com; " +
                    "img-src 'self' data: https:; " +
                    "connect-src 'self' https://api.openweathermap.org;")
            )
            .xssProtection(xss -> xss.headerValue("1; mode=block"))
            .frameOptions(frame -> frame.deny())
        );
    
    return http.build();
}
```

---

### 5.4. Password Policy

**Tăng cường password policy:**

**util/PasswordValidator.java:**
```java
package backend.util;

import java.util.regex.Pattern;

public class PasswordValidator {
    
    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[!@#$%^&*(),.?\":{}|<>]");
    
    public static boolean isValid(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            return false;
        }
        
        return UPPERCASE.matcher(password).find()
            && LOWERCASE.matcher(password).find()
            && DIGIT.matcher(password).find()
            && SPECIAL.matcher(password).find();
    }
    
    public static String getRequirements() {
        return "Password must be at least " + MIN_LENGTH + " characters long, " +
               "contain uppercase, lowercase, digit, and special character.";
    }
}
```

**AuthServiceImpl.java:**
```java
@Override
public AuthResponse register(RegisterRequest request) {
    // Validate password
    if (!PasswordValidator.isValid(request.getPassword())) {
        throw new IllegalArgumentException(PasswordValidator.getRequirements());
    }
    
    // ... existing code
}
```

---

### 5.5. HTTPS Enforcement (Production)

**application-prod.yml:**
```yaml
server:
  port: 443
  ssl:
    enabled: true
    key-store: classpath:keystore.p12
    key-store-password: ${SSL_KEYSTORE_PASSWORD}
    key-store-type: PKCS12
    key-alias: tomcat
  
  # Redirect HTTP to HTTPS
  forward-headers-strategy: native

# Force HTTPS
security:
  require-ssl: true
```

---

## 6. DEVOPS & INFRASTRUCTURE

### 6.1. Docker Containerization

**Tạo Dockerfile cho Backend:**

**backend/Dockerfile:**
```dockerfile
# Multi-stage build
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

ENV JAVA_OPTS="-Xms512m -Xmx1024m"
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

**Tạo Dockerfile cho Frontend:**

**frontend/Dockerfile:**
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**frontend/nginx.conf:**
```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Tạo Dockerfile cho Chatbot:**

**chatbot/Dockerfile:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["python", "start_chatbot.py"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: tour_mysql
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: doan
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./CSDL.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - tour-network
  
  # Backend
  backend:
    build: ./backend
    container_name: tour_backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/doan
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: ${DB_ROOT_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      MAIL_USERNAME: ${MAIL_USERNAME}
      MAIL_PASSWORD: ${MAIL_PASSWORD}
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - tour-network
  
  # Frontend
  frontend:
    build: ./frontend
    container_name: tour_frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - tour-network
  
  # Chatbot
  chatbot:
    build: ./chatbot
    container_name: tour_chatbot
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      BACKEND_URL: http://backend:8080
    ports:
      - "5000:5000"
    depends_on:
      - backend
    networks:
      - tour-network

volumes:
  mysql_data:

networks:
  tour-network:
    driver: bridge
```

**.env.example:**
```env
# Database
DB_ROOT_PASSWORD=your_mysql_root_password

# JWT
JWT_SECRET=your_jwt_secret_key

# Email
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

**Chạy với Docker:**
```bash
# Build và start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Stop và xóa volumes
docker-compose down -v
```

---

### 6.2. Environment-based Configuration

**Backend - application.yml:**
```yaml
spring:
  profiles:
    active: ${SPRING_PROFILE:dev}
  
---
# Development
spring:
  config:
    activate:
      on-profile: dev
  datasource:
    url: jdbc:mysql://localhost:3306/doan
    username: root
    password: 1234
  jpa:
    show-sql: true

---
# Production
spring:
  config:
    activate:
      on-profile: prod
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate
```

**Frontend - .env files:**
```bash
# .env.development
VITE_API_URL=http://localhost:8080
VITE_CHATBOT_URL=http://localhost:5000

# .env.production
VITE_API_URL=https://api.yourdomain.com
VITE_CHATBOT_URL=https://chatbot.yourdomain.com
```

---

### 6.3. CI/CD Pipeline (GitHub Actions)

**.github/workflows/backend-ci.yml:**
```yaml
name: Backend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'backend/**'
  pull_request:
    branches: [ main ]
    paths:
      - 'backend/**'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
        cache: maven
    
    - name: Build with Maven
      run: |
        cd backend
        mvn clean install -DskipTests
    
    - name: Run tests
      run: |
        cd backend
        mvn test
    
    - name: Build Docker image
      if: github.ref == 'refs/heads/main'
      run: |
        cd backend
        docker build -t your-registry/tour-backend:latest .
    
    # - name: Push to Docker Hub
    #   if: github.ref == 'refs/heads/main'
    #   run: |
    #     echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
    #     docker push your-registry/tour-backend:latest
```

**.github/workflows/frontend-ci.yml:**
```yaml
name: Frontend CI/CD

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [ main ]
    paths:
      - 'frontend/**'

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Lint
      run: |
        cd frontend
        npm run lint
    
    - name: Build
      run: |
        cd frontend
        npm run build
    
    - name: Build Docker image
      if: github.ref == 'refs/heads/main'
      run: |
        cd frontend
        docker build -t your-registry/tour-frontend:latest .
```

---

### 6.4. Monitoring & Logging

**Thêm Spring Boot Actuator:**

**pom.xml:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**application.yml:**
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: always
  metrics:
    export:
      prometheus:
        enabled: true
```

**Tạo health check endpoint custom:**

**config/HealthCheckConfig.java:**
```java
package backend.config;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class DatabaseHealthIndicator implements HealthIndicator {
    
    private final DataSource dataSource;
    
    public DatabaseHealthIndicator(DataSource dataSource) {
        this.dataSource = dataSource;
    }
    
    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            return Health.up()
                .withDetail("database", "MySQL")
                .withDetail("validConnection", connection.isValid(1))
                .build();
        } catch (Exception e) {
            return Health.down()
                .withDetail("error", e.getMessage())
                .build();
        }
    }
}
```

---

## 7. TESTING & QUALITY ASSURANCE

### 7.1. Unit Testing (Backend)

**Tăng test coverage cho Services:**

**TourServiceImplTest.java:**
```java
package backend.service.impl;

import backend.entity.Tour;
import backend.repository.TourRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TourServiceImplTest {
    
    @Mock
    private TourRepository tourRepository;
    
    @InjectMocks
    private TourServiceImpl tourService;
    
    @Test
    void getTourBySlug_ShouldReturnTour_WhenSlugExists() {
        // Arrange
        String slug = "ha-noi-city-tour";
        Tour tour = new Tour();
        tour.setSlug(slug);
        tour.setName("Hà Nội City Tour");
        
        when(tourRepository.findBySlugWithDetails(slug))
            .thenReturn(Optional.of(tour));
        
        // Act
        TourResponse result = tourService.getTourBySlug(slug);
        
        // Assert
        assertNotNull(result);
        assertEquals(slug, result.getSlug());
        verify(tourRepository, times(1)).findBySlugWithDetails(slug);
    }
    
    @Test
    void getTourBySlug_ShouldThrowException_WhenSlugNotExists() {
        // Arrange
        String slug = "non-existent-tour";
        when(tourRepository.findBySlugWithDetails(slug))
            .thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            tourService.getTourBySlug(slug);
        });
    }
}
```

**Chạy tests với coverage:**
```bash
cd backend
mvn test
mvn jacoco:report  # Generate coverage report
```

---

### 7.2. Integration Testing

**BookingIntegrationTest.java:**
```java
package backend.integration;

import backend.dto.request.BookingRequest;
import backend.dto.response.BookingResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class BookingIntegrationTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void createBooking_ShouldReturnCreated_WhenRequestIsValid() {
        // Arrange
        BookingRequest request = new BookingRequest();
        request.setTourId(1L);
        request.setScheduleId(1L);
        request.setNumberOfAdults(2);
        
        // Act
        ResponseEntity<BookingResponse> response = restTemplate
            .postForEntity("/api/bookings", request, BookingResponse.class);
        
        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getBookingCode());
    }
}
```

---

### 7.3. Frontend Testing

**Thêm testing libraries:**

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event vitest
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

**TourCard.test.tsx:**
```typescript
import { render, screen } from '@testing-library/react';
import { TourCard } from '@/components/tours/TourCard';
import { describe, it, expect } from 'vitest';

describe('TourCard', () => {
  it('renders tour information correctly', () => {
    const tour = {
      id: 1,
      name: 'Hà Nội City Tour',
      price: 1000000,
      imageUrl: '/tour.jpg',
    };
    
    render(<TourCard tour={tour} />);
    
    expect(screen.getByText('Hà Nội City Tour')).toBeInTheDocument();
    expect(screen.getByText(/1,000,000/)).toBeInTheDocument();
  });
});
```

**Chạy tests:**
```bash
npm run test
```

---

## 📊 CHECKLIST TỐI ƯU HÓA

### Database ✅
- [ ] Tạo indexes cho các query phổ biến
- [ ] Optimize N+1 queries với fetch joins
- [ ] Tune HikariCP connection pool
- [ ] Implement database partitioning (nếu cần)
- [ ] Setup automatic backup

### Backend ✅
- [ ] Implement caching (Caffeine/Redis)
- [ ] Enable @Async for email/notifications
- [ ] Enable GZIP compression
- [ ] Ensure pagination for all list endpoints
- [ ] Use DTOs và Projections
- [ ] Optimize logging levels

### Frontend ✅
- [ ] Code splitting và lazy loading
- [ ] Image optimization với lazy loading
- [ ] Optimize React Query caching
- [ ] Reduce bundle size
- [ ] Implement memoization
- [ ] Debounce search inputs
- [ ] Consider virtual scrolling

### Chatbot ✅
- [ ] Extend cache TTL
- [ ] Optimize FAISS index
- [ ] Reduce OpenAI API calls
- [ ] Implement rate limiting
- [ ] Stream responses

### Security ✅
- [ ] Implement rate limiting
- [ ] Prevent SQL injection
- [ ] XSS protection
- [ ] Strong password policy
- [ ] HTTPS enforcement (production)

### DevOps ✅
- [ ] Dockerize all services
- [ ] Setup docker-compose
- [ ] Environment-based config
- [ ] CI/CD pipeline
- [ ] Monitoring & logging
- [ ] Health checks

### Testing ✅
- [ ] Unit tests (backend services)
- [ ] Integration tests
- [ ] Frontend component tests
- [ ] E2E tests (optional)
- [ ] Performance tests

---

## 🎯 KẾT LUẬN

Tối ưu hóa là một quá trình liên tục. Khuyến nghị:

1. **Bắt đầu với Database & Backend** (ảnh hưởng lớn nhất)
2. **Theo dõi metrics** để đánh giá hiệu quả
3. **Tối ưu dần dần**, đo lường sau mỗi thay đổi
4. **Ưu tiên User Experience** hơn là tối ưu sớm không cần thiết

**Thứ tự thực hiện khuyến nghị:**
1. Database Indexing (ngay lập tức)
2. Query Optimization - N+1 (đã làm ✅)
3. Caching Strategy
4. Docker & CI/CD
5. Frontend optimization
6. Security enhancements
7. Monitoring & Testing

---

**Tác giả:** AI Assistant  
**Ngày tạo:** November 4, 2025  
**Phiên bản:** 1.0

