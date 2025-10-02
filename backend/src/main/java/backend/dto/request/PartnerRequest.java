package backend.dto.request;

import backend.entity.Partner.PartnerStatus;
import backend.entity.Partner.PartnerType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartnerRequest {
    
    @NotBlank(message = "Partner name is required")
    private String name;
    
    private String slug;
    
    private String description;
    
    @NotNull(message = "Partner type is required")
    private PartnerType type;
    
    private String address;
    
    private String phone;
    
    @Email(message = "Invalid email format")
    private String email;
    
    private String website;
    
    private Integer establishedYear;
    
    private String avatarUrl;
    
    private PartnerStatus status;
    
    private String specialties; // JSON string
}

