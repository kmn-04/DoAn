package backend.service;

import backend.entity.SystemSetting;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface SystemSettingService {
    
    /**
     * Get all settings
     */
    List<SystemSetting> getAllSettings();
    
    /**
     * Get settings by category
     */
    List<SystemSetting> getSettingsByCategory(String category);
    
    /**
     * Get setting by key
     */
    Optional<SystemSetting> getSettingByKey(String key);
    
    /**
     * Get setting value by key
     */
    String getSettingValue(String key, String defaultValue);
    
    /**
     * Update or create setting
     */
    SystemSetting saveSetting(String key, String value, String type, String category);
    
    /**
     * Batch update settings
     */
    void batchUpdateSettings(Map<String, String> settings);
    
    /**
     * Delete setting
     */
    void deleteSetting(String key);
    
    /**
     * Get all settings as Map
     */
    Map<String, String> getAllSettingsAsMap();
}
