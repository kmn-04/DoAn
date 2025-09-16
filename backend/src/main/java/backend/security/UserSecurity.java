package backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("userSecurity")
public class UserSecurity {
    
    public boolean isOwner(Authentication authentication, Long userId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        
        // Admin có thể truy cập tất cả
        if (userPrincipal.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }
        
        // User chỉ có thể truy cập thông tin của chính mình
        return userPrincipal.getId().equals(userId);
    }
}

