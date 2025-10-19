package backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewsletterRequest {
    
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
}

