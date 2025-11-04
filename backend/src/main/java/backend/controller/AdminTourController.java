package backend.controller;

import backend.dto.request.TourRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.TourResponse;
import backend.entity.Notification;
import backend.entity.Tour;
import backend.mapper.TourMapper;
import backend.service.NotificationService;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tours")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Tour Management", description = "Admin APIs for managing tours")
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AdminTourController extends BaseController {
    
    private final TourService tourService;
    private final TourMapper tourMapper;
    private final NotificationService notificationService;
    private final backend.service.EmailService emailService;
    
    @PostMapping
    @Operation(summary = "Create new tour", description = "Create a new tour (Admin only)")
    public ResponseEntity<ApiResponse<TourResponse>> createTour(
            @Valid @RequestBody TourRequest request) {
        
        try {
            log.info("Admin creating tour: {}", request.getName());
            
            TourResponse tour = tourService.createTour(request);
            
            // Send notification to all users about new tour
            try {
                String title = "🎉 Tour mới ra mắt!";
                String message = String.format("Tour \"%s\" vừa được thêm vào hệ thống. Khám phá ngay!", tour.getName());
                String link = "/tours/" + tour.getSlug();
                
                notificationService.createNotificationForUsers(
                    title, 
                    message, 
                    Notification.NotificationType.INFO,
                    link
                );
                log.info("Sent notification to all users about new tour: {}", tour.getName());
            } catch (Exception notifError) {
                log.error("Failed to send notification for new tour", notifError);
                // Don't fail tour creation if notification fails
            }
            
            // 📧 Send email to all newsletter subscribers
            try {
                emailService.sendNewTourNotification(
                    tour.getId(),
                    tour.getName(),
                    tour.getSlug()
                );
                log.info("📧 Sent new tour email to newsletter subscribers: {}", tour.getName());
            } catch (Exception emailError) {
                log.error("Failed to send new tour email", emailError);
                // Don't fail tour creation if email fails
            }
            
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
    @Operation(summary = "Get all tours", description = "Get all tours with pagination and filters (Admin only)")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<TourResponse>>> getAllTours(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("asc") 
                    ? Sort.by(sortBy).ascending() 
                    : Sort.by(sortBy).descending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Tour> tours;
            
            // If no filters, get all tours with pagination
            if (search == null && status == null && featured == null && categoryId == null && minPrice == null && maxPrice == null) {
                tours = tourService.getAllTours(pageable);
            } else {
                // For filtering, fetch all tours then filter (not optimal but simple)
                Pageable allPageable = PageRequest.of(0, Integer.MAX_VALUE, sort);
                java.util.List<Tour> allTours = tourService.getAllTours(allPageable).getContent();
                
                // Filter in-memory
                java.util.List<Tour> filteredList = allTours.stream()
                    .filter(tour -> {
                        if (search != null && !search.isEmpty()) {
                            String searchLower = search.toLowerCase();
                            boolean matchName = tour.getName() != null && tour.getName().toLowerCase().contains(searchLower);
                            boolean matchLocation = tour.getDepartureLocation() != null && tour.getDepartureLocation().toLowerCase().contains(searchLower);
                            boolean matchDestination = tour.getDestination() != null && tour.getDestination().toLowerCase().contains(searchLower);
                            if (!matchName && !matchLocation && !matchDestination) return false;
                        }
                        if (status != null && !tour.getStatus().toString().equalsIgnoreCase(status)) return false;
                        if (featured != null && !tour.getIsFeatured().equals(featured)) return false;
                        if (categoryId != null && (tour.getCategory() == null || !tour.getCategory().getId().equals(categoryId))) return false;
                        if (minPrice != null && tour.getPrice().compareTo(minPrice) < 0) return false;
                        if (maxPrice != null && tour.getPrice().compareTo(maxPrice) > 0) return false;
                        return true;
                    })
                    .collect(java.util.stream.Collectors.toList());
                
                // Create page from filtered results
                int start = (int) pageable.getOffset();
                int end = Math.min((start + pageable.getPageSize()), filteredList.size());
                java.util.List<Tour> pageContent = start > filteredList.size() ? new java.util.ArrayList<>() : filteredList.subList(start, end);
                
                tours = new org.springframework.data.domain.PageImpl<>(pageContent, pageable, filteredList.size());
            }
            
            // Convert to TourResponse with details (includes itineraries and images)
            // Force load lazy collections to avoid LazyInitializationException
            Page<TourResponse> tourResponses = tours.map(tour -> {
                try {
                    // Force initialization of lazy collections
                    if (tour.getItineraries() != null) {
                        tour.getItineraries().size(); // Force load itineraries
                    }
                    if (tour.getImages() != null) {
                        tour.getImages().size(); // Force load images
                    }
                } catch (Exception e) {
                    log.warn("Could not load lazy collections for tour {}: {}", tour.getId(), e.getMessage());
                }
                return tourMapper.toResponse(tour); // Use toResponse (includes everything)
            });
            
            return ResponseEntity.ok(success("Tours retrieved successfully", tourResponses));
            
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
    
    @GetMapping("/count/active")
    @Operation(summary = "Get active tours count", description = "Get number of active tours (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getActiveToursCount() {
        try {
            long count = tourService.getAllActiveTours().size();
            return ResponseEntity.ok(success("Active tours count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting active tours count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get active tours count: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count/inactive")
    @Operation(summary = "Get inactive tours count", description = "Get number of inactive tours (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getInactiveToursCount() {
        try {
            long total = tourService.getTotalTours();
            long active = tourService.getAllActiveTours().size();
            long inactive = total - active;
            return ResponseEntity.ok(success("Inactive tours count retrieved successfully", inactive));
        } catch (Exception e) {
            log.error("Error getting inactive tours count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get inactive tours count: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count/featured")
    @Operation(summary = "Get featured tours count", description = "Get number of featured tours (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getFeaturedToursCount() {
        try {
            long count = tourService.getFeaturedTours().size();
            return ResponseEntity.ok(success("Featured tours count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting featured tours count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get featured tours count: " + e.getMessage()));
        }
    }
}

