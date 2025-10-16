package backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourScheduleRequest {
    
    @NotNull(message = "Tour ID is required")
    private Long tourId;
    
    @NotNull(message = "Departure date is required")
    @FutureOrPresent(message = "Departure date must be today or in the future")
    private LocalDate departureDate;
    
    @NotNull(message = "Return date is required")
    private LocalDate returnDate;
    
    @NotNull(message = "Available seats is required")
    @Min(value = 1, message = "Available seats must be at least 1")
    private Integer availableSeats;
    
    @NotNull(message = "Adult price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Adult price must be greater than 0")
    private BigDecimal adultPrice;
    
    @DecimalMin(value = "0.0", message = "Child price cannot be negative")
    private BigDecimal childPrice;
    
    @DecimalMin(value = "0.0", message = "Infant price cannot be negative")
    private BigDecimal infantPrice;
    
    private String status; // AVAILABLE, FULL, CONFIRMED, CANCELLED, COMPLETED
    
    @Size(max = 500, message = "Note must be less than 500 characters")
    private String note;
}
