package backend.service.impl;

import backend.entity.SystemSetting;
import backend.repository.SystemSettingRepository;
import backend.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
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
    @Transactional
    public SystemSetting saveSetting(String key, String value, String type, String category) {
        SystemSetting setting = systemSettingRepository.findByKey(key)
                .orElse(new SystemSetting());
        
        setting.setKey(key);
        setting.setValue(value);
        setting.setType(type);
        setting.setCategory(category);
        
        SystemSetting saved = systemSettingRepository.save(setting);
        log.info("Saved setting: {} = {}", key, value);
        
        return saved;
    }
    
    @Override
    @Transactional
    public void batchUpdateSettings(Map<String, String> settings) {
        for (Map.Entry<String, String> entry : settings.entrySet()) {
            SystemSetting setting = systemSettingRepository.findByKey(entry.getKey())
                    .orElse(new SystemSetting(entry.getKey(), entry.getValue(), "STRING", "GENERAL"));
            
            setting.setValue(entry.getValue());
            systemSettingRepository.save(setting);
        }
        
        log.info("Batch updated {} settings", settings.size());
    }
    
    @Override
    @Transactional
    public void deleteSetting(String key) {
        systemSettingRepository.findByKey(key).ifPresent(setting -> {
            systemSettingRepository.delete(setting);
            log.info("Deleted setting: {}", key);
        });
    }
    
    @Override
    @Transactional(readOnly = true)
    public Map<String, String> getAllSettingsAsMap() {
        return systemSettingRepository.findAll().stream()
                .collect(Collectors.toMap(
                        SystemSetting::getKey,
                        SystemSetting::getValue
                ));
    }
}
