package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.request.PartnerRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.PartnerResponse;
import backend.entity.Partner;
import backend.mapper.EntityMapper;
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
    private final EntityMapper mapper;
    
    @GetMapping
    @Operation(summary = "Get all partners", description = "Get all partners with pagination (Admin only)")
    public ResponseEntity<ApiResponse<Page<PartnerResponse>>> getAllPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction
    ) {
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            Page<Partner> partners = partnerService.getAllPartners(pageable);
            Page<PartnerResponse> response = partners.map(mapper::toPartnerResponse);
            
            return ResponseEntity.ok(success("Partners retrieved successfully", response));
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
}

