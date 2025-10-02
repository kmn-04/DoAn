package backend.controller;

import backend.dto.request.TourRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.TourResponse;
import backend.service.TourService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping("/api/admin/tours")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Tour Management", description = "Admin APIs for managing tours")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AdminTourController extends BaseController {
    
    private final TourService tourService;
    private final backend.mapper.TourMapper tourMapper;
    
    @PostMapping
    @Operation(summary = "Create new tour", description = "Create a new tour (Admin only)")
    public ResponseEntity<ApiResponse<TourResponse>> createTour(
            @Valid @RequestBody TourRequest request) {
        
        try {
            log.info("Admin creating tour: {}", request.getName());
            
            TourResponse tour = tourService.createTour(request);
            
            return ResponseEntity.ok(success("Tour created successfully", tour));
            
        } catch (Exception e) {
            log.error("Error creating tour", e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to create tour: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update tour", description = "Update an existing tour (Admin only)")
    public ResponseEntity<ApiResponse<TourResponse>> updateTour(
            @Parameter(description = "Tour ID") @PathVariable Long id,
            @Valid @RequestBody TourRequest request) {
        
        try {
            log.info("Admin updating tour ID: {}", id);
            
            TourResponse tour = tourService.updateTour(id, request);
            
            return ResponseEntity.ok(success("Tour updated successfully", tour));
            
        } catch (Exception e) {
            log.error("Error updating tour ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to update tour: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tour", description = "Delete a tour (Admin only)")
    public ResponseEntity<ApiResponse<String>> deleteTour(
            @Parameter(description = "Tour ID") @PathVariable Long id) {
        
        try {
            log.info("Admin deleting tour ID: {}", id);
            
            tourService.deleteTour(id);
            
            return ResponseEntity.ok(success("Tour deleted successfully", "Tour ID: " + id));
            
        } catch (Exception e) {
            log.error("Error deleting tour ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to delete tour: " + e.getMessage()));
        }
    }
    
    @GetMapping
    @Operation(summary = "Get all tours", description = "Get all tours with pagination (Admin only)")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<TourResponse>>> getAllTours(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("asc") 
                    ? Sort.by(sortBy).ascending() 
                    : Sort.by(sortBy).descending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            
            // Get Page<Tour> and convert to Page<TourResponse>
            Page<TourResponse> tours = tourService.getAllTours(pageable)
                    .map(tourMapper::toResponse);
            
            return ResponseEntity.ok(success("Tours retrieved successfully", tours));
            
        } catch (Exception e) {
            log.error("Error retrieving tours", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to retrieve tours: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update tour status", description = "Update tour status (Admin only)")
    public ResponseEntity<ApiResponse<TourResponse>> updateTourStatus(
            @Parameter(description = "Tour ID") @PathVariable Long id,
            @RequestParam String status) {
        
        try {
            log.info("Admin updating tour status ID: {}, status: {}", id, status);
            
            TourResponse tour = tourService.updateTourStatus(id, status);
            
            return ResponseEntity.ok(success("Tour status updated successfully", tour));
            
        } catch (Exception e) {
            log.error("Error updating tour status ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to update tour status: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/featured")
    @Operation(summary = "Toggle featured status", description = "Toggle tour featured status (Admin only)")
    public ResponseEntity<ApiResponse<TourResponse>> toggleFeatured(
            @Parameter(description = "Tour ID") @PathVariable Long id,
            @RequestParam boolean featured) {
        
        try {
            log.info("Admin toggling featured status ID: {}, featured: {}", id, featured);
            
            TourResponse tour = tourService.toggleFeaturedStatus(id, featured);
            
            return ResponseEntity.ok(success("Featured status updated successfully", tour));
            
        } catch (Exception e) {
            log.error("Error toggling featured status ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to update featured status: " + e.getMessage()));
        }
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get tour statistics", description = "Get tour statistics (Admin only)")
    public ResponseEntity<ApiResponse<Object>> getTourStatistics() {
        
        try {
            // This would be implemented in TourService
            // For now, return a placeholder
            
            return ResponseEntity.ok(success("Statistics retrieved successfully", null));
            
        } catch (Exception e) {
            log.error("Error retrieving tour statistics", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to retrieve statistics: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count")
    @Operation(summary = "Get total tours count", description = "Get total number of tours (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getTotalToursCount() {
        try {
            long count = tourService.getTotalTours();
            return ResponseEntity.ok(success("Total tours count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting tours count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get tours count: " + e.getMessage()));
        }
    }
}

