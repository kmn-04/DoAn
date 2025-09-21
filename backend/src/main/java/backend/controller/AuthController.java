package backend.controller;

import backend.dto.request.LoginRequest;
import backend.dto.request.RegisterRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.AuthResponse;
import backend.dto.response.UserResponse;
import backend.security.UserDetailsImpl;
import backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "APIs for user authentication and authorization")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AuthController extends BaseController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    @Operation(summary = "Register new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        
        AuthResponse authResponse = authService.register(request);
        
        return ResponseEntity.ok(success("User registered successfully", authResponse));
    }
    
    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
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
}
