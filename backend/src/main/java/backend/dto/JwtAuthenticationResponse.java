package backend.dto;

import backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtAuthenticationResponse {
    
    private String accessToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    
    public JwtAuthenticationResponse(String accessToken, Long userId, String username, 
                                   String email, String fullName, Role role) {
        this.accessToken = accessToken;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }
}
