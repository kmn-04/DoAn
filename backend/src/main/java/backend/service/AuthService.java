package backend.service;

import backend.dto.request.LoginRequest;
import backend.dto.request.RegisterRequest;
import backend.dto.response.AuthResponse;
import backend.dto.response.UserResponse;

public interface AuthService {
    
    /**
     * Register new user account
     */
    AuthResponse register(RegisterRequest request);
    
    /**
     * Login with email and password
     */
    AuthResponse login(LoginRequest request);
    
    /**
     * Get current user information
     */
    UserResponse getCurrentUser(String email);
    
    /**
     * Refresh JWT token
     */
    AuthResponse refreshToken(String refreshToken);
    
    /**
     * Logout (invalidate token)
     */
    void logout(String token);
    
    /**
     * Check if email exists
     */
    boolean emailExists(String email);
}
