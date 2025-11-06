package backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.util.concurrent.TimeUnit;

/**
 * Configuration for application caching using Caffeine.
 * Caches frequently accessed data to reduce database load.
 */
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    @Primary
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
            // Tour related caches
            "tours",                    // List of tours with filters
            "tourDetails",              // Individual tour details
            "toursByCategory",          // Tours grouped by category
            "toursByDestination",       // Tours grouped by destination
            
            // Master data caches (thay đổi ít)
            "categories",               // All categories
            "destinations",             // All destinations
            "countries",                // All countries
            
            // Partner caches
            "partners",                 // List of partners
            "partnerDetails",           // Individual partner details
            
            // Promotion & loyalty caches
            "promotions",               // Active promotions
            "activePromotions",         // Currently valid promotions
            "loyaltyLevels",           // Loyalty level configurations
            
            // Review & rating caches
            "reviews",                  // Tour reviews
            "reviewStats",              // Review statistics
            
            // External API caches (cache lâu hơn)
            "weatherData",              // Weather forecasts
            
            // System caches
            "banners",                  // Active banners
            "statistics"                // Dashboard statistics
        );
        
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)                          // Tối đa 1000 entries mỗi cache
            .expireAfterWrite(10, TimeUnit.MINUTES)     // Expire sau 10 phút không write
            .recordStats());                            // Enable statistics tracking
        
        return cacheManager;
    }
    
    /**
     * Cache riêng cho external API data (weather) - expire chậm hơn
     */
    @Bean("weatherCacheManager")
    public CacheManager weatherCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("weatherData");
        
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(500)
            .expireAfterWrite(30, TimeUnit.MINUTES)     // Weather cache 30 phút
            .recordStats());
        
        return cacheManager;
    }
    
    /**
     * Cache cho master data (categories, destinations) - expire rất chậm
     */
    @Bean("masterDataCacheManager")
    public CacheManager masterDataCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager(
            "categories", "destinations", "countries", "loyaltyLevels"
        );
        
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(200)
            .expireAfterWrite(60, TimeUnit.MINUTES)     // Master data cache 1 giờ
            .recordStats());
        
        return cacheManager;
    }
}
