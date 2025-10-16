package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import backend.entity.SystemSetting;
import backend.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Settings", description = "Admin APIs for system settings management")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AdminSettingsController extends BaseController {
    
    private final SystemSettingService systemSettingService;
    
    @GetMapping
    @Operation(summary = "Get all system settings")
    public ResponseEntity<ApiResponse<Map<String, String>>> getAllSettings() {
        try {
            Map<String, String> settings = systemSettingService.getAllSettingsAsMap();
            return ResponseEntity.ok(success("Settings retrieved successfully", settings));
        } catch (Exception e) {
            log.error("Error getting settings", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get settings: " + e.getMessage()));
        }
    }
    
    @GetMapping("/list")
    @Operation(summary = "Get all settings as list")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getAllSettingsList() {
        try {
            List<SystemSetting> settings = systemSettingService.getAllSettings();
            return ResponseEntity.ok(success("Settings retrieved successfully", settings));
        } catch (Exception e) {
            log.error("Error getting settings list", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get settings: " + e.getMessage()));
        }
    }
    
    @GetMapping("/category/{category}")
    @Operation(summary = "Get settings by category")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getSettingsByCategory(
            @PathVariable String category) {
        try {
            List<SystemSetting> settings = systemSettingService.getSettingsByCategory(category);
            return ResponseEntity.ok(success("Settings retrieved successfully", settings));
        } catch (Exception e) {
            log.error("Error getting settings by category", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get settings: " + e.getMessage()));
        }
    }
    
    @PutMapping
    @Operation(summary = "Batch update settings")
    public ResponseEntity<ApiResponse<String>> updateSettings(
            @RequestBody Map<String, String> settings) {
        try {
            systemSettingService.batchUpdateSettings(settings);
            return ResponseEntity.ok(success("Settings updated successfully"));
        } catch (Exception e) {
            log.error("Error updating settings", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to update settings: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{key}")
    @Operation(summary = "Update single setting")
    public ResponseEntity<ApiResponse<SystemSetting>> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> payload) {
        try {
            String value = payload.get("value");
            String type = payload.getOrDefault("type", "STRING");
            String category = payload.getOrDefault("category", "GENERAL");
            
            SystemSetting setting = systemSettingService.saveSetting(key, value, type, category);
            return ResponseEntity.ok(success("Setting updated successfully", setting));
        } catch (Exception e) {
            log.error("Error updating setting", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to update setting: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{key}")
    @Operation(summary = "Delete setting")
    public ResponseEntity<ApiResponse<String>> deleteSetting(@PathVariable String key) {
        try {
            systemSettingService.deleteSetting(key);
            return ResponseEntity.ok(success("Setting deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting setting", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to delete setting: " + e.getMessage()));
        }
    }
}
