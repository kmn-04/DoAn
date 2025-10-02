package backend.service;

import backend.entity.SystemSetting;

import java.util.List;
import java.util.Optional;

public interface SystemSettingService {
    
    List<SystemSetting> getAllSettings();
    
    List<SystemSetting> getSettingsByCategory(String category);
    
    List<SystemSetting> getPublicSettings();
    
    Optional<SystemSetting> getSettingByKey(String key);
    
    String getSettingValue(String key, String defaultValue);
    
    SystemSetting createOrUpdateSetting(String key, String value, String description, String category, SystemSetting.ValueType valueType, Boolean isPublic);
    
    SystemSetting updateSetting(Long id, SystemSetting setting);
    
    void deleteSetting(Long id);
}

