package backend.service;

import backend.model.ActionType;
import backend.model.ActivityLog;
import backend.model.User;
import backend.repository.ActivityLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public void logActivity(User user, ActionType actionType, String targetObject, String details) {
        try {
            ActivityLog log = new ActivityLog();
            log.setUser(user);
            log.setActionType(actionType);
            log.setTargetObject(targetObject);
            log.setDetails(details);
            log.setCreatedAt(LocalDateTime.now());
            
            // Get request info if available
            try {
                ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
                HttpServletRequest request = attr.getRequest();
                
                log.setIpAddress(getClientIpAddress(request));
                log.setDevice(request.getHeader("User-Agent"));
                log.setLocation("Vietnam"); // Default location, could be enhanced with IP geolocation
            } catch (Exception e) {
                // Request context not available, use defaults
                log.setIpAddress("Unknown");
                log.setDevice("Unknown");
                log.setLocation("Unknown");
            }
            
            activityLogRepository.save(log);
            System.out.println("📝 Activity logged: " + user.getUsername() + " - " + actionType + " - " + details);
            
        } catch (Exception e) {
            System.err.println("❌ Error logging activity: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    public void logLogin(User user) {
        logActivity(user, ActionType.LOGIN, "System", "User logged in successfully");
    }
    
    public void logLogout(User user) {
        logActivity(user, ActionType.LOGOUT, "System", "User logged out");
    }
    
    public void logProfileUpdate(User user) {
        logActivity(user, ActionType.UPDATE_PROFILE, "Profile", "User updated their profile information");
    }
    
    public void logPasswordChange(User user) {
        logActivity(user, ActionType.CHANGE_PASSWORD, "Account", "User changed their password");
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}
