package backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourSearchRequest {
    
    private String keyword;
    
    private Long categoryId;
    
    @DecimalMin(value = "0.0", message = "Min price must be non-negative")
    private BigDecimal minPrice;
    
    @DecimalMin(value = "0.0", message = "Max price must be non-negative")
    private BigDecimal maxPrice;
    
    @Min(value = 1, message = "Min duration must be at least 1")
    private Integer minDuration;
    
    @Max(value = 365, message = "Max duration must not exceed 365")
    private Integer maxDuration;
    
    private List<String> targetAudiences;
    
    private Boolean isFeatured;
    
    private String sortBy = "createdAt"; // createdAt, price, rating, name
    
    private String sortDirection = "desc"; // asc, desc
    
    @Min(value = 0, message = "Page must be non-negative")
    private Integer page = 0;
    
    @Min(value = 1, message = "Size must be at least 1")
    @Max(value = 100, message = "Size must not exceed 100")
    private Integer size = 20;
}
