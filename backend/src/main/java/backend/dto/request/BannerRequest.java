package backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BannerRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String subtitle;
    
    @NotBlank(message = "Image URL is required")
    private String imageUrl;
    
    private String linkUrl;
    
    private String buttonText;
    
    @NotNull(message = "Display order is required")
    private Integer displayOrder;
    
    @NotNull(message = "Active status is required")
    private Boolean isActive;
    
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
}

