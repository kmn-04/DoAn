package backend.service;

import backend.dto.request.BookingModificationRequest;
import backend.dto.response.BookingModificationResponse;
import backend.entity.BookingModification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingModificationService {
    
    // Customer operations
    /**
     * Request a booking modification
     */
    BookingModificationResponse requestModification(Long userId, BookingModificationRequest request);
    
    /**
     * Get modification by ID for user
     */
    BookingModificationResponse getModificationByIdAndUser(Long modificationId, Long userId);
    
    /**
     * Get all modifications for a user
     */
    Page<BookingModificationResponse> getModificationsByUser(Long userId, Pageable pageable);
    
    /**
     * Cancel a pending modification request
     */
    BookingModificationResponse cancelModification(Long modificationId, Long userId);
    
    /**
     * Accept additional charges for modification
     */
    BookingModificationResponse acceptAdditionalCharges(Long modificationId, Long userId);
    
    // Admin operations
    /**
     * Get modification by ID (admin access)
     */
    BookingModificationResponse getModificationById(Long modificationId);
    
    /**
     * Get all modifications with pagination
     */
    Page<BookingModificationResponse> getAllModifications(Pageable pageable);
    
    /**
     * Get modifications by status
     */
    Page<BookingModificationResponse> getModificationsByStatus(BookingModification.Status status, Pageable pageable);
    
    /**
     * Get modifications by booking ID
     */
    List<BookingModificationResponse> getModificationsByBookingId(Long bookingId);
    
    /**
     * Get pending modifications requiring review
     */
    List<BookingModificationResponse> getPendingModifications();
    
    /**
     * Update modification status
     */
    BookingModificationResponse updateModificationStatus(Long modificationId, BookingModification.Status newStatus, String adminNotes, Long adminId);
    
    /**
     * Approve modification
     */
    BookingModificationResponse approveModification(Long modificationId, Long adminId);
    
    /**
     * Reject modification
     */
    BookingModificationResponse rejectModification(Long modificationId, String reason, Long adminId);
    
    /**
     * Process approved modification
     */
    BookingModificationResponse processModification(Long modificationId, Long adminId);
    
    /**
     * Complete modification
     */
    BookingModificationResponse completeModification(Long modificationId, Long adminId);
    
    /**
     * Update modification details
     */
    BookingModificationResponse updateModificationDetails(Long modificationId, BookingModificationRequest request, Long adminId);
    
    // Pricing operations
    /**
     * Calculate price difference for modification
     */
    BigDecimal calculatePriceDifference(Long bookingId, BookingModificationRequest request);
    
    /**
     * Calculate processing fee
     */
    BigDecimal calculateProcessingFee(Long bookingId, BookingModificationRequest request);
    
    /**
     * Get price quote for modification
     */
    BookingModificationResponse.PricingDetails getPriceQuote(Long bookingId, BookingModificationRequest request);
    
    // Validation operations
    /**
     * Validate modification request
     */
    ValidationResult validateModificationRequest(Long bookingId, BookingModificationRequest request);
    
    /**
     * Check if booking can be modified
     */
    boolean canBookingBeModified(Long bookingId);
    
    /**
     * Check availability for date changes
     */
    boolean checkAvailability(Long tourId, LocalDateTime newStartDate, Integer participants);
    
    // Statistics and reporting
    /**
     * Get modification statistics
     */
    ModificationStatistics getModificationStatistics();
    
    /**
     * Get modifications requiring processing
     */
    List<BookingModificationResponse> getModificationsRequiringProcessing();
    
    /**
     * Get recent modifications for user
     */
    List<BookingModificationResponse> getRecentModificationsByUser(Long userId, int days);
    
    // Helper classes
    class ValidationResult {
        private boolean valid;
        private String errorMessage;
        private List<String> warnings;
        
        public ValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }
        
        // Getters and setters
        public boolean isValid() { return valid; }
        public String getErrorMessage() { return errorMessage; }
        public List<String> getWarnings() { return warnings; }
        public void setWarnings(List<String> warnings) { this.warnings = warnings; }
    }
    
    class ModificationStatistics {
        private long totalModifications;
        private long completedModifications;
        private long rejectedModifications;
        private double averageProcessingHours;
        private long pendingModifications;
        
        // Constructors, getters and setters
        public ModificationStatistics(long total, long completed, long rejected, double avgHours) {
            this.totalModifications = total;
            this.completedModifications = completed;
            this.rejectedModifications = rejected;
            this.averageProcessingHours = avgHours;
        }
        
        public long getTotalModifications() { return totalModifications; }
        public long getCompletedModifications() { return completedModifications; }
        public long getRejectedModifications() { return rejectedModifications; }
        public double getAverageProcessingHours() { return averageProcessingHours; }
        public long getPendingModifications() { return pendingModifications; }
        public void setPendingModifications(long pending) { this.pendingModifications = pending; }
    }
}
