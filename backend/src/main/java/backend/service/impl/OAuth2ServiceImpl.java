package backend.service.impl;

import backend.entity.Role;
import backend.entity.User;
import backend.repository.RoleRepository;
import backend.repository.UserRepository;
import backend.service.OAuth2Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OAuth2ServiceImpl implements OAuth2Service {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public User processGoogleOAuthLogin(String email, String name, String picture) {
        log.info("Processing Google OAuth login for email: {}", email);
        
        // Find existing user by email
        User user = userRepository.findByEmail(email).orElse(null);
        
        if (user != null) {
            // User exists - update info and verify email if not verified
            log.info("User found with email: {}, updating OAuth info", email);
            
            // Update name if different
            if (name != null && !name.equals(user.getName())) {
                user.setName(name);
            }
            
            // Update avatar if different
            if (picture != null && !picture.equals(user.getAvatarUrl())) {
                user.setAvatarUrl(picture);
            }
            
            // Auto verify email (Google already verified it)
            if (user.getEmailVerifiedAt() == null) {
                user.setEmailVerifiedAt(LocalDateTime.now());
                if (user.getStatus() == User.UserStatus.PENDING) {
                    user.setStatus(User.UserStatus.ACTIVE);
                }
                log.info("Email auto-verified for Google OAuth user: {}", email);
            }
            
            // Update last login
            user.incrementLoginCount();
            user.updateLastActivity();
            
            userRepository.save(user);
            return user;
        } else {
            // User doesn't exist - create new user
            log.info("Creating new user from Google OAuth: {}", email);
            return findOrCreateGoogleUser(email, name, picture);
        }
    }
    
    @Override
    public User findOrCreateGoogleUser(String email, String name, String picture) {
        // Check if user already exists
        User existingUser = userRepository.findByEmail(email).orElse(null);
        if (existingUser != null) {
            return processGoogleOAuthLogin(email, name, picture);
        }
        
        // Get default role (Customer)
        Role customerRole = roleRepository.findByName("Customer")
                .orElseThrow(() -> new RuntimeException("Default role 'Customer' not found"));
        
        // Create new user
        User newUser = new User();
        newUser.setName(name != null ? name : email.split("@")[0]); // Use email prefix if name is null
        newUser.setEmail(email);
        // Generate random password (won't be used for OAuth users)
        newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        newUser.setAvatarUrl(picture);
        newUser.setRole(customerRole);
        newUser.setStatus(User.UserStatus.ACTIVE); // Auto-activate for Google OAuth
        newUser.setEmailVerifiedAt(LocalDateTime.now()); // Auto-verify (Google already verified)
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(newUser);
        log.info("New user created from Google OAuth with ID: {}", savedUser.getId());
        
        return savedUser;
    }
}

