package backend.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {
    
    @Size(min = 2, max = 150, message = "Name must be between 2 and 150 characters")
    private String name;
    
    // Allow empty/null phone (for optional field), but if provided must match pattern
    @Pattern(regexp = "^$|^[0-9\\s]{10,15}$", message = "Phone number must be 10-15 digits (spaces allowed) or empty")
    private String phone;
    
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;
    
    private LocalDate dateOfBirth;
    
    private String avatarUrl;
}
