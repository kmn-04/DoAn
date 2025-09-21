package backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private LocalDate startDate;
    private Integer numAdults;
    private Integer numChildren;
    private Integer totalPeople;
    private BigDecimal totalPrice;
    private String specialRequests;
    private String contactPhone;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private UserSummary user;
    private TourSummary tour;
    private PromotionResponse promotion;
    private List<PaymentResponse> payments;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String name;
        private String email;
        private String phone;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourSummary {
        private Long id;
        private String name;
        private String slug;
        private BigDecimal price;
        private Integer duration;
        private String categoryName;
        private String mainImage;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromotionResponse {
        private Long id;
        private String code;
        private String type;
        private BigDecimal value;
        private BigDecimal discountAmount;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentResponse {
        private Long id;
        private BigDecimal amount;
        private String paymentMethod;
        private String status;
        private String transactionId;
        private LocalDateTime createdAt;
    }
}
