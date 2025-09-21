package backend.service.impl;

import backend.dto.request.LoginRequest;
import backend.dto.request.RegisterRequest;
import backend.dto.response.AuthResponse;
import backend.dto.response.UserResponse;
import backend.entity.Role;
import backend.entity.User;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.repository.RoleRepository;
import backend.repository.UserRepository;
import backend.security.JwtUtils;
import backend.security.UserDetailsImpl;
import backend.service.AuthService;
import backend.util.EntityMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final EntityMapper mapper;
    
    @Override
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());
        
        // Validate password matching
        if (!request.isPasswordMatching()) {
            throw new BadRequestException("Password and confirm password do not match");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use: " + request.getEmail());
        }
        
        // Get default role (Customer)
        Role customerRole = roleRepository.findByName("Customer")
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", "Customer"));
        
        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setAddress(request.getAddress());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setRole(customerRole);
        user.setStatus(User.UserStatus.Active);
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String jwt = jwtUtils.generateTokenFromEmail(savedUser.getEmail());
        
        UserResponse userResponse = mapper.toUserResponse(savedUser);
        
        log.info("User registered successfully with ID: {}", savedUser.getId());
        return new AuthResponse(jwt, userResponse);
    }
    
    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("User login attempt with email: {}", request.getEmail());
        
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Generate JWT token
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        // Get user details
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getEmail()));
        
        UserResponse userResponse = mapper.toUserResponse(user);
        
        log.info("User logged in successfully: {}", request.getEmail());
        return new AuthResponse(jwt, userResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        return mapper.toUserResponse(user);
    }
    
    @Override
    public AuthResponse refreshToken(String refreshToken) {
        // TODO: Implement refresh token logic if needed
        // For now, we'll just validate the current token and generate a new one
        
        if (!jwtUtils.validateJwtToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }
        
        String email = jwtUtils.getEmailFromJwtToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        String newJwt = jwtUtils.generateTokenFromEmail(email);
        UserResponse userResponse = mapper.toUserResponse(user);
        
        return new AuthResponse(newJwt, userResponse);
    }
    
    @Override
    public void logout(String token) {
        // TODO: Implement token blacklisting if needed
        // For stateless JWT, logout is handled on the client side
        log.info("User logout - token invalidated on client side");
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
}
