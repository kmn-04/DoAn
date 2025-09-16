package backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = true, length = 50)
    @Size(min = 3, max = 50, message = "Username phải từ 3-50 ký tự")
    private String username; // Tự động tạo từ email, không bắt buộc nhập
    
    @Column(unique = true, nullable = false, length = 100)
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @Column(nullable = false)
    @NotBlank(message = "Password không được để trống")
    @Size(min = 6, message = "Password phải có ít nhất 6 ký tự")
    private String password;
    
    @Column(name = "full_name", nullable = false, length = 100)
    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;
    
    @Column(length = 20)
    private String phone;
    
    @Column(columnDefinition = "TEXT")
    private String address;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "email_verified")
    private Boolean emailVerified = false;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Social login fields
    @Column(name = "google_id")
    private String googleId;
    
    @Column(name = "facebook_id") 
    private String facebookId;
    
    @Column(name = "avatar_url")
    private String avatarUrl;
}
