package backend.service;

import backend.entity.ContactRequest;
import backend.entity.ContactRequest.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface ContactRequestService {
    
    ContactRequest createContactRequest(ContactRequest contactRequest);
    
    Page<ContactRequest> getAllContactRequests(Pageable pageable);
    
    Page<ContactRequest> getContactRequestsByStatus(ContactStatus status, Pageable pageable);
    
    Optional<ContactRequest> getContactRequestById(Long id);
    
    ContactRequest updateContactStatus(Long id, ContactStatus status);
    
    ContactRequest assignToStaff(Long id, Long staffId);
    
    ContactRequest addAdminNote(Long id, String note);
    
    void deleteContactRequest(Long id);
    
    long getTotalContactRequests();
    
    long getNewContactRequestsCount();
}

