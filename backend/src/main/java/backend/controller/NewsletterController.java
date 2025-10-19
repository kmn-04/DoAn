package backend.controller;

import backend.dto.request.NewsletterRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.NewsletterResponse;
import backend.service.NewsletterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/newsletter")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Newsletter", description = "Newsletter subscription APIs")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class NewsletterController extends BaseController {
    
    private final NewsletterService newsletterService;
    
    @PostMapping("/subscribe")
    @Operation(summary = "Subscribe to newsletter", description = "Subscribe email to receive news and promotions")
    public ResponseEntity<ApiResponse<NewsletterResponse>> subscribe(
            @Valid @RequestBody NewsletterRequest request,
            HttpServletRequest httpRequest) {
        
        try {
            String ipAddress = getClientIP(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");
            
            log.info("📧 Newsletter subscription request from: {}", request.getEmail());
            
            NewsletterResponse response = newsletterService.subscribe(request, ipAddress, userAgent);
            
            return ResponseEntity.ok(success("Đăng ký nhận tin thành công! Cảm ơn bạn đã quan tâm.", response));
            
        } catch (Exception e) {
            log.error("❌ Error subscribing to newsletter: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(error("Đăng ký không thành công: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/unsubscribe")
    @Operation(summary = "Unsubscribe from newsletter", description = "Unsubscribe email from newsletter")
    public ResponseEntity<ApiResponse<Void>> unsubscribe(@RequestParam String email) {
        try {
            newsletterService.unsubscribe(email);
            return ResponseEntity.ok(success("Hủy đăng ký thành công"));
        } catch (Exception e) {
            log.error("❌ Error unsubscribing: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(error("Hủy đăng ký không thành công: " + e.getMessage()));
        }
    }
    
    @GetMapping("/total-subscribers")
    @Operation(summary = "Get total subscribers", description = "Get total active newsletter subscribers")
    public ResponseEntity<ApiResponse<Long>> getTotalSubscribers() {
        try {
            long total = newsletterService.getTotalSubscribers();
            return ResponseEntity.ok(success("Total subscribers retrieved", total));
        } catch (Exception e) {
            log.error("❌ Error getting total subscribers: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(error("Error retrieving total subscribers"));
        }
    }
    
    /**
     * Get client IP address from request
     */
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}

