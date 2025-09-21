package backend.repository;

import backend.entity.Log;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<Log, Long> {
    
    /**
     * Find logs by user ID
     */
    List<Log> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * Find logs by action
     */
    List<Log> findByActionOrderByCreatedAtDesc(String action);
    
    /**
     * Find logs in date range
     */
    List<Log> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    /**
     * Find logs by user in date range
     */
    List<Log> findByUserIdAndCreatedAtBetween(Long userId, LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    /**
     * Search logs by action containing keyword
     */
    @Query("SELECT l FROM Log l WHERE LOWER(l.action) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY l.createdAt DESC")
    Page<Log> searchLogsByAction(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Find recent logs
     */
    @Query("SELECT l FROM Log l ORDER BY l.createdAt DESC")
    List<Log> findRecentLogs(Pageable pageable);
    
    /**
     * Find logs with user details
     */
    @Query("SELECT l FROM Log l JOIN FETCH l.user ORDER BY l.createdAt DESC")
    List<Log> findLogsWithUserDetails(Pageable pageable);
    
    /**
     * Count logs by action
     */
    long countByAction(String action);
    
    /**
     * Count logs by user
     */
    long countByUserId(Long userId);
    
    /**
     * Delete old logs (older than specified date)
     */
    void deleteByCreatedAtBefore(LocalDateTime cutoffDate);
    
    /**
     * Find most active users by log count
     */
    @Query("SELECT l.user, COUNT(l) FROM Log l GROUP BY l.user ORDER BY COUNT(l) DESC")
    List<Object[]> findMostActiveUsers(Pageable pageable);
}
