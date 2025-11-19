package backend.security;

import backend.entity.User;
import backend.security.JwtUtils;
import backend.service.OAuth2Service;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    
    private final OAuth2Service oAuth2Service;
    private final JwtUtils jwtUtils;
    
    @Value("${app.url:http://localhost:5173}")
    private String frontendUrl;
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                       Authentication authentication) throws IOException {
        
        log.info("OAuth2 authentication successful");
        
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oauth2User.getAttributes();
        
        // Extract Google user info
        String email = (String) attributes.get("email");
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");
        
        log.info("Google OAuth user - Email: {}, Name: {}", email, name);
        
        // Process OAuth login and get/create user
        User user = oAuth2Service.processGoogleOAuthLogin(email, name, picture);
        
        // Generate JWT token
        String jwtToken = jwtUtils.generateTokenFromEmail(user.getEmail());
        
        log.info("JWT token generated for Google OAuth user: {}", email);
        
        // Redirect to frontend with token in query parameter
        String redirectUrl = frontendUrl + "/auth/google/callback?token=" + jwtToken + "&email=" + email;
        
        log.info("Redirecting to: {}", redirectUrl);
        
        // Redirect to frontend with token
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}

