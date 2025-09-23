package backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingModificationRequest {
    
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Modification type is required")
    private ModificationType modificationType;
    
    // Date changes
    @Future(message = "New start date must be in the future")
    private LocalDate newStartDate;
    
    @Future(message = "New end date must be in the future")
    private LocalDate newEndDate;
    
    // Participant changes
    @Min(value = 1, message = "Number of participants must be at least 1")
    @Max(value = 20, message = "Number of participants cannot exceed 20")
    private Integer newParticipants;
    
    // Reason and notes
    @NotBlank(message = "Reason for modification is required")
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
    
    @Size(max = 1000, message = "Customer notes cannot exceed 1000 characters")
    private String customerNotes;
    
    // Additional options
    private Boolean acceptAdditionalCharges = false;
    private Boolean requestUrgentProcessing = false;
    
    public enum ModificationType {
        DATE_CHANGE,
        PARTICIPANT_CHANGE,
        DATE_AND_PARTICIPANT_CHANGE,
        UPGRADE_TOUR_PACKAGE,
        ACCOMMODATION_CHANGE,
        OTHER
    }
    
    // Validation method
    public boolean isValidDateRange() {
        if (newStartDate != null && newEndDate != null) {
            return !newEndDate.isBefore(newStartDate);
        }
        return true;
    }
    
    public boolean isDateModification() {
        return modificationType == ModificationType.DATE_CHANGE || 
               modificationType == ModificationType.DATE_AND_PARTICIPANT_CHANGE;
    }
    
    public boolean isParticipantModification() {
        return modificationType == ModificationType.PARTICIPANT_CHANGE || 
               modificationType == ModificationType.DATE_AND_PARTICIPANT_CHANGE;
    }
}
