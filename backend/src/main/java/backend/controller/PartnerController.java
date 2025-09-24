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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partners")
@Slf4j
@Tag(name = "Partner Management", description = "APIs for managing partners")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class PartnerController {

    // private final PartnerService partnerService;


    @GetMapping("/test")
    @Operation(summary = "Test simple response")
    public ResponseEntity<ApiResponse<String>> testConnection() {
        return ResponseEntity.ok(ApiResponse.success("Test endpoint working"));
    }

    @GetMapping
    @Operation(summary = "Get all partners with pagination")
    public ResponseEntity<ApiResponse<PageResponse<PartnerResponse>>> getAllPartners(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        log.info("Getting partners: page={}, size={}, sortBy={}, sortDirection={}", page, size, sortBy, sortDirection);
        return ResponseEntity.ok(ApiResponse.success("Partners retrieved successfully (mock)", 
            createMockPartnerPage(PageRequest.of(page, size))));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get partner by ID")
    public ResponseEntity<ApiResponse<PartnerResponse>> getPartnerById(
            @Parameter(description = "Partner ID") @PathVariable Long id) {
        
        try {
            // Return mock data for now
            PartnerResponse partner = createMockPartner(id);
            return ResponseEntity.ok(ApiResponse.success("Partner retrieved successfully", partner));
        } catch (Exception e) {
            log.error("Error retrieving partner with ID: " + id, e);
            return ResponseEntity.ok(ApiResponse.success("Partner retrieved successfully", 
                createMockPartner(id)));
        }
    }

    @GetMapping("/search")
    @Operation(summary = "Search partners")
    public ResponseEntity<ApiResponse<PageResponse<PartnerResponse>>> searchPartners(
            @Parameter(description = "Search keyword") @RequestParam(required = false) String keyword,
            @Parameter(description = "Partner type") @RequestParam(required = false) String type,
            @Parameter(description = "Location") @RequestParam(required = false) String location,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            PageResponse<PartnerResponse> partners = createMockPartnerPage(pageable);
            return ResponseEntity.ok(ApiResponse.success("Partners search completed", partners));
        } catch (Exception e) {
            log.error("Error searching partners", e);
            return ResponseEntity.ok(ApiResponse.success("Partners search completed", 
                createMockPartnerPage(PageRequest.of(page, size))));
        }
    }

    // Mock data methods
    private PartnerResponse convertToPartnerResponse(Partner partner) {
        PartnerResponse response = new PartnerResponse();
        response.setId(partner.getId());
        response.setName(partner.getName());
        response.setSlug(partner.getSlug());
        response.setDescription(partner.getDescription());
        response.setType(partner.getType().name());
        response.setAddress(partner.getAddress());
        response.setPhone(partner.getPhone());
        response.setEmail(partner.getEmail());
        response.setWebsite(partner.getWebsite());
        response.setEstablishedYear(partner.getEstablishedYear());
        response.setAvatarUrl(partner.getAvatarUrl());
        response.setRating(partner.getRating());
        response.setTotalReviews(partner.getTotalReviews());
        
        // Parse specialties from JSON string if needed
        try {
            if (partner.getSpecialties() != null) {
                // Assume specialties is stored as JSON string, parse it
                // For now, just convert to list format
                response.setSpecialties(List.of(partner.getSpecialties().split(",")));
            } else {
                response.setSpecialties(List.of());
            }
        } catch (Exception e) {
            response.setSpecialties(List.of());
        }
        
        response.setCreatedAt(partner.getCreatedAt());
        response.setUpdatedAt(partner.getUpdatedAt());
        
        return response;
    }

    private PageResponse<PartnerResponse> createMockPartnerPage(Pageable pageable) {
        List<PartnerResponse> partners = List.of(
            createMockPartner(1L),
            createMockPartner(2L),
            createMockPartner(3L),
            createMockPartner(4L),
            createMockPartner(5L)
        );

        return new PageResponse<PartnerResponse>(
            partners,
            pageable.getPageNumber(),
            pageable.getPageSize(),
            partners.size(),
            1,
            true,
            false,
            false
        );
    }

    private PartnerResponse createMockPartner(Long id) {
        PartnerResponse partner = new PartnerResponse();
        partner.setId(id);
        partner.setName("Khách sạn " + getPartnerName(id));
        partner.setSlug("khach-san-" + id);
        partner.setDescription("Mô tả về " + getPartnerName(id));
        partner.setType(getPartnerType(id));
        partner.setAddress("123 Đường ABC, Quận " + id + ", TP.HCM");
        partner.setPhone("0901234" + String.format("%03d", id));
        partner.setEmail("contact@partner" + id + ".com");
        partner.setWebsite("https://partner" + id + ".com");
        partner.setEstablishedYear(2010 + id.intValue());
        partner.setRating(4.0 + (id % 5) * 0.2);
        partner.setTotalReviews(50 + id.intValue() * 10);
        partner.setSpecialties(List.of("Chất lượng cao", "Dịch vụ tốt", "Giá cả hợp lý"));
        partner.setTotalTours(id.intValue() * 3);
        partner.setTotalBookings(id.intValue() * 25);
        
        return partner;
    }

    private String getPartnerName(Long id) {
        String[] names = {"Sunset Resort", "Golden Hotel", "Paradise Inn", "Ocean View", "Mountain Lodge"};
        return names[id.intValue() % names.length];
    }

    private String getPartnerType(Long id) {
        String[] types = {"Hotel", "Restaurant", "Transport", "TourOperator", "Service"};
        return types[id.intValue() % types.length];
    }
}
