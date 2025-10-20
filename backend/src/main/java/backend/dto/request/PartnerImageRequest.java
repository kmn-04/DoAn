package backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerImageRequest {
    private String imageUrl;
    private String imageType; // cover | logo | gallery
    private Integer displayOrder;
    private String altText;
}


