package backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusUpdateRequest {
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(PENDING|CONFIRMED|CANCELLED|COMPLETED)$", 
            message = "Status must be PENDING, CONFIRMED, CANCELLED, or COMPLETED")
    private String status;
    
    private String notes;
}

