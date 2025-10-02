package backend.service.impl;

import backend.config.FileStorageProperties;
import backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {
    
    private final FileStorageProperties fileStorageProperties;
    private Path fileStorageLocation;
    
    @PostConstruct
    public void init() {
        this.fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                .toAbsolutePath().normalize();
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            log.info("✅ File storage location created: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            log.error("❌ Could not create file storage directory", ex);
            throw new RuntimeException("Could not create file storage directory", ex);
        }
    }
    
    @Override
    public String storeFile(MultipartFile file, String subfolder) {
        // Validate file
        if (!isValidImageFile(file)) {
            throw new RuntimeException("Invalid file type. Only images are allowed.");
        }
        
        if (!isValidFileSize(file)) {
            throw new RuntimeException("File size exceeds maximum limit of " + 
                    (fileStorageProperties.getMaxFileSize() / 1024 / 1024) + "MB");
        }
        
        // Generate unique file name
        String fileName = generateFileName(file.getOriginalFilename());
        
        try {
            // Create subfolder if specified
            Path targetLocation = fileStorageLocation;
            if (subfolder != null && !subfolder.trim().isEmpty()) {
                targetLocation = fileStorageLocation.resolve(subfolder);
                Files.createDirectories(targetLocation);
            }
            
            // Store file
            Path filePath = targetLocation.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return relative path
            String relativePath = subfolder != null && !subfolder.trim().isEmpty() 
                    ? subfolder + "/" + fileName 
                    : fileName;
            
            log.info("✅ File stored successfully: {}", relativePath);
            return relativePath;
            
        } catch (IOException ex) {
            log.error("❌ Could not store file {}", fileName, ex);
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }
    
    @Override
    public List<String> storeFiles(MultipartFile[] files, String subfolder) {
        List<String> fileNames = new ArrayList<>();
        
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                String fileName = storeFile(file, subfolder);
                fileNames.add(fileName);
            }
        }
        
        return fileNames;
    }
    
    @Override
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found: " + fileName);
            }
        } catch (MalformedURLException ex) {
            log.error("❌ File not found: {}", fileName, ex);
            throw new RuntimeException("File not found: " + fileName, ex);
        }
    }
    
    @Override
    public boolean deleteFile(String fileName) {
        try {
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            boolean deleted = Files.deleteIfExists(filePath);
            
            if (deleted) {
                log.info("✅ File deleted successfully: {}", fileName);
            } else {
                log.warn("⚠️ File not found for deletion: {}", fileName);
            }
            
            return deleted;
        } catch (IOException ex) {
            log.error("❌ Could not delete file: {}", fileName, ex);
            return false;
        }
    }
    
    @Override
    public Path getFilePath(String fileName) {
        return fileStorageLocation.resolve(fileName).normalize();
    }
    
    @Override
    public boolean isValidImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }
        
        String contentType = file.getContentType();
        if (contentType == null) {
            return false;
        }
        
        return Arrays.asList(fileStorageProperties.getAllowedImageTypes())
                .contains(contentType.toLowerCase());
    }
    
    @Override
    public boolean isValidFileSize(MultipartFile file) {
        if (file == null) {
            return false;
        }
        
        return file.getSize() <= fileStorageProperties.getMaxFileSize();
    }
    
    @Override
    public String generateFileName(String originalFileName) {
        String cleanFileName = StringUtils.cleanPath(originalFileName != null ? originalFileName : "file");
        String extension = "";
        
        int dotIndex = cleanFileName.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = cleanFileName.substring(dotIndex);
        }
        
        return UUID.randomUUID().toString() + extension;
    }
    
    @Override
    public List<String> listAllFiles() {
        try {
            return Files.walk(this.fileStorageLocation, 1)
                    .filter(path -> !path.equals(this.fileStorageLocation))
                    .filter(Files::isRegularFile)
                    .map(path -> path.getFileName().toString())
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Could not list files", e);
        }
    }
}

