package backend.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Configuration for Rate Limiting using Bucket4j (Token Bucket Algorithm)
 * 
 * Rate limits:
 * - General API: 100 requests/minute per IP
 * - Auth endpoints: 5 requests/minute per IP
 * - Chatbot: 20 requests/minute per IP
 */
@Configuration
public class RateLimitConfig {
    
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    
    /**
     * Get or create bucket for a specific key (IP address)
     */
    public Bucket resolveBucket(String key) {
        return cache.computeIfAbsent(key, k -> createNewBucket());
    }
    
    /**
     * Create bucket for general API endpoints
     * 100 requests per minute
     */
    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.builder()
            .capacity(100)  // capacity
            .refillIntervally(100, Duration.ofMinutes(1))  // refill rate
            .build();
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }
    
    /**
     * Create bucket for auth endpoints (login, register)
     * 5 requests per minute to prevent brute force
     */
    public Bucket resolveAuthBucket(String key) {
        return cache.computeIfAbsent("auth:" + key, k -> createAuthBucket());
    }
    
    private Bucket createAuthBucket() {
        Bandwidth limit = Bandwidth.builder()
            .capacity(5)  // capacity
            .refillIntervally(5, Duration.ofMinutes(1))
            .build();
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }
    
    /**
     * Create bucket for chatbot endpoints
     * 20 requests per minute
     */
    public Bucket resolveChatbotBucket(String key) {
        return cache.computeIfAbsent("chatbot:" + key, k -> createChatbotBucket());
    }
    
    private Bucket createChatbotBucket() {
        Bandwidth limit = Bandwidth.builder()
            .capacity(20)  // capacity
            .refillIntervally(20, Duration.ofMinutes(1))
            .build();
        return Bucket.builder()
            .addLimit(limit)
            .build();
    }
}

