package backend.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingUpdateRequest {
    
    @Size(max = 1000, message = "Special requests must not exceed 1000 characters")
    private String specialRequests;
    
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Contact phone must be 10-11 digits")
    private String contactPhone;
}
