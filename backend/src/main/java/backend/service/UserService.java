package backend.service;

import backend.entity.User;
import backend.entity.User.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserService {
    
    /**
     * Create new user
     */
    User createUser(User user);
    
    /**
     * Update user information
     */
    User updateUser(Long userId, User user);
    
    /**
     * Get user by ID
     */
    Optional<User> getUserById(Long userId);
    
    /**
     * Get user by email
     */
    Optional<User> getUserByEmail(String email);
    
    /**
     * Get all users with pagination
     */
    Page<User> getAllUsers(Pageable pageable);
    
    /**
     * Search users by keyword
     */
    Page<User> searchUsers(String keyword, Pageable pageable);
    
    /**
     * Get users by role
     */
    List<User> getUsersByRole(String roleName);
    
    /**
     * Get users by status
     */
    List<User> getUsersByStatus(UserStatus status);
    
    /**
     * Activate user
     */
    User activateUser(Long userId);
    
    /**
     * Deactivate user
     */
    User deactivateUser(Long userId);
    
    /**
     * Soft delete user
     */
    void deleteUser(Long userId);
    
    /**
     * Change user password
     */
    void changePassword(Long userId, String oldPassword, String newPassword);
    
    /**
     * Verify user email
     */
    User verifyEmail(Long userId);
    
    /**
     * Check if email exists
     */
    boolean emailExists(String email);
    
    /**
     * Get user statistics
     */
    UserStatistics getUserStatistics();
    
    /**
     * Inner class for user statistics
     */
    class UserStatistics {
        private long totalUsers;
        private long activeUsers;
        private long inactiveUsers;
        private long verifiedUsers;
        private long newUsersThisMonth;
        
        // Constructor and getters
        public UserStatistics(long totalUsers, long activeUsers, long inactiveUsers, 
                            long verifiedUsers, long newUsersThisMonth) {
            this.totalUsers = totalUsers;
            this.activeUsers = activeUsers;
            this.inactiveUsers = inactiveUsers;
            this.verifiedUsers = verifiedUsers;
            this.newUsersThisMonth = newUsersThisMonth;
        }
        
        // Getters
        public long getTotalUsers() { return totalUsers; }
        public long getActiveUsers() { return activeUsers; }
        public long getInactiveUsers() { return inactiveUsers; }
        public long getVerifiedUsers() { return verifiedUsers; }
        public long getNewUsersThisMonth() { return newUsersThisMonth; }
    }
    
    /**
     * Get total users count
     */
    long getTotalUsers();
}
