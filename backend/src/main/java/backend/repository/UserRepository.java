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
     * Find users by role name
     */
    @Query("SELECT u FROM User u JOIN u.role r WHERE r.name = :roleName")
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
    long countByStatus(UserStatus status);
    
    /**
     * Find users with email verification
     */
    @Query("SELECT u FROM User u WHERE u.emailVerifiedAt IS NOT NULL AND u.deletedAt IS NULL")
    List<User> findVerifiedUsers();
}
