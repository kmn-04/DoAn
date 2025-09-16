package backend.repository;

import backend.model.Role;
import backend.model.User;
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
    
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByPhone(String phone);
    
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    Boolean existsByUsername(String username);
    
    Boolean existsByEmail(String email);
    
    List<User> findByRole(Role role);
    
    List<User> findByIsActive(Boolean isActive);
    
    List<User> findByRoleAndIsActive(Role role, Boolean isActive);
    
    // Pageable versions
    Page<User> findByRole(Role role, Pageable pageable);
    
    Page<User> findByIsActive(Boolean isActive, Pageable pageable);
    
    Page<User> findByRoleAndIsActive(Role role, Boolean isActive, Pageable pageable);
    
    // Search queries with pagination
    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String fullName, String email, Pageable pageable);
    
    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseAndRole(
        String fullName, String email, Role role, Pageable pageable);
    
    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseAndIsActive(
        String fullName, String email, Boolean isActive, Pageable pageable);
    
    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseAndRoleAndIsActive(
        String fullName, String email, Role role, Boolean isActive, Pageable pageable);
    
    // Social login queries
    Optional<User> findByGoogleId(String googleId);
    
    Optional<User> findByFacebookId(String facebookId);
    
    Boolean existsByGoogleId(String googleId);
    
    Boolean existsByFacebookId(String facebookId);
    
    // Custom query with all filters including date range
    @Query("SELECT u FROM User u WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:isActive IS NULL OR u.isActive = :isActive) AND " +
           "(:fromDate IS NULL OR u.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR u.createdAt <= :toDate)")
    Page<User> findUsersWithFilters(
        @Param("search") String search,
        @Param("role") Role role,
        @Param("isActive") Boolean isActive,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        Pageable pageable);
    
    // Count methods for statistics
    long countByIsActive(Boolean isActive);
    
    long countByRole(Role role);
    
    long countByEmailVerified(Boolean emailVerified);
    
    long countByRoleAndIsActive(Role role, Boolean isActive);
}
