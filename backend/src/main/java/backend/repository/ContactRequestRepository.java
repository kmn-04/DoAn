package backend.repository;

import backend.entity.ContactRequest;
import backend.entity.ContactRequest.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRequestRepository extends JpaRepository<ContactRequest, Long> {
    
    Page<ContactRequest> findByStatusOrderByCreatedAtDesc(ContactStatus status, Pageable pageable);
    
    Page<ContactRequest> findByAssignedToIdOrderByCreatedAtDesc(Long staffId, Pageable pageable);
    
    long countByStatus(ContactStatus status);
    
    List<ContactRequest> findTop10ByOrderByCreatedAtDesc();
}
