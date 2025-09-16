package backend.controller;

import backend.dto.JwtAuthenticationResponse;
import backend.dto.LoginRequest;
import backend.dto.RegisterRequest;
import backend.dto.SocialLoginRequest;
import backend.dto.EmailVerificationRequest;
import backend.dto.ResendVerificationRequest;
import backend.model.Role;
import backend.model.User;
import backend.repository.UserRepository;
import backend.security.JwtUtils;
import backend.service.ActivityLogService;
import backend.service.EmailVerificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    
    @Autowired
    AuthenticationManager authenticationManager;
    
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    PasswordEncoder encoder;
    
    @Autowired
    JwtUtils jwtUtils;
    
    @Autowired
    ActivityLogService activityLogService;
    
    @Autowired
    EmailVerificationService emailVerificationService;
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("🔐 Login attempt - Email/Phone: " + loginRequest.getEmailOrPhone());
            
            // Tìm user để kiểm tra email verification
            User user = null;
            String loginIdentifier = loginRequest.getEmailOrPhone();
            
            if (loginIdentifier.contains("@")) {
                user = userRepository.findByEmail(loginIdentifier).orElse(null);
            } else {
                user = userRepository.findByPhone(loginIdentifier).orElse(null);
            }
            
            // Kiểm tra email verification nếu đăng nhập bằng email
            if (user != null && loginIdentifier.contains("@")) {
                if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "Email chưa được xác minh. Vui lòng kiểm tra email để lấy mã xác minh.");
                    error.put("requiresVerification", true);
                    error.put("email", user.getEmail());
                    return ResponseEntity.status(403).body(error);
                }
            }
            
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmailOrPhone(),
                            loginRequest.getPassword())
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            backend.security.UserPrincipal userPrincipal = (backend.security.UserPrincipal) authentication.getPrincipal();
            User authenticatedUser = userRepository.findByUsername(userPrincipal.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Log successful login
            activityLogService.logLogin(authenticatedUser);
            
            return ResponseEntity.ok(new JwtAuthenticationResponse(
                    jwt,
                    authenticatedUser.getId(),
                    authenticatedUser.getUsername(),
                    authenticatedUser.getEmail(),
                    authenticatedUser.getFullName(),
                    authenticatedUser.getRole()
            ));
        } catch (Exception e) {
            System.err.println("❌ Login failed for user: " + loginRequest.getEmailOrPhone());
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Tên đăng nhập hoặc mật khẩu không đúng!");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        Map<String, String> response = new HashMap<>();
        
        // Kiểm tra username chỉ khi được cung cấp
        if (signUpRequest.getUsername() != null && !signUpRequest.getUsername().trim().isEmpty() 
            && userRepository.existsByUsername(signUpRequest.getUsername())) {
            response.put("message", "Tên đăng nhập đã tồn tại!");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            response.put("message", "Email đã được sử dụng!");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Tạo user mới
        User user = new User();
        // Tự động tạo username từ email nếu không được cung cấp
        String username = signUpRequest.getUsername();
        if (username == null || username.trim().isEmpty()) {
            username = signUpRequest.getEmail().split("@")[0] + "_" + System.currentTimeMillis();
        }
        user.setUsername(username);
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setFullName(signUpRequest.getFullName());
        user.setPhone(signUpRequest.getPhone());
        user.setAddress(signUpRequest.getAddress());
        
        // Set role (mặc định là USER, chỉ ADMIN mới có thể tạo ADMIN khác)
        Role userRole = signUpRequest.getRole();
        if (userRole == null || userRole == Role.ADMIN) {
            userRole = Role.USER;
        }
        user.setRole(userRole);
        
        // User chưa được email verified, set false
        user.setEmailVerified(false);
        userRepository.save(user);
        
        // Gửi email verification
        try {
            emailVerificationService.sendVerificationCode(user.getEmail());
            response.put("message", "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.");
            response.put("username", user.getUsername());
            response.put("requiresVerification", "true");
            response.put("email", user.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error sending verification email: " + e.getMessage());
            response.put("message", "Đăng ký thành công nhưng không thể gửi email xác minh. Vui lòng thử gửi lại.");
            response.put("username", user.getUsername());
            response.put("requiresVerification", "true");
            response.put("email", user.getEmail());
            return ResponseEntity.ok(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(@AuthenticationPrincipal backend.security.UserPrincipal currentUser) {
        try {
            // Log logout if user is authenticated
            if (currentUser != null) {
                User user = userRepository.findByUsername(currentUser.getUsername()).orElse(null);
                if (user != null) {
                    activityLogService.logLogout(user);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error logging logout: " + e.getMessage());
        }
        
        SecurityContextHolder.clearContext();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Đăng xuất thành công!");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/social-login")
    public ResponseEntity<?> socialLogin(@Valid @RequestBody SocialLoginRequest socialRequest) {
        try {
            User user = null;
            
            // Tìm user theo provider ID
            if ("google".equals(socialRequest.getProvider())) {
                user = userRepository.findByGoogleId(socialRequest.getProviderId()).orElse(null);
            } else if ("facebook".equals(socialRequest.getProvider())) {
                user = userRepository.findByFacebookId(socialRequest.getProviderId()).orElse(null);
            }
            
            // Nếu chưa có user, tìm theo email
            if (user == null) {
                user = userRepository.findByEmail(socialRequest.getEmail()).orElse(null);
            }
            
            // Nếu vẫn chưa có, tạo user mới
            if (user == null) {
                user = createUserFromSocialLogin(socialRequest);
            } else {
                // Cập nhật social ID nếu user đã tồn tại
                updateUserSocialInfo(user, socialRequest);
            }
            
            // Tạo JWT token
            String jwt = jwtUtils.generateTokenFromUsername(user.getUsername());
            
            return ResponseEntity.ok(new JwtAuthenticationResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole()
            ));
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Có lỗi xảy ra khi đăng nhập bằng " + socialRequest.getProvider());
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    private User createUserFromSocialLogin(SocialLoginRequest socialRequest) {
        User user = new User();
        
        // Tạo username từ email
        String username = socialRequest.getEmail().split("@")[0];
        
        // Đảm bảo username unique
        int counter = 1;
        String originalUsername = username;
        while (userRepository.existsByUsername(username)) {
            username = originalUsername + counter;
            counter++;
        }
        
        user.setUsername(username);
        user.setEmail(socialRequest.getEmail());
        user.setFullName(socialRequest.getName());
        user.setPassword(encoder.encode("social_login_" + System.currentTimeMillis())); // Random password
        user.setRole(Role.USER);
        user.setIsActive(true);
        user.setAvatarUrl(socialRequest.getPicture());
        
        // Set social ID
        if ("google".equals(socialRequest.getProvider())) {
            user.setGoogleId(socialRequest.getProviderId());
        } else if ("facebook".equals(socialRequest.getProvider())) {
            user.setFacebookId(socialRequest.getProviderId());
        }
        
        return userRepository.save(user);
    }
    
    private void updateUserSocialInfo(User user, SocialLoginRequest socialRequest) {
        boolean updated = false;
        
        // Cập nhật social ID nếu chưa có
        if ("google".equals(socialRequest.getProvider()) && user.getGoogleId() == null) {
            user.setGoogleId(socialRequest.getProviderId());
            updated = true;
        } else if ("facebook".equals(socialRequest.getProvider()) && user.getFacebookId() == null) {
            user.setFacebookId(socialRequest.getProviderId());
            updated = true;
        }
        
        // Cập nhật avatar nếu chưa có
        if (user.getAvatarUrl() == null && socialRequest.getPicture() != null) {
            user.setAvatarUrl(socialRequest.getPicture());
            updated = true;
        }
        
        if (updated) {
            userRepository.save(user);
        }
    }
    
    @PostMapping("/setup-admin")
    public ResponseEntity<?> setupAdmin() {
        try {
            System.out.println("🔧 Setting up admin account...");
            
            // Tìm admin account
            User admin = userRepository.findByUsername("admin").orElse(null);
            
            if (admin != null) {
                // Nếu đã có admin, reset password
                System.out.println("🔄 Admin exists, resetting password...");
                admin.setPassword(encoder.encode("admin123"));
                admin.setIsActive(true);
                admin.setEmailVerified(true);
                userRepository.save(admin);
                
                Map<String, String> response = new HashMap<>();
                response.put("message", "Admin password reset successfully!");
                response.put("username", "admin");
                response.put("password", "admin123");
                return ResponseEntity.ok(response);
            } else {
                // Tạo admin account mới
                System.out.println("🆕 Creating new admin account...");
                admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@tourism.com");
                admin.setPassword(encoder.encode("admin123"));
                admin.setFullName("System Administrator");
                admin.setRole(backend.model.Role.ADMIN);
                admin.setIsActive(true);
                admin.setEmailVerified(true);
                
                userRepository.save(admin);
                System.out.println("✅ Admin account created successfully");
                
                Map<String, String> response = new HashMap<>();
                response.put("message", "Admin account created successfully!");
                response.put("username", "admin");
                response.put("password", "admin123");
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error setting up admin account: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to setup admin account");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/debug-admin")
    public ResponseEntity<?> debugAdmin() {
        try {
            User admin = userRepository.findByUsername("admin").orElse(null);
            Map<String, Object> response = new HashMap<>();
            
            if (admin != null) {
                response.put("found", true);
                response.put("id", admin.getId());
                response.put("username", admin.getUsername());
                response.put("email", admin.getEmail());
                response.put("fullName", admin.getFullName());
                response.put("role", admin.getRole());
                response.put("isActive", admin.getIsActive());
                response.put("emailVerified", admin.getEmailVerified());
                response.put("passwordHash", admin.getPassword().substring(0, 20) + "...");
            } else {
                response.put("found", false);
                response.put("message", "Admin user not found");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error debugging admin");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody EmailVerificationRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            boolean isVerified = emailVerificationService.verifyEmail(request.getEmail(), request.getVerificationCode());
            
            if (isVerified) {
                response.put("message", "Email đã được xác minh thành công! Bạn có thể đăng nhập ngay bây giờ.");
                response.put("verified", true);
                return ResponseEntity.ok(response);
            } else {
                response.put("message", "Mã xác minh không đúng hoặc đã hết hạn. Vui lòng thử lại.");
                response.put("verified", false);
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            System.err.println("❌ Error verifying email: " + e.getMessage());
            response.put("message", "Lỗi hệ thống khi xác minh email. Vui lòng thử lại sau.");
            response.put("verified", false);
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        Map<String, String> response = new HashMap<>();
        
        try {
            // Kiểm tra email đã verified chưa
            if (emailVerificationService.isEmailVerified(request.getEmail())) {
                response.put("message", "Email này đã được xác minh rồi.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Gửi lại mã verification
            emailVerificationService.sendVerificationCode(request.getEmail());
            response.put("message", "Mã xác minh mới đã được gửi tới email của bạn.");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error resending verification: " + e.getMessage());
            response.put("message", "Không thể gửi lại mã xác minh. Vui lòng thử lại sau.");
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestParam String email) {
        Map<String, String> response = new HashMap<>();
        
        try {
            String testCode = "123456";
            emailVerificationService.sendVerificationCode(email);
            response.put("message", "Email test đã được gửi tới " + email);
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Test email failed: " + e.getMessage());
            e.printStackTrace();
            response.put("message", "Lỗi gửi email: " + e.getMessage());
            response.put("status", "error");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
