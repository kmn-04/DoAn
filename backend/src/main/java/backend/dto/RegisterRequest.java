package backend.dto;

import backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username; // Tự động tạo nếu không cung cấp
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, message = "Password phải có ít nhất 6 ký tự")
    private String password;
    
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;
    
    private String phone;
    
    private String address;
    
    private Role role = Role.USER;
}
