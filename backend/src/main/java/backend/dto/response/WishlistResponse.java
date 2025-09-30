package backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WishlistResponse {
    private Long id;
    private Long userId;
    private TourInfo tour;
    private LocalDateTime createdAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourInfo {
        private Long id;
        private String name;
        private String slug;
        private String mainImage;
        private BigDecimal price;
        private BigDecimal salePrice;
        private BigDecimal effectivePrice;
        private Integer duration;
        private String tourType;
        private String destination;
        private Boolean isFeatured;
    }
}
