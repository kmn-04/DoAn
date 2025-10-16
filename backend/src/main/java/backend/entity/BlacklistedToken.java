package backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "blacklisted_tokens", indexes = {
    @Index(name = "idx_blacklisted_tokens_expires_at", columnList = "expires_at"),
    @Index(name = "idx_blacklisted_tokens_user_email", columnList = "user_email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BlacklistedToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;
    
    @Column(name = "token", nullable = false, unique = true, columnDefinition = "TEXT")
    private String token;
    
    @Column(name = "user_email", length = 150)
    private String userEmail;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "reason", length = 100)
    private String reason;
    
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @CreationTimestamp
    @Column(name = "blacklisted_at", nullable = false, updatable = false)
    private LocalDateTime blacklistedAt;
    
    // Constructor for easy creation
    public BlacklistedToken(String token, String userEmail, LocalDateTime expiresAt, String reason) {
        this.token = token;
        this.userEmail = userEmail;
        this.expiresAt = expiresAt;
        this.reason = reason;
    }
    
    public BlacklistedToken(String token, String userEmail, LocalDateTime expiresAt, String reason, String ipAddress) {
        this.token = token;
        this.userEmail = userEmail;
        this.expiresAt = expiresAt;
        this.reason = reason;
        this.ipAddress = ipAddress;
    }
    
    // Helper method
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}

