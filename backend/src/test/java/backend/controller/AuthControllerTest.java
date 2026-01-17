package backend.controller;

import backend.dto.request.LoginRequest;
import backend.dto.request.RegisterRequest;
import backend.dto.response.AuthResponse;
import backend.dto.response.UserResponse;
import backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import backend.config.SecurityConfig;
import backend.security.JwtAuthenticationFilter;
import backend.security.RateLimitFilter;
import backend.security.UserDetailsImpl;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test cases cho Authentication Controller
 * Bao gồm: Đăng ký, Đăng nhập, Lấy thông tin user, Refresh token, Logout
 */
@WebMvcTest(controllers = AuthController.class, 
            excludeAutoConfiguration = {
                org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
                org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class,
                org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class,
                org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientWebSecurityAutoConfiguration.class
            },
            excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
                    SecurityConfig.class,
                    JwtAuthenticationFilter.class,
                    RateLimitFilter.class
                })
            })
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("Authentication Controller Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private backend.service.EmailService emailService;

    @MockBean
    private backend.service.PasswordResetService passwordResetService;

    @MockBean
    private backend.security.JwtUtils jwtUtils;

    @MockBean
    private backend.repository.UserRepository userRepository;

    @MockBean
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @MockBean
    private backend.security.UserDetailsServiceImpl userDetailsService;

    @MockBean
    private backend.service.TokenBlacklistService tokenBlacklistService;

    private RegisterRequest validRegisterRequest;
    private LoginRequest validLoginRequest;
    private AuthResponse mockAuthResponse;

    @BeforeEach
    void setUp() {
        // Setup valid register request
        validRegisterRequest = new RegisterRequest();
        validRegisterRequest.setName("Nguyễn Văn A");
        validRegisterRequest.setEmail("test@example.com");
        validRegisterRequest.setPassword("Password123");
        validRegisterRequest.setConfirmPassword("Password123");
        validRegisterRequest.setPhone("0123456789");
        validRegisterRequest.setAddress("123 Đường ABC");
        validRegisterRequest.setDateOfBirth("2000-01-01");
        validRegisterRequest.setGender("MALE");

        // Setup valid login request
        validLoginRequest = new LoginRequest();
        validLoginRequest.setEmail("test@example.com");
        validLoginRequest.setPassword("Password123");

        // Setup mock auth response
        UserResponse userResponse = new UserResponse();
        userResponse.setId(1L);
        userResponse.setEmail("test@example.com");
        userResponse.setName("Nguyễn Văn A");
        
        mockAuthResponse = new AuthResponse();
        mockAuthResponse.setToken("mock-jwt-token");
        mockAuthResponse.setRefreshToken("mock-refresh-token");
        mockAuthResponse.setUser(userResponse);
    }

    @Test
    @DisplayName("TC001: Đăng ký tài khoản thành công")
    void testRegister_Success() throws Exception {
        // Given
        when(authService.register(any(RegisterRequest.class))).thenReturn(mockAuthResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.refreshToken").exists())
                .andExpect(jsonPath("$.data.user.email").value("test@example.com"));
    }

    @Test
    @DisplayName("TC002: Đăng ký thất bại - Email đã tồn tại")
    void testRegister_EmailExists() throws Exception {
        // Given
        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new backend.exception.BadRequestException("Email already exists"));

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validRegisterRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC003: Đăng ký thất bại - Validation error (email không hợp lệ)")
    void testRegister_InvalidEmail() throws Exception {
        // Given
        RegisterRequest invalidRequest = new RegisterRequest();
        invalidRequest.setEmail("invalid-email");
        invalidRequest.setPassword("Password123");
        invalidRequest.setConfirmPassword("Password123");
        invalidRequest.setName("Test User");
        invalidRequest.setPhone("0123456789");
        invalidRequest.setDateOfBirth("2000-01-01");
        invalidRequest.setGender("MALE");

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC004: Đăng ký thất bại - Mật khẩu không khớp")
    void testRegister_PasswordMismatch() throws Exception {
        // Given
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password123");
        request.setConfirmPassword("DifferentPassword");
        request.setName("Test User");
        request.setPhone("0123456789");
        request.setDateOfBirth("2000-01-01");
        request.setGender("MALE");

        // Mock service to throw exception when password doesn't match
        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new backend.exception.BadRequestException("Password and confirm password do not match"));

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC005: Đăng nhập thành công")
    void testLogin_Success() throws Exception {
        // Given
        when(authService.login(any(LoginRequest.class))).thenReturn(mockAuthResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.email").value("test@example.com"));
    }

    @Test
    @DisplayName("TC006: Đăng nhập thất bại - Sai mật khẩu")
    void testLogin_InvalidCredentials() throws Exception {
        // Given
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new backend.exception.BadRequestException("Invalid email or password"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validLoginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC007: Lấy thông tin user hiện tại")
    @WithMockUser(username = "test@example.com")
    void testGetCurrentUser_Success() throws Exception {
        // Given
        UserResponse userResponse = new UserResponse();
        userResponse.setId(1L);
        userResponse.setEmail("test@example.com");
        userResponse.setName("Nguyễn Văn A");
        
        // Mock UserDetailsImpl for authentication principal
        UserDetailsImpl userDetails = new UserDetailsImpl(
                1L,
                "Nguyễn Văn A",
                "test@example.com",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        
        // Mock the service call
        when(authService.getCurrentUser("test@example.com")).thenReturn(userResponse);

        // When & Then
        // Note: @WithMockUser creates a User object, not UserDetailsImpl
        // The controller will try to cast it, which may cause ClassCastException
        // This test may need to be adjusted based on actual security configuration
        mockMvc.perform(get("/api/auth/me")
                .with(httpRequest -> {
                    // Set custom authentication with UserDetailsImpl
                    org.springframework.security.core.Authentication auth = 
                        new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    org.springframework.security.core.context.SecurityContextHolder.getContext()
                        .setAuthentication(auth);
                    return httpRequest;
                }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("test@example.com"));
    }

    @Test
    @DisplayName("TC008: Kiểm tra email đã tồn tại")
    void testCheckEmailExists_True() throws Exception {
        // Given
        when(authService.emailExists("existing@example.com")).thenReturn(true);

        // When & Then
        mockMvc.perform(get("/api/auth/check-email")
                .param("email", "existing@example.com")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").value(true));
    }

    @Test
    @DisplayName("TC009: Kiểm tra email chưa tồn tại")
    void testCheckEmailExists_False() throws Exception {
        // Given
        when(authService.emailExists("new@example.com")).thenReturn(false);

        // When & Then
        mockMvc.perform(get("/api/auth/check-email")
                .param("email", "new@example.com")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(false));
    }

    @Test
    @DisplayName("TC010: Refresh token thành công")
    void testRefreshToken_Success() throws Exception {
        // Given
        when(authService.refreshToken("valid-refresh-token")).thenReturn(mockAuthResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/refresh")
                .param("refreshToken", "valid-refresh-token")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists());
    }

    @Test
    @DisplayName("TC011: Refresh token thất bại - Token không hợp lệ")
    void testRefreshToken_InvalidToken() throws Exception {
        // Given
        when(authService.refreshToken("invalid-token"))
                .thenThrow(new backend.exception.BadRequestException("Invalid refresh token"));

        // When & Then
        mockMvc.perform(post("/api/auth/refresh")
                .param("refreshToken", "invalid-token")
)
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC012: Logout thành công")
    void testLogout_Success() throws Exception {
        // Given
        // logout returns void, so we just verify it doesn't throw exception
        org.mockito.Mockito.doNothing().when(authService).logout("valid-jwt-token");

        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                .header("Authorization", "Bearer valid-jwt-token")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Logout successful"));
    }
}
