package backend.controller;

import backend.dto.request.ForgotPasswordRequest;
import backend.dto.request.LoginRequest;
import backend.dto.request.RegisterRequest;
import backend.dto.request.ResetPasswordRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.AuthResponse;
import backend.dto.response.UserResponse;
import backend.security.UserDetailsImpl;
import backend.service.AuthService;
import backend.service.EmailService;
import backend.service.PasswordResetService;
import backend.security.JwtUtils;
import backend.entity.User;
import backend.repository.UserRepository;
import backend.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "APIs for user authentication and authorization")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AuthController extends BaseController {
    
    private final AuthService authService;
    private final EmailService emailService;
    private final PasswordResetService passwordResetService;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/register")
    @Operation(
        summary = "Register new user account",
        description = "Create a new user account with email, password, and personal information. Returns JWT token upon successful registration.",
        tags = {"Authentication"}
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "User registered successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = AuthResponse.class),
                examples = @ExampleObject(
                    name = "Successful Registration",
                    value = """
                        {
                          "message": "User registered successfully",
                          "status": "SUCCESS",
                          "data": {
                            "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
                            "user": {
                              "id": 1,
                              "email": "user@example.com",
                              "name": "John Doe",
                              "phone": "0123456789",
                              "role": "USER",
                              "status": "ACTIVE"
                            }
                          }
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid input or email already exists",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "message": "Email already exists",
                          "status": "ERROR",
                          "data": null
                        }
                        """
                )
            )
        )
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "User registration details",
        required = true,
        content = @Content(
            examples = @ExampleObject(
                name = "Registration Request",
                value = """
                    {
                      "email": "user@example.com",
                      "password": "SecurePass123!",
                      "name": "John Doe",
                      "phone": "0123456789"
                    }
                    """
            )
        )
    )
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        
        AuthResponse authResponse = authService.register(request);
        
        return ResponseEntity.ok(success("User registered successfully", authResponse));
    }
    
    @PostMapping("/login")
    @Operation(
        summary = "User login",
        description = "Authenticate user with email and password. Returns JWT access token and refresh token.",
        tags = {"Authentication"}
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Login successful",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                        {
                          "message": "Login successful",
                          "status": "SUCCESS",
                          "data": {
                            "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                            "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
                            "user": {
                              "id": 1,
                              "email": "user@example.com",
                              "name": "John Doe",
                              "role": "USER"
                            }
                          }
                        }
                        """
                )
            )
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Invalid credentials",
            content = @Content(
                examples = @ExampleObject(
                    value = """
                        {
                          "message": "Invalid email or password",
                          "status": "ERROR"
                        }
                        """
                )
            )
        )
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
        description = "Login credentials",
        required = true,
        content = @Content(
            examples = @ExampleObject(
                value = """
                    {
                      "email": "user@example.com",
                      "password": "SecurePass123!"
                    }
                    """
            )
        )
    )
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        
        AuthResponse authResponse = authService.login(request);
        
        return ResponseEntity.ok(success("Login successful", authResponse));
    }
    
    @GetMapping("/me")
    @Operation(summary = "Get current user information")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        UserResponse userResponse = authService.getCurrentUser(userDetails.getEmail());
        
        return ResponseEntity.ok(success(userResponse));
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @Parameter(description = "Refresh token") @RequestParam String refreshToken) {
        
        AuthResponse authResponse = authService.refreshToken(refreshToken);
        
        return ResponseEntity.ok(success("Token refreshed successfully", authResponse));
    }
    
    @PostMapping("/logout")
    @Operation(summary = "Logout user")
    public ResponseEntity<ApiResponse<String>> logout(
            @Parameter(description = "JWT token") @RequestHeader("Authorization") String token) {
        
        // Remove "Bearer " prefix
        String jwtToken = token.substring(7);
        authService.logout(jwtToken);
        
        return ResponseEntity.ok(success("Logout successful"));
    }
    
    @GetMapping("/check-email")
    @Operation(summary = "Check if email exists")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailExists(
            @Parameter(description = "Email to check") @RequestParam String email) {
        
        boolean exists = authService.emailExists(email);
        
        return ResponseEntity.ok(success("Email check completed", exists));
    }
    
    @GetMapping("/validate-token")
    @Operation(summary = "Validate JWT token")
    public ResponseEntity<ApiResponse<UserResponse>> validateToken() {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated()) {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            UserResponse userResponse = authService.getCurrentUser(userDetails.getEmail());
            
            return ResponseEntity.ok(success("Token is valid", userResponse));
        }
        
        return ResponseEntity.ok(error("Token is invalid"));
    }
    
    @GetMapping("/user-info")
    @Operation(summary = "Get authenticated user info")
    public ResponseEntity<ApiResponse<UserDetailsInfo>> getUserInfo() {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        UserDetailsInfo info = new UserDetailsInfo(
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                userDetails.getAuthorities().toString()
        );
        
        return ResponseEntity.ok(success("User info retrieved", info));
    }
    
    /**
     * Inner class for user details info
     */
    public static class UserDetailsInfo {
        private Long id;
        private String name;
        private String email;
        private String authorities;
        
        public UserDetailsInfo(Long id, String name, String email, String authorities) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.authorities = authorities;
        }
        
        // Getters
        public Long getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getAuthorities() { return authorities; }
    }
    
    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Password reset requested for email: {}", request.getEmail());
        
        // Always return success to prevent email enumeration
        // Check if email exists
        if (!authService.emailExists(request.getEmail())) {
            return ResponseEntity.ok(success("If email exists, reset link has been sent"));
        }
        
        try {
            // Generate reset token
            String resetToken = jwtUtils.generateResetToken(request.getEmail());
            
            // Save token
            passwordResetService.saveResetToken(request.getEmail(), resetToken);
            
            // Get user and send email
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));
            
            emailService.sendPasswordResetEmail(user, resetToken);
            
            log.info("Password reset email sent to: {}", request.getEmail());
            
        } catch (Exception e) {
            log.error("Error sending password reset email", e);
            // Still return success to prevent information leakage
        }
        
        return ResponseEntity.ok(success("If email exists, reset link has been sent"));
    }
    
    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with token")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Password reset attempted with token");
        
        // Validate password confirmation
        if (!request.isPasswordMatching()) {
            return ResponseEntity.badRequest().body(error("New password and confirm password do not match"));
        }
        
        try {
            // Validate reset token
            if (!jwtUtils.validateResetToken(request.getToken())) {
                return ResponseEntity.badRequest().body(error("Invalid or expired reset token"));
            }
            
            // Get email from token
            String email = jwtUtils.getEmailFromResetToken(request.getToken());
            
            // Check if token exists in our storage
            if (!passwordResetService.isValidResetToken(email, request.getToken())) {
                return ResponseEntity.badRequest().body(error("Invalid or expired reset token"));
            }
            
            // Find user
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
            
            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
            
            // Delete reset token
            passwordResetService.deleteResetToken(email);
            
            log.info("Password reset successful for email: {}", email);
            
            return ResponseEntity.ok(success("Password reset successfully"));
            
        } catch (Exception e) {
            log.error("Error resetting password", e);
            return ResponseEntity.badRequest().body(error("Invalid or expired reset token"));
        }
    }
    
    @PostMapping("/test-email")
    @Operation(summary = "Test email sending")
    public ResponseEntity<ApiResponse<String>> testEmail(@RequestParam String email) {
        log.info("Testing email sending to: {}", email);
        
        try {
            // Find user by email or create a test user
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                // Create a test user for testing
                user = new User();
                user.setEmail(email);
                user.setName("Test User");
            }
            
            // Send test email
            emailService.sendPasswordResetEmail(user, "test-token-123");
            
            return ResponseEntity.ok(success("Test email sent successfully"));
            
        } catch (Exception e) {
            log.error("Error sending test email", e);
            return ResponseEntity.badRequest().body(error("Failed to send test email: " + e.getMessage()));
        }
    }
    
    @GetMapping("/debug-email-config")
    @Operation(summary = "Debug email configuration")
    public ResponseEntity<ApiResponse<Map<String, String>>> debugEmailConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("fromEmail", "khoi14112004@gmail.com");
        config.put("appName", "Tour Booking System");
        config.put("appUrl", "http://localhost:5173");
        config.put("smtpHost", "smtp.gmail.com");
        config.put("smtpPort", "587");
        config.put("auth", "true");
        config.put("starttls", "true");
        
        return ResponseEntity.ok(success("Email configuration", config));
    }
}
