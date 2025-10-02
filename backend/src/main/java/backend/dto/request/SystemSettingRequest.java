package backend.dto.request;

import backend.entity.SystemSetting.ValueType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettingRequest {
    
    @NotBlank(message = "Setting key is required")
    private String key;
    
    @NotBlank(message = "Setting value is required")
    private String value;
    
    private String description;
    
    @NotBlank(message = "Category is required")
    private String category;
    
    private ValueType valueType;
    
    private Boolean isPublic;
}

