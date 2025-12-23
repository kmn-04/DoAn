package backend.repository;

import backend.entity.User;
import backend.entity.User.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * Find user by email
     */
    Optional<User> findByEmail(String email);
    
    /**
     * Check if email exists
     */
    boolean existsByEmail(String email);
    
    /**
     * Check if email exists among non-deleted users
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    boolean existsByEmailAndNotDeleted(@Param("email") String email);
    
    /**
     * Find users by role ID
     */
    List<User> findByRoleId(Long roleId);
    
    /**
     * Find users by status
     */
    List<User> findByStatus(UserStatus status);
    
    /**
     * Find active users only (not deleted)
     */
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    List<User> findActiveUsers();
    
    /**
     * Find active users with pagination (not deleted)
     */
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    Page<User> findByDeletedAtIsNull(Pageable pageable);
    
    /**
     * Find users by role name (only active users)
     */
    @Query("SELECT u FROM User u JOIN u.role r WHERE r.name = :roleName AND u.deletedAt IS NULL")
    List<User> findByRoleName(@Param("roleName") String roleName);
    
    /**
     * Search users by name or email (case insensitive)
     */
    @Query("SELECT u FROM User u WHERE " +
           "(LOWER(u.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "u.deletedAt IS NULL")
    Page<User> searchActiveUsers(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Find users created after specific date
     */
    List<User> findByCreatedAtAfter(LocalDateTime date);
    
    /**
     * Find users by phone number
     */
    Optional<User> findByPhone(String phone);
    
    /**
     * Count users by status
     */
    Long countByStatus(UserStatus status);
    
    /**
     * Count non-deleted users by status
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status AND u.deletedAt IS NULL")
    Long countByStatusAndNotDeleted(@Param("status") UserStatus status);
    
    /**
     * Count total non-deleted users
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.deletedAt IS NULL")
    Long countByDeletedAtIsNull();
    
    /**
     * Count banned users (not deleted)
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = 'Banned' AND u.deletedAt IS NULL")
    Long countBannedUsers();
    
    /**
     * Find verified users
     */
    @Query("SELECT u FROM User u WHERE u.emailVerifiedAt IS NOT NULL AND u.deletedAt IS NULL")
    List<User> findVerifiedUsers();
    
    /**
     * Find online users (active within last N minutes)
     * Users are considered online if their lastActivityAt is within the specified minutes
     */
    @Query("SELECT u FROM User u WHERE u.lastActivityAt IS NOT NULL " +
           "AND u.lastActivityAt >= :sinceTime " +
           "AND u.deletedAt IS NULL " +
           "AND u.status = 'ACTIVE' " +
           "ORDER BY u.lastActivityAt DESC")
    List<User> findOnlineUsers(@Param("sinceTime") LocalDateTime sinceTime);
    
    /**
     * Find users with recent activity, sorted by lastActivityAt DESC
     * Returns users who have lastActivityAt set, excluding deleted users
     */
    @Query("SELECT u FROM User u WHERE u.lastActivityAt IS NOT NULL " +
           "AND u.deletedAt IS NULL " +
           "ORDER BY u.lastActivityAt DESC")
    List<User> findRecentActiveUsers(Pageable pageable);
}
