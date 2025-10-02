package backend.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

public interface FileStorageService {
    
    /**
     * Store a file
     */
    String storeFile(MultipartFile file, String subfolder);
    
    /**
     * Store multiple files
     */
    List<String> storeFiles(MultipartFile[] files, String subfolder);
    
    /**
     * Load file as Resource
     */
    Resource loadFileAsResource(String fileName);
    
    /**
     * Delete a file
     */
    boolean deleteFile(String fileName);
    
    /**
     * Get file path
     */
    Path getFilePath(String fileName);
    
    /**
     * Validate file type
     */
    boolean isValidImageFile(MultipartFile file);
    
    /**
     * Validate file size
     */
    boolean isValidFileSize(MultipartFile file);
    
    /**
     * Generate unique file name
     */
    String generateFileName(String originalFileName);
    
    /**
     * List all uploaded files
     */
    List<String> listAllFiles();
}

