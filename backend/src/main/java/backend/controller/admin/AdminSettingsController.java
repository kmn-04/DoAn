package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.request.SystemSettingRequest;
import backend.dto.response.ApiResponse;
import backend.entity.SystemSetting;
import backend.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Settings Management", description = "Admin APIs for managing system settings")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
// @PreAuthorize("hasRole('ADMIN')") // Temporarily disabled for testing
public class AdminSettingsController extends BaseController {
    
    private final SystemSettingService systemSettingService;
    
    @GetMapping
    @Operation(summary = "Get all settings", description = "Get all system settings (Admin only)")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getAllSettings() {
        try {
            List<SystemSetting> settings = systemSettingService.getAllSettings();
            return ResponseEntity.ok(success("System settings retrieved successfully", settings));
        } catch (Exception e) {
            log.error("Error getting system settings", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get system settings: " + e.getMessage()));
        }
    }
    
    @GetMapping("/category/{category}")
    @Operation(summary = "Get settings by category", description = "Get system settings by category (Admin only)")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getSettingsByCategory(@PathVariable String category) {
        try {
            List<SystemSetting> settings = systemSettingService.getSettingsByCategory(category);
            return ResponseEntity.ok(success("System settings retrieved successfully", settings));
        } catch (Exception e) {
            log.error("Error getting system settings by category: {}", category, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get system settings: " + e.getMessage()));
        }
    }
    
    @GetMapping("/key/{key}")
    @Operation(summary = "Get setting by key", description = "Get system setting by key (Admin only)")
    public ResponseEntity<ApiResponse<SystemSetting>> getSettingByKey(@PathVariable String key) {
        try {
            SystemSetting setting = systemSettingService.getSettingByKey(key)
                    .orElseThrow(() -> new RuntimeException("Setting not found with key: " + key));
            
            return ResponseEntity.ok(success("System setting retrieved successfully", setting));
        } catch (Exception e) {
            log.error("Error getting system setting with key: {}", key, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get system setting: " + e.getMessage()));
        }
    }
    
    @PostMapping
    @Operation(summary = "Create or update setting", description = "Create or update system setting (Admin only)")
    public ResponseEntity<ApiResponse<SystemSetting>> createOrUpdateSetting(@Valid @RequestBody SystemSettingRequest request) {
        try {
            SystemSetting setting = systemSettingService.createOrUpdateSetting(
                request.getKey(),
                request.getValue(),
                request.getDescription(),
                request.getCategory(),
                request.getValueType(),
                request.getIsPublic()
            );
            
            return ResponseEntity.ok(success("System setting saved successfully", setting));
        } catch (Exception e) {
            log.error("Error saving system setting", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to save system setting: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update setting by ID", description = "Update system setting by ID (Admin only)")
    public ResponseEntity<ApiResponse<SystemSetting>> updateSetting(
            @PathVariable Long id,
            @Valid @RequestBody SystemSettingRequest request
    ) {
        try {
            SystemSetting setting = new SystemSetting();
            setting.setValue(request.getValue());
            setting.setDescription(request.getDescription());
            setting.setCategory(request.getCategory());
            setting.setValueType(request.getValueType());
            setting.setIsPublic(request.getIsPublic());
            
            SystemSetting updatedSetting = systemSettingService.updateSetting(id, setting);
            return ResponseEntity.ok(success("System setting updated successfully", updatedSetting));
        } catch (Exception e) {
            log.error("Error updating system setting with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to update system setting: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete setting", description = "Delete system setting by ID (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteSetting(@PathVariable Long id) {
        try {
            systemSettingService.deleteSetting(id);
            return ResponseEntity.ok(success("System setting deleted successfully", null));
        } catch (Exception e) {
            log.error("Error deleting system setting with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to delete system setting: " + e.getMessage()));
        }
    }
}

