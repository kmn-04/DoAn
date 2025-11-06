package backend.security;

import backend.config.RateLimitConfig;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Filter to implement rate limiting on API endpoints
 * Uses Token Bucket algorithm via Bucket4j
 * Can be disabled for development via application.yml
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitFilter implements Filter {
    
    private final RateLimitConfig rateLimitConfig;
    
    @Value("${app.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        // Skip rate limiting if disabled (for development)
        if (!rateLimitEnabled) {
            chain.doFilter(request, response);
            return;
        }
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        String requestURI = httpRequest.getRequestURI();
        String clientIP = getClientIP(httpRequest);
        
        // Select appropriate bucket based on endpoint
        Bucket bucket;
        if (isAuthEndpoint(requestURI)) {
            bucket = rateLimitConfig.resolveAuthBucket(clientIP);
        } else if (isChatbotEndpoint(requestURI)) {
            bucket = rateLimitConfig.resolveChatbotBucket(clientIP);
        } else {
            bucket = rateLimitConfig.resolveBucket(clientIP);
        }
        
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        
        if (probe.isConsumed()) {
            // Request allowed
            httpResponse.addHeader("X-Rate-Limit-Remaining", 
                String.valueOf(probe.getRemainingTokens()));
            chain.doFilter(request, response);
        } else {
            // Rate limit exceeded
            long waitForRefill = probe.getNanosToWaitForRefill() / 1_000_000_000;
            
            log.warn("Rate limit exceeded for IP: {} on endpoint: {}", clientIP, requestURI);
            
            httpResponse.setStatus(429); // Too Many Requests
            httpResponse.setContentType("application/json");
            httpResponse.addHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(waitForRefill));
            httpResponse.getWriter().write(
                String.format("{\"error\": \"Too many requests. Please try again in %d seconds\"}", waitForRefill)
            );
        }
    }
    
    /**
     * Get client IP address, considering proxy headers
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isEmpty()) {
            // X-Forwarded-For can contain multiple IPs, take the first one
            return xfHeader.split(",")[0].trim();
        }
        
        String xRealIP = request.getHeader("X-Real-IP");
        if (xRealIP != null && !xRealIP.isEmpty()) {
            return xRealIP;
        }
        
        return request.getRemoteAddr();
    }
    
    /**
     * Check if endpoint is auth-related (login, register, forgot-password)
     */
    private boolean isAuthEndpoint(String uri) {
        return uri.contains("/api/auth/login") 
            || uri.contains("/api/auth/register")
            || uri.contains("/api/auth/forgot-password")
            || uri.contains("/api/auth/reset-password");
    }
    
    /**
     * Check if endpoint is chatbot-related
     */
    private boolean isChatbotEndpoint(String uri) {
        return uri.contains("/api/chatbot") || uri.contains("/chatbot/");
    }
}

