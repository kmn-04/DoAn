package backend.repository;

import backend.entity.ContactRequest;
import backend.entity.ContactRequest.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, Long> {
    
    /**
     * Find contact requests by status
     */
    List<ContactRequest> findByStatusOrderByCreatedAtDesc(ContactStatus status);
    
    /**
     * Find contact requests by email
     */
    List<ContactRequest> findByEmailOrderByCreatedAtDesc(String email);
    
    /**
     * Find contact requests in date range
     */
    List<ContactRequest> findByCreatedAtBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);
    
    /**
     * Search contact requests by name or email
     */
    @Query("SELECT cr FROM ContactRequest cr WHERE " +
           "LOWER(cr.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(cr.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<ContactRequest> searchContactRequests(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Count contact requests by status
     */
    long countByStatus(ContactStatus status);
    
    /**
     * Find recent contact requests
     */
    @Query("SELECT cr FROM ContactRequest cr ORDER BY cr.createdAt DESC")
    List<ContactRequest> findRecentContactRequests(Pageable pageable);
    
    /**
     * Find unresolved contact requests
     */
    @Query("SELECT cr FROM ContactRequest cr WHERE cr.status IN ('New', 'InProgress') ORDER BY cr.createdAt ASC")
    List<ContactRequest> findUnresolvedRequests();
}
