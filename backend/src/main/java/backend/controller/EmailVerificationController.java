package backend.controller;

import backend.dto.response.ApiResponse;
import backend.service.EmailVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Email Verification", description = "APIs for email verification")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class EmailVerificationController extends BaseController {
    
    private final EmailVerificationService emailVerificationService;
    
    @GetMapping("/verify-email")
    @Operation(summary = "Verify email with token", description = "Verify user's email address using the token sent via email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(
            @Parameter(description = "Email verification token") @RequestParam String token) {
        log.info("Email verification request with token: {}", token);
        
        try {
            boolean verified = emailVerificationService.verifyEmail(token);
            
            if (verified) {
                return ResponseEntity.ok(success("Email xác thực thành công! Bạn có thể đăng nhập ngay bây giờ."));
            } else {
                return ResponseEntity.badRequest().body(error("Không thể xác thực email. Vui lòng thử lại."));
            }
        } catch (Exception e) {
            log.error("Email verification failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @PostMapping("/resend-verification")
    @Operation(summary = "Resend verification email", description = "Resend verification email to user")
    public ResponseEntity<ApiResponse<String>> resendVerification(
            @Parameter(description = "User's email address") @RequestParam String email) {
        log.info("Resend verification email request for: {}", email);
        
        try {
            emailVerificationService.resendVerificationEmail(email);
            return ResponseEntity.ok(success("Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn."));
        } catch (Exception e) {
            log.error("Failed to resend verification email: {}", e.getMessage());
            return ResponseEntity.badRequest().body(error(e.getMessage()));
        }
    }
    
    @GetMapping("/check-verification-status")
    @Operation(summary = "Check if token is valid", description = "Check if verification token is still valid")
    public ResponseEntity<ApiResponse<Boolean>> checkVerificationStatus(
            @Parameter(description = "Email verification token") @RequestParam String token) {
        log.info("Checking verification status for token: {}", token);
        
        boolean isValid = emailVerificationService.isTokenValid(token);
        return ResponseEntity.ok(success("Token status checked", isValid));
    }
}

