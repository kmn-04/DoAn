package backend.dto.request;

import backend.entity.Category.CategoryStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryRequest {
    
    @NotBlank(message = "Category name is required")
    private String name;
    
    private String slug;
    
    private String description;
    
    private String imageUrl;
    
    private String icon;
    
    private Long parentId;
    
    private Integer displayOrder;
    
    private Boolean isFeatured;
    
    private CategoryStatus status;
}

