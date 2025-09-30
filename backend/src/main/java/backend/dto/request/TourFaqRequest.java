package backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourFaqRequest {
    
    @NotNull(message = "Tour ID is required")
    private Long tourId;
    
    @NotBlank(message = "Question is required")
    @Size(max = 500, message = "Question must be less than 500 characters")
    private String question;
    
    @NotBlank(message = "Answer is required")
    @Size(max = 2000, message = "Answer must be less than 2000 characters")
    private String answer;
    
    @Min(value = 0, message = "Display order cannot be negative")
    private Integer displayOrder = 0;
}
