package backend.dto.response;

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
public class PromotionResponse {
    
    private Long id;
    private String code;
    private String name;
    private String description;
    private String type; // Percentage or Fixed
    private BigDecimal value;
    private Integer usageLimit;
    private Integer usageCount; // How many times this promotion has been used
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status; // Active, Inactive, Expired
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Computed fields
    private Boolean isValid; // Check if promotion is currently valid
    private Boolean isExpired; // Check if promotion has expired
    private Integer remainingUses; // Remaining uses if usage limit is set
}

