package backend.service;

import backend.dto.request.NewsletterRequest;
import backend.dto.response.NewsletterResponse;

public interface NewsletterService {
    
    /**
     * Subscribe to newsletter
     */
    NewsletterResponse subscribe(NewsletterRequest request, String ipAddress, String userAgent);
    
    /**
     * Unsubscribe from newsletter
     */
    void unsubscribe(String email);
    
    /**
     * Get total active subscribers
     */
    long getTotalSubscribers();
}

