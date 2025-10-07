package backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionRequest {
    
    @NotBlank(message = "Promotion code is required")
    @Size(min = 3, max = 50, message = "Promotion code must be between 3 and 50 characters")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Promotion code must contain only uppercase letters, numbers, hyphens and underscores")
    private String code;
    
    @NotBlank(message = "Promotion name is required")
    @Size(max = 200, message = "Promotion name must not exceed 200 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
    
    @NotBlank(message = "Promotion type is required")
    @Pattern(regexp = "^(Percentage|Fixed)$", message = "Type must be either 'Percentage' or 'Fixed'")
    private String type;
    
    @NotNull(message = "Promotion value is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Value must be greater than 0")
    private BigDecimal value;
    
    @DecimalMin(value = "0.0", message = "Minimum order amount cannot be negative")
    private BigDecimal minOrderAmount;
    
    @DecimalMin(value = "0.0", message = "Maximum discount cannot be negative")
    private BigDecimal maxDiscount;
    
    @Min(value = 0, message = "Usage limit cannot be negative")
    private Integer usageLimit;
    
    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;
    
    @NotNull(message = "End date is required")
    private LocalDateTime endDate;
    
    @Pattern(regexp = "^(Active|Inactive|Expired)$", message = "Status must be either 'Active', 'Inactive', or 'Expired'")
    private String status;
}

