package backend.controller;

import backend.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@Slf4j
@Tag(name = "File Upload", description = "APIs for uploading files")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class FileUploadController extends BaseController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${server.port:8080}")
    private String serverPort;

    @PostMapping("/image")
    @Operation(summary = "Upload single image (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = saveFile(file);
            return ResponseEntity.ok(success("Image uploaded successfully", imageUrl));
        } catch (Exception e) {
            log.error("Error uploading image", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to upload image: " + e.getMessage()));
        }
    }
    
    @PostMapping("/avatar")
    @Operation(summary = "Upload avatar image (Authenticated users)")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = saveFile(file);
            return ResponseEntity.ok(success("Avatar uploaded successfully", imageUrl));
        } catch (Exception e) {
            log.error("Error uploading avatar", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to upload avatar: " + e.getMessage()));
        }
    }

    @PostMapping("/images")
    @Operation(summary = "Upload multiple images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<String>>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        try {
            List<String> imageUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                String imageUrl = saveFile(file);
                imageUrls.add(imageUrl);
            }
            return ResponseEntity.ok(success("Images uploaded successfully", imageUrls));
        } catch (Exception e) {
            log.error("Error uploading images", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to upload images: " + e.getMessage()));
        }
    }

    @DeleteMapping("/image")
    @Operation(summary = "Delete image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteImage(@RequestParam("url") String imageUrl) {
        try {
            // Only delete if it's a local file (uploaded image)
            // External images (e.g., from Unsplash) should not be deleted
            if (imageUrl == null || imageUrl.isEmpty()) {
                return ResponseEntity.ok(success("No image to delete"));
            }
            
            // Check if it's an external URL (http:// or https://)
            if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
                // Check if it's from our server
                if (imageUrl.contains("localhost:" + serverPort) || imageUrl.contains("/uploads/")) {
                    // Extract filename from local URL
                    String filename = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                    Path filePath = Paths.get(uploadDir, filename);
                    
                    if (Files.exists(filePath)) {
                        Files.delete(filePath);
                        log.info("Deleted local image file: {}", filename);
                    }
                } else {
                    // External image (e.g., Unsplash) - just return success without deleting
                    log.info("Skipping deletion of external image: {}", imageUrl);
                }
            } else {
                // Relative path - try to delete
                Path filePath = Paths.get(uploadDir, imageUrl);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                    log.info("Deleted image file: {}", imageUrl);
                }
            }
            
            return ResponseEntity.ok(success("Image deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting image: {}", imageUrl, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to delete image: " + e.getMessage()));
        }
    }

    private String saveFile(MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Create upload directory if not exists
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return URL
        return "http://localhost:" + serverPort + "/uploads/" + filename;
    }
}
