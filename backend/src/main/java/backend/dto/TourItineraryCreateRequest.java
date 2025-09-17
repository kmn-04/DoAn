package backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.List;

@Data
public class TourItineraryCreateRequest {
    @NotNull(message = "Số ngày không được để trống")
    @Min(value = 1, message = "Số ngày phải lớn hơn 0")
    private Integer dayNumber;
    
    @NotBlank(message = "Tiêu đề ngày không được để trống")
    private String title;
    
    private String description;
    private List<Long> partnerIds;
}
