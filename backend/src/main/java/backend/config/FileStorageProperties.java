package backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "file")
@Data
public class FileStorageProperties {
    
    private String uploadDir = "uploads";
    
    private long maxFileSize = 10485760; // 10MB in bytes
    
    private String[] allowedImageTypes = {
        "image/jpeg", 
        "image/jpg", 
        "image/png", 
        "image/gif", 
        "image/webp"
    };
    
    private String[] allowedDocumentTypes = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
}

