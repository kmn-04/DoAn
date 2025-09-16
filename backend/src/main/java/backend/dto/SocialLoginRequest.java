package backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SocialLoginRequest {
    
    @NotBlank(message = "Provider không được để trống")
    private String provider; // "google" hoặc "facebook"
    
    @NotBlank(message = "Provider ID không được để trống")
    private String providerId; // ID từ Google/Facebook
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotBlank(message = "Tên không được để trống")
    private String name;
    
    private String picture; // URL avatar
}
