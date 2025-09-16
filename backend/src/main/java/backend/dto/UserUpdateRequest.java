package backend.dto;

import backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {
    
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username;
    
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @Size(min = 6, message = "Password phải có ít nhất 6 ký tự")
    private String password;
    
    private String fullName;
    private String phone;
    private String address;
    private Role role;
    private Boolean isActive;
    private String avatarUrl;
}

