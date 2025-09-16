package backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class EmailVerificationRequest {
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotBlank(message = "Mã xác minh không được để trống")
    @Pattern(regexp = "^[0-9]{6}$", message = "Mã xác minh phải là 6 chữ số")
    private String verificationCode;

    // Constructors
    public EmailVerificationRequest() {}

    public EmailVerificationRequest(String email, String verificationCode) {
        this.email = email;
        this.verificationCode = verificationCode;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }
}
