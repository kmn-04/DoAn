package backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private String icon;
    private Long parentId;
    private Integer displayOrder;
    private Boolean isFeatured;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long tourCount;
}
