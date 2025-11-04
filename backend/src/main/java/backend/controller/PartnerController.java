package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.PartnerResponse;
import backend.entity.Partner;
import backend.mapper.EntityMapper;
import backend.repository.PartnerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/partners")
@Slf4j
@RequiredArgsConstructor
@Tag(name = "Partner Management (Public)", description = "Public APIs for partners")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class PartnerController {

    private final PartnerRepository partnerRepository;
    private final EntityMapper entityMapper;

    @GetMapping
    @Operation(summary = "Get all active partners")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<PartnerResponse>>> getAllPartners() {
        try {
            log.info("Fetching all active partners.");
            List<Partner> partners = partnerRepository.findByStatusOrderByNameAsc(Partner.PartnerStatus.ACTIVE);
            
            List<PartnerResponse> responses = partners.stream()
                    .map(partner -> {
                        // Force initialization of lazy-loaded collections
                        if (partner.getImages() != null) {
                            partner.getImages().size();
                        }
                        if (partner.getTourItineraries() != null) {
                            partner.getTourItineraries().size();
                            // Also initialize nested collections for statistics and tour details
                            partner.getTourItineraries().forEach(itinerary -> {
                                if (itinerary.getTour() != null) {
                                    if (itinerary.getTour().getBookings() != null) {
                                        itinerary.getTour().getBookings().size();
                                    }
                                    if (itinerary.getTour().getReviews() != null) {
                                        itinerary.getTour().getReviews().size();
                                    }
                                    if (itinerary.getTour().getImages() != null) {
                                        itinerary.getTour().getImages().size();
                                    }
                                    if (itinerary.getTour().getCategory() != null) {
                                        // Access category to initialize it
                                        itinerary.getTour().getCategory().getName();
                                    }
                                }
                            });
                        }
                        return entityMapper.toPartnerResponse(partner);
                    })
                    .collect(Collectors.toList());
            
            log.info("Found {} active partners.", responses.size());
            return ResponseEntity.ok(ApiResponse.success("Partners retrieved successfully", responses));
        } catch (Exception e) {
            log.error("Error fetching partners: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to retrieve partners"));
        }
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get partner by slug")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PartnerResponse>> getPartnerBySlug(
            @Parameter(description = "Partner slug") @PathVariable String slug) {
        try {
            log.info("Fetching partner with slug: {}", slug);
            
            // ✅ OPTIMIZED: Use fetch joins in 2 steps (Hibernate limitation with multiple collections)
            // Step 1: Load partner with images
            return partnerRepository.findBySlugWithImages(slug)
                    .map(partner -> {
                        // Step 2: Load tour itineraries and related tours separately
                        partnerRepository.findByIdWithTourItineraries(partner.getId()).ifPresent(partnerWithItineraries -> {
                            partner.setTourItineraries(partnerWithItineraries.getTourItineraries());
                        });
                        
                        PartnerResponse response = entityMapper.toPartnerResponse(partner);
                        log.info("Partner found: {}", partner.getName());
                        return ResponseEntity.ok(ApiResponse.success("Partner retrieved successfully", response));
                    })
                    .orElseGet(() -> {
                        log.warn("Partner with slug {} not found.", slug);
                        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ApiResponse.error("Partner not found"));
                    });
        } catch (Exception e) {
            log.error("Error fetching partner with slug {}: {}", slug, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to retrieve partner"));
        }
    }
}
