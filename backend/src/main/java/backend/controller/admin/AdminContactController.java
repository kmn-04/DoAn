package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import backend.dto.response.ContactRequestResponse;
import backend.entity.ContactRequest;
import backend.entity.ContactRequest.ContactStatus;
import backend.service.ContactRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/contacts")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Contact Management", description = "Admin APIs for managing contact requests")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminContactController extends BaseController {
    
    private final ContactRequestService contactRequestService;
    
    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "Get all contact requests", description = "Get all contact requests with pagination (Admin only)")
    public ResponseEntity<ApiResponse<Page<ContactRequestResponse>>> getAllContactRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            Page<ContactRequest> contacts = contactRequestService.getAllContactRequests(pageable);
            
            // Force initialize lazy-loaded User objects
            Page<ContactRequestResponse> response = contacts.map(contact -> {
                if (contact.getAssignedTo() != null) {
                    contact.getAssignedTo().getName(); // Force init
                }
                return toResponse(contact);
            });
            
            return ResponseEntity.ok(success("Contact requests retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting contact requests", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get contact requests: " + e.getMessage()));
        }
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get contact requests by status", description = "Get contact requests filtered by status (Admin only)")
    public ResponseEntity<ApiResponse<Page<ContactRequestResponse>>> getContactRequestsByStatus(
            @PathVariable ContactStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            
            Page<ContactRequest> contacts = contactRequestService.getContactRequestsByStatus(status, pageable);
            Page<ContactRequestResponse> response = contacts.map(this::toResponse);
            
            return ResponseEntity.ok(success("Contact requests retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting contact requests by status: {}", status, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get contact requests: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    @Operation(summary = "Get contact request by ID", description = "Get contact request details by ID (Admin only)")
    public ResponseEntity<ApiResponse<ContactRequestResponse>> getContactRequestById(@PathVariable Long id) {
        try {
            ContactRequest contact = contactRequestService.getContactRequestById(id)
                    .orElseThrow(() -> new RuntimeException("Contact request not found with ID: " + id));
            
            // Force initialize lazy-loaded User
            if (contact.getAssignedTo() != null) {
                contact.getAssignedTo().getName();
            }
            
            ContactRequestResponse response = toResponse(contact);
            return ResponseEntity.ok(success("Contact request retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting contact request with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get contact request: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update contact status", description = "Update contact request status (Admin only)")
    public ResponseEntity<ApiResponse<ContactRequestResponse>> updateContactStatus(
            @PathVariable Long id,
            @RequestParam ContactStatus status
    ) {
        try {
            ContactRequest contact = contactRequestService.updateContactStatus(id, status);
            ContactRequestResponse response = toResponse(contact);
            return ResponseEntity.ok(success("Contact status updated successfully", response));
        } catch (Exception e) {
            log.error("Error updating contact status for ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to update contact status: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/assign")
    @Operation(summary = "Assign to staff", description = "Assign contact request to staff (Admin only)")
    public ResponseEntity<ApiResponse<ContactRequestResponse>> assignToStaff(
            @PathVariable Long id,
            @RequestParam Long staffId
    ) {
        try {
            ContactRequest contact = contactRequestService.assignToStaff(id, staffId);
            ContactRequestResponse response = toResponse(contact);
            return ResponseEntity.ok(success("Contact assigned to staff successfully", response));
        } catch (Exception e) {
            log.error("Error assigning contact to staff: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to assign contact: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/note")
    @Operation(summary = "Add admin note", description = "Add admin note to contact request (Admin only)")
    public ResponseEntity<ApiResponse<ContactRequestResponse>> addAdminNote(
            @PathVariable Long id,
            @RequestParam String note
    ) {
        try {
            ContactRequest contact = contactRequestService.addAdminNote(id, note);
            ContactRequestResponse response = toResponse(contact);
            return ResponseEntity.ok(success("Admin note added successfully", response));
        } catch (Exception e) {
            log.error("Error adding admin note for contact: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to add admin note: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete contact request", description = "Delete contact request by ID (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteContactRequest(@PathVariable Long id) {
        try {
            contactRequestService.deleteContactRequest(id);
            return ResponseEntity.ok(success("Contact request deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting contact request with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to delete contact request: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count")
    @Operation(summary = "Get total contact requests count", description = "Get total number of contact requests (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getTotalContactRequestsCount() {
        try {
            long count = contactRequestService.getTotalContactRequests();
            return ResponseEntity.ok(success("Total contact requests count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting contact requests count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get contact requests count: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count/new")
    @Operation(summary = "Get new contact requests count", description = "Get number of new contact requests (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getNewContactRequestsCount() {
        try {
            long count = contactRequestService.getNewContactRequestsCount();
            return ResponseEntity.ok(success("New contact requests count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting new contact requests count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get new contact requests count: " + e.getMessage()));
        }
    }
    
    private ContactRequestResponse toResponse(ContactRequest contact) {
        ContactRequestResponse response = new ContactRequestResponse();
        response.setId(contact.getId());
        response.setName(contact.getName());
        response.setEmail(contact.getEmail());
        response.setPhone(contact.getPhone());
        response.setSubject(contact.getSubject());
        response.setMessage(contact.getMessage());
        response.setTourInterest(contact.getTourInterest());
        response.setStatus(contact.getStatus().name());
        response.setAssignedToId(contact.getAssignedTo() != null ? contact.getAssignedTo().getId() : null);
        response.setAssignedToName(contact.getAssignedTo() != null ? contact.getAssignedTo().getName() : null);
        response.setAdminNote(contact.getAdminNote());
        response.setCreatedAt(contact.getCreatedAt());
        response.setUpdatedAt(contact.getUpdatedAt());
        return response;
    }
}

