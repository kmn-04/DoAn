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
    @Pattern(regexp = "^(Pending|Confirmed|Cancelled|Completed)$", 
            message = "Status must be Pending, Confirmed, Cancelled, or Completed")
    private String status;
    
    private String notes;
}

