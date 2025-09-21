package backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreateRequest {
    
    @NotNull(message = "Tour ID is required")
    private Long tourId;
    
    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDate startDate;
    
    @NotNull(message = "Number of adults is required")
    @Min(value = 1, message = "Must have at least 1 adult")
    @Max(value = 50, message = "Cannot exceed 50 adults")
    private Integer numAdults;
    
    @Min(value = 0, message = "Number of children cannot be negative")
    @Max(value = 50, message = "Cannot exceed 50 children")
    private Integer numChildren = 0;
    
    @Size(max = 1000, message = "Special requests must not exceed 1000 characters")
    private String specialRequests;
    
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Contact phone must be 10-11 digits")
    private String contactPhone;
    
    private String promotionCode;
    
    // Custom validation
    public int getTotalPeople() {
        return (numAdults != null ? numAdults : 0) + (numChildren != null ? numChildren : 0);
    }
}
