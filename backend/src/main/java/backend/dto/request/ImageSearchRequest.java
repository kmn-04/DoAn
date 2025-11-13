package backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request for image-based tour search
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageSearchRequest {
    
    /**
     * Base64 encoded image data
     */
    @NotBlank(message = "Image data is required")
    private String imageData;
    
    /**
     * Maximum number of results to return
     */
    private Integer limit;
}

