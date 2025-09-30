package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.PageResponse;
import backend.dto.response.PartnerResponse;
import backend.entity.Partner;
import backend.service.PartnerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/partners")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Partner Management", description = "APIs for managing partners")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class PartnerController extends BaseController {

    private final PartnerService partnerService;
    private final backend.mapper.EntityMapper mapper;


    @GetMapping("/test")
    @Operation(summary = "Test simple response")
    public ResponseEntity<ApiResponse<String>> testConnection() {
        return ResponseEntity.ok(ApiResponse.success("Test endpoint working"));
    }

    @GetMapping
    @Operation(summary = "Get all partners with pagination")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<PartnerResponse>>> getAllPartners(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        log.info("Getting partners: page={}, size={}, sortBy={}, sortDirection={}", page, size, sortBy, sortDirection);
        
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);
        Page<Partner> partners = partnerService.getAllPartners(pageable);
        
        // Convert to DTO directly within transaction
        Page<PartnerResponse> partnerResponses = partners.map(mapper::toPartnerResponse);
        
        return ResponseEntity.ok(successPage(partnerResponses));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get partner by ID")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PartnerResponse>> getPartnerById(
            @Parameter(description = "Partner ID") @PathVariable Long id) {
        
        Partner partner = partnerService.getPartnerById(id)
                .orElseThrow(() -> new backend.exception.ResourceNotFoundException("Partner", "id", id));
        
        // Convert to DTO directly within transaction
        PartnerResponse response = mapper.toPartnerResponse(partner);
        return ResponseEntity.ok(success("Partner retrieved successfully", response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search partners")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<PartnerResponse>>> searchPartners(
            @Parameter(description = "Search keyword") @RequestParam(required = false) String keyword,
            @Parameter(description = "Partner type") @RequestParam(required = false) String type,
            @Parameter(description = "Location") @RequestParam(required = false) String location,
            @Parameter(description = "Minimum rating") @RequestParam(required = false) Double minRating,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        try {
            Pageable pageable = createPageable(page, size, sortBy, sortDirection);
            
            Partner.PartnerType partnerType = null;
            if (type != null && !type.isEmpty()) {
                try {
                    partnerType = Partner.PartnerType.valueOf(type);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid partner type: {}", type);
                }
            }
            
            Page<Partner> partners = partnerService.searchPartners(keyword, partnerType, location, minRating, pageable);
            
            // Convert to DTO directly within transaction
            Page<PartnerResponse> partnerResponses = partners.map(mapper::toPartnerResponse);
            return ResponseEntity.ok(successPage(partnerResponses));
        } catch (Exception e) {
            log.error("Error searching partners", e);
            throw e;
        }
    }
}
