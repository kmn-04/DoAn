package backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopularDestinationResponse {
    private String name;           // Destination name (Phú Quốc, Bangkok, etc.)
    private String country;        // Country name (Việt Nam, Thái Lan, etc.)
    private String countryCode;    // Country code (VN, TH, etc.)
    private String slug;           // URL-friendly slug
    private String image;          // Representative image
    private Integer tourCount;     // Number of tours to this destination
    private Double averageRating;  // Average rating across all tours
    private BigDecimal averagePrice; // Average price
    private String climate;        // Climate info (if available)
    private List<String> highlights; // Top highlights from tours
}
