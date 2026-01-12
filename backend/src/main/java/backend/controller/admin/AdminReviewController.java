package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import backend.dto.response.ReviewResponse;
import backend.service.ExportService;
import backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Review Management", description = "Admin APIs for managing reviews")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController extends BaseController {
    
    private final ReviewService reviewService;
    private final ExportService exportService;
    
    @GetMapping
    @Operation(summary = "Get all reviews", description = "Get all reviews with pagination (Admin only)")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            Page<ReviewResponse> reviews = reviewService.getAllReviewsAdmin(pageable);
            return ResponseEntity.ok(success("Reviews retrieved successfully", reviews));
        } catch (Exception e) {
            log.error("Error getting reviews", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get reviews: " + e.getMessage()));
        }
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get reviews by status", description = "Get reviews filtered by status (Admin only)")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getReviewsByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            Page<ReviewResponse> reviews = reviewService.getReviewsByStatus(status, pageable);
            return ResponseEntity.ok(success("Reviews retrieved successfully", reviews));
        } catch (Exception e) {
            log.error("Error getting reviews by status: {}", status, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get reviews: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get review by ID", description = "Get review details by ID (Admin only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Long id) {
        try {
            ReviewResponse review = reviewService.getReviewById(id);
            return ResponseEntity.ok(success("Review retrieved successfully", review));
        } catch (Exception e) {
            log.error("Error getting review with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get review: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/approve")
    @Operation(summary = "Approve review", description = "Approve a pending review (Admin only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> approveReview(@PathVariable Long id) {
        try {
            ReviewResponse review = reviewService.approveReview(id);
            return ResponseEntity.ok(success("Review approved successfully", review));
        } catch (Exception e) {
            log.error("Error approving review with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to approve review: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/reject")
    @Operation(summary = "Reject review", description = "Reject a review (Admin only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> rejectReview(
            @PathVariable Long id,
            @RequestParam(required = false) String reason
    ) {
        try {
            ReviewResponse review = reviewService.rejectReview(id, reason);
            return ResponseEntity.ok(success("Review rejected successfully", review));
        } catch (Exception e) {
            log.error("Error rejecting review with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to reject review: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update review status", description = "Update review status to Pending, Approved, or Rejected (Admin only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReviewStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        try {
            log.info("Updating review {} status to: {}", id, status);
            ReviewResponse review = reviewService.updateReviewStatus(id, status);
            return ResponseEntity.ok(success("Review status updated successfully", review));
        } catch (Exception e) {
            log.error("Error updating review status for ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to update review status: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/reply")
    @Operation(summary = "Reply to review", description = "Admin reply to a review (Admin only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> replyToReview(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> request
    ) {
        try {
            String reply = request.get("reply");
            log.info("Admin replying to review {}: {}", id, reply);
            ReviewResponse review = reviewService.replyToReview(id, reply);
            return ResponseEntity.ok(success("Reply added successfully", review));
        } catch (Exception e) {
            log.error("Error replying to review ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to add reply: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}/reply")
    @Operation(summary = "Delete reply", description = "Delete admin reply from a review (Admin only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> deleteReply(@PathVariable Long id) {
        try {
            log.info("Admin deleting reply from review {}", id);
            ReviewResponse review = reviewService.deleteReply(id);
            return ResponseEntity.ok(success("Reply deleted successfully", review));
        } catch (Exception e) {
            log.error("Error deleting reply from review ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to delete reply: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete review", description = "Delete a review (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReviewAdmin(id);
            return ResponseEntity.ok(success("Review deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting review with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to delete review: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count")
    @Operation(summary = "Get total reviews count", description = "Get total number of reviews (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getTotalReviewsCount() {
        try {
            long count = reviewService.getTotalReviews();
            return ResponseEntity.ok(success("Total reviews count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting reviews count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get reviews count: " + e.getMessage()));
        }
    }
    
    @GetMapping("/count/pending")
    @Operation(summary = "Get pending reviews count", description = "Get number of pending reviews (Admin only)")
    public ResponseEntity<ApiResponse<Long>> getPendingReviewsCount() {
        try {
            long count = reviewService.getPendingReviewsCount();
            return ResponseEntity.ok(success("Pending reviews count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting pending reviews count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get pending reviews count: " + e.getMessage()));
        }
    }
    
    // ================================
    // ADVANCED FILTERING & EXPORT
    // ================================
    
    @GetMapping("/filtered")
    @Operation(summary = "Get reviews with advanced filters", description = "Get reviews with multiple filter options (Admin only)")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getFilteredReviews(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long tourId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Boolean isSuspicious,
            @RequestParam(required = false) Boolean isSpam,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;
            
            if (startDate != null && !startDate.trim().isEmpty()) {
                try {
                    startDateTime = LocalDateTime.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } catch (DateTimeParseException e) {
                    startDateTime = java.time.LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE)
                        .atStartOfDay();
                }
            }
            
            if (endDate != null && !endDate.trim().isEmpty()) {
                try {
                    endDateTime = LocalDateTime.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } catch (DateTimeParseException e) {
                    endDateTime = java.time.LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE)
                        .atTime(23, 59, 59);
                }
            }
            
            Page<ReviewResponse> reviews = reviewService.getReviewsWithFilters(
                status, tourId, rating, startDateTime, endDateTime, isSuspicious, isSpam, pageable
            );
            
            return ResponseEntity.ok(success("Filtered reviews retrieved successfully", reviews));
        } catch (Exception e) {
            log.error("Error getting filtered reviews", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get filtered reviews: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/mark-suspicious")
    @Operation(summary = "Mark/unmark review as suspicious", description = "Mark or unmark a review as suspicious (Admin only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> markAsSuspicious(
            @PathVariable Long id,
            @RequestParam boolean suspicious) {
        try {
            ReviewResponse review = reviewService.markAsSuspicious(id, suspicious);
            return ResponseEntity.ok(success("Review marked as suspicious: " + suspicious, review));
        } catch (Exception e) {
            log.error("Error marking review as suspicious", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to mark review: " + e.getMessage()));
        }
    }
    
    @PatchMapping("/{id}/mark-spam")
    @Operation(summary = "Mark/unmark review as spam", description = "Mark or unmark a review as spam (Admin only)")
    public ResponseEntity<ApiResponse<ReviewResponse>> markAsSpam(
            @PathVariable Long id,
            @RequestParam boolean spam) {
        try {
            ReviewResponse review = reviewService.markAsSpam(id, spam);
            return ResponseEntity.ok(success("Review marked as spam: " + spam, review));
        } catch (Exception e) {
            log.error("Error marking review as spam", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to mark review: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/analyze")
    @Operation(summary = "Analyze review with AI", description = "Analyze review for negative keywords and spam detection (Admin only)")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> analyzeReview(@PathVariable Long id) {
        try {
            java.util.Map<String, Object> analysis = reviewService.analyzeReviewWithAI(id);
            return ResponseEntity.ok(success("Review analyzed successfully", analysis));
        } catch (Exception e) {
            log.error("Error analyzing review", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to analyze review: " + e.getMessage()));
        }
    }
    
    @GetMapping("/export/{format}")
    @Operation(summary = "Export reviews", description = "Export reviews to CSV or Excel with filters (Admin only)")
    public ResponseEntity<byte[]> exportReviews(
            @PathVariable String format,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long tourId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Boolean isSuspicious,
            @RequestParam(required = false) Boolean isSpam) {
        try {
            LocalDateTime startDateTime = null;
            LocalDateTime endDateTime = null;
            
            if (startDate != null && !startDate.trim().isEmpty()) {
                try {
                    startDateTime = LocalDateTime.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } catch (DateTimeParseException e) {
                    startDateTime = java.time.LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE)
                        .atStartOfDay();
                }
            }
            
            if (endDate != null && !endDate.trim().isEmpty()) {
                try {
                    endDateTime = LocalDateTime.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                } catch (DateTimeParseException e) {
                    endDateTime = java.time.LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE)
                        .atTime(23, 59, 59);
                }
            }
            
            java.util.List<ReviewResponse> reviews = reviewService.getAllReviewsForExport(
                status, tourId, rating, startDateTime, endDateTime, isSuspicious, isSpam
            );
            
            byte[] data;
            String filename;
            String contentType;
            
            if ("excel".equalsIgnoreCase(format) || "xlsx".equalsIgnoreCase(format)) {
                data = exportService.exportReviewsToExcel(reviews);
                filename = "reviews_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else {
                data = exportService.exportReviewsToCsv(reviews);
                filename = "reviews_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
                contentType = "text/csv";
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", filename);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(data);
        } catch (Exception e) {
            log.error("Error exporting reviews", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

