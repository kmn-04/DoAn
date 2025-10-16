package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.request.PartnerRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.PartnerResponse;
import backend.entity.Partner;
import backend.mapper.EntityMapper;
import backend.repository.PartnerRepository;
import backend.service.PartnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/partners")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Partner Management", description = "Admin APIs for managing partners")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
public class AdminPartnerController extends BaseController {
    
    private final PartnerService partnerService;
    private final PartnerRepository partnerRepository;
    private final EntityMapper mapper;
    
    @GetMapping
    @Operation(summary = "Get all partners", description = "Get all partners with pagination and filters (Admin only)")
    public ResponseEntity<ApiResponse<Page<PartnerResponse>>> getAllPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type
    ) {
        try {
            // Fetch all partners
            java.util.List<Partner> partnersList = partnerRepository.findAll();
            
            // Apply filters
            java.util.stream.Stream<Partner> stream = partnersList.stream();
            
            if (search != null && !search.isEmpty()) {
                String searchLower = search.toLowerCase();
                stream = stream.filter(p -> 
                    p.getName().toLowerCase().contains(searchLower) ||
                    (p.getEmail() != null && p.getEmail().toLowerCase().contains(searchLower))
                );
            }
            
            if (status != null && !status.equalsIgnoreCase("all")) {
                stream = stream.filter(p -> 
                    p.getStatus() != null && p.getStatus().name().equalsIgnoreCase(status)
                );
            }
            
            if (type != null && !type.equalsIgnoreCase("all")) {
                stream = stream.filter(p -> 
                    p.getType() != null && p.getType().name().equalsIgnoreCase(type)
                );
            }
            
            java.util.List<Partner> filteredList = stream.collect(java.util.stream.Collectors.toList());
            
            // Apply sorting
            filteredList.sort((a, b) -> {
                int comparison = 0;
                switch (sortBy.toLowerCase()) {
                    case "id":
                        comparison = Long.compare(a.getId(), b.getId());
                        break;
                    case "name":
                        comparison = a.getName().compareToIgnoreCase(b.getName());
                        break;
                    case "email":
                        String emailA = a.getEmail() != null ? a.getEmail() : "";
                        String emailB = b.getEmail() != null ? b.getEmail() : "";
                        comparison = emailA.compareToIgnoreCase(emailB);
                        break;
                    default:
                        comparison = Long.compare(a.getId(), b.getId());
                }
                return direction.equalsIgnoreCase("desc") ? -comparison : comparison;
            });
            
            // Paginate
            Pageable pageable = PageRequest.of(page, size);
            int start = (int) pageable.getOffset();
            int end = Math.min(start + pageable.getPageSize(), filteredList.size());
            java.util.List<Partner> pageContent = start > filteredList.size() ? new java.util.ArrayList<>() : filteredList.subList(start, end);
            
            java.util.List<PartnerResponse> responses = pageContent.stream()
                .map(mapper::toPartnerResponse)
                .collect(java.util.stream.Collectors.toList());
            
            Page<PartnerResponse> pageResult = new org.springframework.data.domain.PageImpl<>(
                responses, pageable, filteredList.size()
            );
            
            return ResponseEntity.ok(success("Partners retrieved successfully", pageResult));
        } catch (Exception e) {
            log.error("Error getting partners", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get partners: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get partner by ID", description = "Get partner details by ID (Admin only)")
    public ResponseEntity<ApiResponse<PartnerResponse>> getPartnerById(@PathVariable Long id) {
        try {
            Partner partner = partnerService.getPartnerById(id)
                    .orElseThrow(() -> new RuntimeException("Partner not found with ID: " + id));
            
            PartnerResponse response = mapper.toPartnerResponse(partner);
            return ResponseEntity.ok(success("Partner retrieved successfully", response));
        } catch (Exception e) {
            log.error("Error getting partner with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get partner: " + e.getMessage()));
        }
    }
    
    @PostMapping
    @Operation(summary = "Create partner", description = "Create new partner (Admin only)")
    public ResponseEntity<ApiResponse<PartnerResponse>> createPartner(@Valid @RequestBody PartnerRequest request) {
        try {
            Partner partner = mapper.toPartner(request);
            Partner createdPartner = partnerService.createPartner(partner);
            
            PartnerResponse response = mapper.toPartnerResponse(createdPartner);
            return ResponseEntity.ok(success("Partner created successfully", response));
        } catch (Exception e) {
            log.error("Error creating partner", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to create partner: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update partner", description = "Update partner by ID (Admin only)")
    public ResponseEntity<ApiResponse<PartnerResponse>> updatePartner(
            @PathVariable Long id,
            @Valid @RequestBody PartnerRequest request
    ) {
        try {
            Partner partner = mapper.toPartner(request);
            Partner updatedPartner = partnerService.updatePartner(id, partner);
            
            PartnerResponse response = mapper.toPartnerResponse(updatedPartner);
            return ResponseEntity.ok(success("Partner updated successfully", response));
        } catch (Exception e) {
            log.error("Error updating partner with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to update partner: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete partner", description = "Delete partner by ID (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deletePartner(@PathVariable Long id) {
        try {
            partnerService.deletePartner(id);
            return ResponseEntity.ok(success("Partner deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting partner with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to delete partner: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Change partner status", description = "Change partner status (Admin only)")
    public ResponseEntity<ApiResponse<PartnerResponse>> changePartnerStatus(
            @PathVariable Long id,
            @RequestParam Partner.PartnerStatus status
    ) {
        try {
            Partner updatedPartner = partnerService.changePartnerStatus(id, status);
            PartnerResponse response = mapper.toPartnerResponse(updatedPartner);
            return ResponseEntity.ok(success("Partner status updated successfully", response));
        } catch (Exception e) {
            log.error("Error changing partner status for ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to change partner status: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count")
    @Operation(summary = "Get total partners count", description = "Get total number of partners (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getTotalPartnersCount() {
        try {
            long count = partnerService.getTotalPartners();
            return ResponseEntity.ok(success("Total partners count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting partners count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get partners count: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count/active")
    @Operation(summary = "Get active partners count")
    public ResponseEntity<ApiResponse<Long>> getActivePartnersCount() {
        try {
            long count = partnerRepository.findAll().stream()
                .filter(p -> p.getStatus() == Partner.PartnerStatus.ACTIVE)
                .count();
            return ResponseEntity.ok(success("Active partners count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting active partners count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get active partners count: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count/inactive")
    @Operation(summary = "Get inactive partners count")
    public ResponseEntity<ApiResponse<Long>> getInactivePartnersCount() {
        try {
            long count = partnerRepository.findAll().stream()
                .filter(p -> p.getStatus() == Partner.PartnerStatus.INACTIVE)
                .count();
            return ResponseEntity.ok(success("Inactive partners count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting inactive partners count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get inactive partners count: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count/suspended")
    @Operation(summary = "Get suspended partners count")
    public ResponseEntity<ApiResponse<Long>> getSuspendedPartnersCount() {
        try {
            long count = partnerRepository.findAll().stream()
                .filter(p -> p.getStatus() == Partner.PartnerStatus.SUSPENDED)
                .count();
            return ResponseEntity.ok(success("Suspended partners count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting suspended partners count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get suspended partners count: " + e.getMessage()));
        }
    }
}

