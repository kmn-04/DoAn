package backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TourItineraryDto {
    private Long id;
    private Integer dayNumber;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PartnerDto> partners;
}
