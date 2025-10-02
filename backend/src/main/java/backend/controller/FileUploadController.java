package backend.controller;

import backend.dto.response.ApiResponse;
import backend.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "File Upload", description = "APIs for file upload and management")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class FileUploadController extends BaseController {
    
    private final FileStorageService fileStorageService;
    
    @PostMapping("/upload/image")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Upload single image", description = "Upload a single image file")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "subfolder", required = false) String subfolder) {
        
        try {
            log.info("Uploading image: {}", file.getOriginalFilename());
            
            String fileName = fileStorageService.storeFile(file, subfolder);
            
            Map<String, String> response = new HashMap<>();
            response.put("fileName", fileName);
            response.put("fileUrl", "/api/files/" + fileName);
            response.put("originalName", file.getOriginalFilename());
            response.put("fileSize", String.valueOf(file.getSize()));
            
            return ResponseEntity.ok(success("Image uploaded successfully", response));
            
        } catch (Exception e) {
            log.error("Error uploading image", e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to upload image: " + e.getMessage()));
        }
    }
    
    @PostMapping("/upload/images")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Upload multiple images", description = "Upload multiple image files")
    public ResponseEntity<ApiResponse<List<String>>> uploadImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "subfolder", required = false) String subfolder) {
        
        try {
            log.info("Uploading {} images", files.length);
            
            List<String> fileNames = fileStorageService.storeFiles(files, subfolder);
            
            return ResponseEntity.ok(success("Images uploaded successfully", fileNames));
            
        } catch (Exception e) {
            log.error("Error uploading images", e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to upload images: " + e.getMessage()));
        }
    }
    
    @GetMapping("/files/{fileName:.+}")
    @Operation(summary = "Download file", description = "Download a file by name")
    public ResponseEntity<Resource> downloadFile(
            @Parameter(description = "File name") @PathVariable String fileName,
            HttpServletRequest request) {
        
        try {
            Resource resource = fileStorageService.loadFileAsResource(fileName);
            
            String contentType = null;
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (IOException ex) {
                log.info("Could not determine file type.");
            }
            
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("Error downloading file: {}", fileName, e);
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/upload/image/{fileName:.+}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Delete file", description = "Delete a file by name")
    public ResponseEntity<ApiResponse<String>> deleteFile(
            @Parameter(description = "File name") @PathVariable String fileName) {
        
        try {
            log.info("Deleting file: {}", fileName);
            
            boolean deleted = fileStorageService.deleteFile(fileName);
            
            if (deleted) {
                return ResponseEntity.ok(success("File deleted successfully", fileName));
            } else {
                return ResponseEntity.badRequest()
                        .body(error("File not found or could not be deleted"));
            }
            
        } catch (Exception e) {
            log.error("Error deleting file: {}", fileName, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to delete file: " + e.getMessage()));
        }
    }
    
    @PostMapping("/admin/upload/tour-image")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload tour image", description = "Upload tour image (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadTourImage(
            @RequestParam("file") MultipartFile file) {
        
        return uploadImage(file, "tours");
    }
    
    @PostMapping("/admin/upload/partner-image")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload partner image", description = "Upload partner image (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPartnerImage(
            @RequestParam("file") MultipartFile file) {
        
        return uploadImage(file, "partners");
    }
    
    @PostMapping("/upload/review-image")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Upload review image", description = "Upload review image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadReviewImage(
            @RequestParam("file") MultipartFile file) {
        
        return uploadImage(file, "reviews");
    }
    
    @GetMapping("/files/list")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "List all uploaded files", description = "Get list of all uploaded files")
    public ResponseEntity<ApiResponse<List<String>>> listAllFiles() {
        
        try {
            List<String> files = fileStorageService.listAllFiles();
            return ResponseEntity.ok(success("Files retrieved successfully", files));
            
        } catch (Exception e) {
            log.error("Error listing files", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to list files: " + e.getMessage()));
        }
    }
    
    @GetMapping("/files/info")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(summary = "Get file storage info", description = "Get file storage configuration info")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStorageInfo() {
        
        try {
            Map<String, Object> info = new HashMap<>();
            info.put("uploadDir", "uploads");
            info.put("maxFileSize", "10MB");
            info.put("allowedImageTypes", List.of("image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"));
            info.put("allowedDocumentTypes", List.of("application/pdf", "application/msword"));
            
            return ResponseEntity.ok(success("Storage info retrieved successfully", info));
            
        } catch (Exception e) {
            log.error("Error getting storage info", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get storage info: " + e.getMessage()));
        }
    }
}

