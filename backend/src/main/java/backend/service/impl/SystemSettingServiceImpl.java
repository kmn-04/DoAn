package backend.service.impl;

import backend.entity.SystemSetting;
import backend.repository.SystemSettingRepository;
import backend.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SystemSettingServiceImpl implements SystemSettingService {
    
    private final SystemSettingRepository systemSettingRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SystemSetting> getSettingsByCategory(String category) {
        return systemSettingRepository.findByCategory(category);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<SystemSetting> getPublicSettings() {
        return systemSettingRepository.findByIsPublicTrue();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<SystemSetting> getSettingByKey(String key) {
        return systemSettingRepository.findByKey(key);
    }
    
    @Override
    @Transactional(readOnly = true)
    public String getSettingValue(String key, String defaultValue) {
        return systemSettingRepository.findByKey(key)
                .map(SystemSetting::getValue)
                .orElse(defaultValue);
    }
    
    @Override
    public SystemSetting createOrUpdateSetting(String key, String value, String description, 
                                               String category, SystemSetting.ValueType valueType, Boolean isPublic) {
        log.info("Creating/Updating system setting: {}", key);
        
        Optional<SystemSetting> existingSetting = systemSettingRepository.findByKey(key);
        
        SystemSetting setting;
        if (existingSetting.isPresent()) {
            setting = existingSetting.get();
            setting.setValue(value);
            if (description != null) setting.setDescription(description);
            if (category != null) setting.setCategory(category);
            if (valueType != null) setting.setValueType(valueType);
            if (isPublic != null) setting.setIsPublic(isPublic);
        } else {
            setting = new SystemSetting();
            setting.setKey(key);
            setting.setValue(value);
            setting.setDescription(description);
            setting.setCategory(category != null ? category : "General");
            setting.setValueType(valueType != null ? valueType : SystemSetting.ValueType.STRING);
            setting.setIsPublic(isPublic != null ? isPublic : false);
        }
        
        return systemSettingRepository.save(setting);
    }
    
    @Override
    public SystemSetting updateSetting(Long id, SystemSetting setting) {
        log.info("Updating system setting with ID: {}", id);
        
        SystemSetting existingSetting = systemSettingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("System setting not found with ID: " + id));
        
        existingSetting.setValue(setting.getValue());
        if (setting.getDescription() != null) existingSetting.setDescription(setting.getDescription());
        if (setting.getCategory() != null) existingSetting.setCategory(setting.getCategory());
        if (setting.getValueType() != null) existingSetting.setValueType(setting.getValueType());
        if (setting.getIsPublic() != null) existingSetting.setIsPublic(setting.getIsPublic());
        
        return systemSettingRepository.save(existingSetting);
    }
    
    @Override
    public void deleteSetting(Long id) {
        log.info("Deleting system setting with ID: {}", id);
        systemSettingRepository.deleteById(id);
    }
}

