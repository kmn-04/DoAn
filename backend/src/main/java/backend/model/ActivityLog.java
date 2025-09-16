package backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false)
    private ActionType actionType;
    
    @Column(name = "target_object")
    private String targetObject;
    
    @Column(name = "details", columnDefinition = "TEXT")
    private String details;
    
    @Column(name = "ip_address")
    private String ipAddress;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "device")
    private String device;
    
    @Column(name = "created_at", nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    // Constructors
    public ActivityLog() {
        this.createdAt = LocalDateTime.now();
    }
    
    public ActivityLog(User user, ActionType actionType, String targetObject, String details) {
        this();
        this.user = user;
        this.actionType = actionType;
        this.targetObject = targetObject;
        this.details = details;
    }
    
    public ActivityLog(User user, ActionType actionType, String targetObject, String details, 
                      String ipAddress, String location, String device) {
        this(user, actionType, targetObject, details);
        this.ipAddress = ipAddress;
        this.location = location;
        this.device = device;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public ActionType getActionType() {
        return actionType;
    }
    
    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }
    
    public String getTargetObject() {
        return targetObject;
    }
    
    public void setTargetObject(String targetObject) {
        this.targetObject = targetObject;
    }
    
    public String getDetails() {
        return details;
    }
    
    public void setDetails(String details) {
        this.details = details;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getDevice() {
        return device;
    }
    
    public void setDevice(String device) {
        this.device = device;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "ActivityLog{" +
                "id=" + id +
                ", user=" + (user != null ? user.getId() : null) +
                ", actionType=" + actionType +
                ", targetObject='" + targetObject + '\'' +
                ", details='" + details + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
