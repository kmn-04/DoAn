package backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    
    @NotNull(message = "Tour ID is required")
    private Long tourId;
    
    private Long scheduleId; // Optional if using startDate instead
    
    private LocalDate startDate; // Required if no scheduleId
    
    // Customer information
    @NotBlank(message = "Customer name is required")
    @Size(max = 100, message = "Customer name must be less than 100 characters")
    private String customerName;
    
    @NotBlank(message = "Customer email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must be less than 100 characters")
    private String customerEmail;
    
    @NotBlank(message = "Customer phone is required")
    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number must be 10-15 digits")
    private String customerPhone;
    
    @Size(max = 500, message = "Address must be less than 500 characters")
    private String customerAddress;
    
    // Number of participants
    @NotNull(message = "Number of adults is required")
    @Min(value = 1, message = "At least 1 adult is required")
    private Integer numAdults;
    
    @Min(value = 0, message = "Number of children cannot be negative")
    private Integer numChildren = 0;
    
    @Min(value = 0, message = "Number of infants cannot be negative")
    private Integer numInfants = 0;
    
    // Pricing
    @NotNull(message = "Total price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total price must be greater than 0")
    private BigDecimal totalPrice;
    
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @NotNull(message = "Final amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Final amount must be greater than 0")
    private BigDecimal finalAmount;
    
    // Optional
    private String specialRequests;
    
    private String contactPhone;
    
    private String promotionCode; // Promotion code if any
    
    // Participants details
    private List<ParticipantRequest> participants;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantRequest {
        @NotBlank(message = "Participant name is required")
        @Size(max = 100, message = "Name must be less than 100 characters")
        private String fullName;
        
        @NotNull(message = "Gender is required")
        private String gender; // Male, Female, Other
        
        private LocalDate dateOfBirth;
        
        @Size(max = 20, message = "Nationality must be less than 20 characters")
        private String nationality;
        
        @Size(max = 50, message = "Passport number must be less than 50 characters")
        private String passportNumber;
        
        private LocalDate passportExpiry;
        
        @NotNull(message = "Participant type is required")
        private String participantType; // Adult, Child, Infant
        
        @Size(max = 500, message = "Special requirements must be less than 500 characters")
        private String specialRequirements;
    }
}
