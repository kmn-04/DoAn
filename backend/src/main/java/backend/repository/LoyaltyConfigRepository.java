package backend.repository;

import backend.entity.LoyaltyConfig;
import backend.entity.LoyaltyConfig.ConfigType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoyaltyConfigRepository extends JpaRepository<LoyaltyConfig, Long> {
    
    /**
     * Find config by key
     */
    Optional<LoyaltyConfig> findByConfigKey(String configKey);
    
    /**
     * Find configs by type
     */
    List<LoyaltyConfig> findByConfigType(ConfigType configType);
    
    /**
     * Find active configs
     */
    @Query("SELECT lc FROM LoyaltyConfig lc WHERE lc.isActive = true")
    List<LoyaltyConfig> findActiveConfigs();
    
    /**
     * Find active configs by type
     */
    @Query("SELECT lc FROM LoyaltyConfig lc WHERE lc.configType = :type AND lc.isActive = true")
    List<LoyaltyConfig> findActiveConfigsByType(@Param("type") ConfigType type);
    
    /**
     * Get config value by key
     */
    @Query("SELECT lc.configValue FROM LoyaltyConfig lc WHERE lc.configKey = :key AND lc.isActive = true")
    Optional<String> getConfigValue(@Param("key") String key);
    
    /**
     * Check if config key exists
     */
    boolean existsByConfigKey(String configKey);
}

