package backend.service.impl;

import backend.dto.request.NewsletterRequest;
import backend.dto.response.NewsletterResponse;
import backend.entity.Newsletter;
import backend.repository.NewsletterRepository;
import backend.service.EmailService;
import backend.service.NewsletterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class NewsletterServiceImpl implements NewsletterService {
    
    private final NewsletterRepository newsletterRepository;
    private final EmailService emailService;
    
    @Override
    @Transactional
    public NewsletterResponse subscribe(NewsletterRequest request, String ipAddress, String userAgent) {
        String email = request.getEmail().toLowerCase().trim();
        
        // Check if email already exists
        Newsletter existing = newsletterRepository.findByEmail(email).orElse(null);
        
        if (existing != null) {
            // If already subscribed and active, return existing
            if (existing.getIsActive()) {
                log.info("📧 Email {} is already subscribed", email);
                return mapToResponse(existing);
            }
            
            // If previously unsubscribed, reactivate
            existing.setIsActive(true);
            existing.setSubscribedAt(LocalDateTime.now());
            existing.setUnsubscribedAt(null);
            existing.setIpAddress(ipAddress);
            existing.setUserAgent(userAgent);
            
            Newsletter reactivated = newsletterRepository.save(existing);
            log.info("✅ Reactivated newsletter subscription for: {}", email);
            
            return mapToResponse(reactivated);
        }
        
        // Create new subscription
        Newsletter newsletter = new Newsletter();
        newsletter.setEmail(email);
        newsletter.setSubscribedAt(LocalDateTime.now());
        newsletter.setIsActive(true);
        newsletter.setIpAddress(ipAddress);
        newsletter.setUserAgent(userAgent);
        
        Newsletter saved = newsletterRepository.save(newsletter);
        log.info("✅ New newsletter subscription: {}", email);
        
        // Send welcome email asynchronously
        try {
            emailService.sendNewsletterWelcomeEmail(email, email);
        } catch (Exception e) {
            log.error("❌ Error sending welcome email, but subscription was successful: {}", e.getMessage());
        }
        
        return mapToResponse(saved);
    }
    
    @Override
    @Transactional
    public void unsubscribe(String email) {
        Newsletter newsletter = newsletterRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại trong danh sách"));
        
        if (!newsletter.getIsActive()) {
            throw new RuntimeException("Email đã được hủy đăng ký trước đó");
        }
        
        newsletter.setIsActive(false);
        newsletter.setUnsubscribedAt(LocalDateTime.now());
        
        newsletterRepository.save(newsletter);
        log.info("🚫 Unsubscribed from newsletter: {}", email);
    }
    
    @Override
    public long getTotalSubscribers() {
        return newsletterRepository.countByIsActive(true);
    }
    
    private NewsletterResponse mapToResponse(Newsletter newsletter) {
        NewsletterResponse response = new NewsletterResponse();
        response.setId(newsletter.getId());
        response.setEmail(newsletter.getEmail());
        response.setSubscribedAt(newsletter.getSubscribedAt());
        response.setIsActive(newsletter.getIsActive());
        return response;
    }
}

