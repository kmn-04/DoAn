package backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TourScheduleResponse {
    private Long id;
    private Long tourId;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private Integer availableSeats;
    private Integer bookedSeats;
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
    private BigDecimal infantPrice;
    private String status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Optional tour info
    private TourInfo tour;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourInfo {
        private Long id;
        private String name;
        private String slug;
        private Integer duration;
    }
}
