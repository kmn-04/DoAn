package backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourUpdateRequest {
    
    @Size(min = 5, max = 150, message = "Tour name must be between 5 and 150 characters")
    private String name;
    
    @Size(max = 500, message = "Short description must not exceed 500 characters")
    private String shortDescription;
    
    @Size(min = 50, message = "Description must be at least 50 characters")
    private String description;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Price format is invalid")
    private BigDecimal price;
    
    @DecimalMin(value = "0.0", inclusive = false, message = "Sale price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Sale price format is invalid")
    private BigDecimal salePrice;
    
    @Min(value = 1, message = "Duration must be at least 1 day")
    @Max(value = 365, message = "Duration must not exceed 365 days")
    private Integer duration;
    
    @Min(value = 1, message = "Max people must be at least 1")
    @Max(value = 1000, message = "Max people must not exceed 1000")
    private Integer maxPeople;
    
    private Long categoryId;
    
    private Boolean isFeatured;
}
