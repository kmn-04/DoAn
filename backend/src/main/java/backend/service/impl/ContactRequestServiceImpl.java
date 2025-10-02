package backend.service.impl;

import backend.entity.ContactRequest;
import backend.entity.ContactRequest.ContactStatus;
import backend.entity.User;
import backend.repository.ContactRequestRepository;
import backend.repository.UserRepository;
import backend.service.ContactRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ContactRequestServiceImpl implements ContactRequestService {
    
    private final ContactRequestRepository contactRequestRepository;
    private final UserRepository userRepository;
    
    @Override
    public ContactRequest createContactRequest(ContactRequest contactRequest) {
        log.info("Creating new contact request from: {}", contactRequest.getEmail());
        return contactRequestRepository.save(contactRequest);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ContactRequest> getAllContactRequests(Pageable pageable) {
        return contactRequestRepository.findAll(pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ContactRequest> getContactRequestsByStatus(ContactStatus status, Pageable pageable) {
        return contactRequestRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<ContactRequest> getContactRequestById(Long id) {
        return contactRequestRepository.findById(id);
    }
    
    @Override
    public ContactRequest updateContactStatus(Long id, ContactStatus status) {
        log.info("Updating contact request {} status to: {}", id, status);
        
        ContactRequest contactRequest = contactRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact request not found with ID: " + id));
        
        contactRequest.setStatus(status);
        return contactRequestRepository.save(contactRequest);
    }
    
    @Override
    public ContactRequest assignToStaff(Long id, Long staffId) {
        log.info("Assigning contact request {} to staff: {}", id, staffId);
        
        ContactRequest contactRequest = contactRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact request not found with ID: " + id));
        
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found with ID: " + staffId));
        
        contactRequest.setAssignedTo(staff);
        contactRequest.setStatus(ContactStatus.In_Progress);
        
        return contactRequestRepository.save(contactRequest);
    }
    
    @Override
    public ContactRequest addAdminNote(Long id, String note) {
        log.info("Adding admin note to contact request: {}", id);
        
        ContactRequest contactRequest = contactRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact request not found with ID: " + id));
        
        contactRequest.setAdminNote(note);
        return contactRequestRepository.save(contactRequest);
    }
    
    @Override
    public void deleteContactRequest(Long id) {
        log.info("Deleting contact request: {}", id);
        contactRequestRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getTotalContactRequests() {
        return contactRequestRepository.count();
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getNewContactRequestsCount() {
        return contactRequestRepository.countByStatus(ContactStatus.New);
    }
}

