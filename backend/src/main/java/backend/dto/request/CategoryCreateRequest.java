package backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCreateRequest {
    
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 150, message = "Category name must be between 2 and 150 characters")
    private String name;
    
    @Size(max = 150, message = "Slug must not exceed 150 characters")
    private String slug;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    private String imageUrl;
}
