package backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    
    @NotBlank(message = "Email hoặc số điện thoại không được để trống")
    private String emailOrPhone;
    
    @NotBlank(message = "Password không được để trống")
    private String password;
}
