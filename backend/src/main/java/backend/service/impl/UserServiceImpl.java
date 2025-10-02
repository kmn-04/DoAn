package backend.service.impl;

import backend.entity.Role;
import backend.entity.User;
import backend.entity.User.UserStatus;
import backend.repository.RoleRepository;
import backend.repository.UserRepository;
import backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public User createUser(User user) {
        log.info("Creating new user with email: {}", user.getEmail());
        
        // Check if email already exists
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists: " + user.getEmail());
        }
        
        // Encode password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        
        // Set default role if not set
        if (user.getRole() == null) {
            Role customerRole = roleRepository.findByName("Customer")
                    .orElseThrow(() -> new RuntimeException("Default role 'Customer' not found"));
            user.setRole(customerRole);
        }
        
        // Set default status
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.Active);
        }
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        return savedUser;
    }
    
    @Override
    public User updateUser(Long userId, User user) {
        log.info("Updating user with ID: {}", userId);
        
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        // Update fields
        if (user.getName() != null) {
            existingUser.setName(user.getName());
        }
        if (user.getPhone() != null) {
            existingUser.setPhone(user.getPhone());
        }
        if (user.getAddress() != null) {
            existingUser.setAddress(user.getAddress());
        }
        if (user.getDateOfBirth() != null) {
            existingUser.setDateOfBirth(user.getDateOfBirth());
        }
        if (user.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(user.getAvatarUrl());
        }
        
        User updatedUser = userRepository.save(existingUser);
        log.info("User updated successfully with ID: {}", updatedUser.getId());
        return updatedUser;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long userId) {
        return userRepository.findById(userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<User> searchUsers(String keyword, Pageable pageable) {
        return userRepository.searchActiveUsers(keyword, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(String roleName) {
        return userRepository.findByRoleName(roleName);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<User> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatus(status);
    }
    
    @Override
    public User activateUser(Long userId) {
        log.info("Activating user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        user.setStatus(UserStatus.Active);
        user.setDeletedAt(null); // Remove soft delete if present
        
        User activatedUser = userRepository.save(user);
        log.info("User activated successfully with ID: {}", activatedUser.getId());
        return activatedUser;
    }
    
    @Override
    public User deactivateUser(Long userId) {
        log.info("Deactivating user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        user.setStatus(UserStatus.Inactive);
        
        User deactivatedUser = userRepository.save(user);
        log.info("User deactivated successfully with ID: {}", deactivatedUser.getId());
        return deactivatedUser;
    }
    
    @Override
    public void deleteUser(Long userId) {
        log.info("Soft deleting user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        user.softDelete();
        userRepository.save(user);
        
        log.info("User soft deleted successfully with ID: {}", userId);
    }
    
    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        log.info("Changing password for user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }
        
        // Set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        log.info("Password changed successfully for user with ID: {}", userId);
    }
    
    @Override
    public User verifyEmail(Long userId) {
        log.info("Verifying email for user with ID: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        
        user.setEmailVerifiedAt(LocalDateTime.now());
        User verifiedUser = userRepository.save(user);
        
        log.info("Email verified successfully for user with ID: {}", userId);
        return verifiedUser;
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserStatistics getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.Active);
        long inactiveUsers = userRepository.countByStatus(UserStatus.Inactive);
        long verifiedUsers = userRepository.findVerifiedUsers().size();
        
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long newUsersThisMonth = userRepository.findByCreatedAtAfter(startOfMonth).size();
        
        return new UserStatistics(totalUsers, activeUsers, inactiveUsers, verifiedUsers, newUsersThisMonth);
    }
    
    @Override
    public long getTotalUsers() {
        return userRepository.count();
    }
}
