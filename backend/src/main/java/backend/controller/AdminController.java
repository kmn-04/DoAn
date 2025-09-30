package backend.controller;

import backend.dto.response.ApiResponse;
import backend.util.EnumValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final EnumValidator enumValidator;
    private final JdbcTemplate jdbcTemplate;

    @PostMapping("/validate-enums")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> validateEnums() {
        log.info("Admin triggered ENUM validation");
        
        try {
            enumValidator.validateAndFix();
            return ResponseEntity.ok(ApiResponse.success(
                "ENUM validation completed successfully", 
                "All enum values have been checked and fixed"
            ));
        } catch (Exception e) {
            log.error("Error during ENUM validation", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("ENUM validation failed: " + e.getMessage()));
        }
    }
    
    @GetMapping("/check-enums")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkEnums() {
        log.info("Admin checking ENUM values");
        
        try {
            Map<String, Object> result = new HashMap<>();
            
            safeAddQuery(result, "roles", "SELECT name, COUNT(*) as count FROM roles GROUP BY name");
            safeAddQuery(result, "userStatus", "SELECT status, COUNT(*) as count FROM users GROUP BY status");
            safeAddQuery(result, "categoryStatus", "SELECT status, COUNT(*) as count FROM categories GROUP BY status");
            safeAddQuery(result, "tourStatus", "SELECT status, COUNT(*) as count FROM tours GROUP BY status");
            safeAddQuery(result, "tourType", "SELECT tour_type, COUNT(*) as count FROM tours GROUP BY tour_type");
            safeAddQuery(result, "bookingStatus", "SELECT status, COUNT(*) as count FROM bookings GROUP BY status");
            safeAddQuery(result, "promotionType", "SELECT type, COUNT(*) as count FROM promotions GROUP BY type");
            safeAddQuery(result, "promotionStatus", "SELECT status, COUNT(*) as count FROM promotions GROUP BY status");
            safeAddQuery(result, "policyType", "SELECT policy_type, COUNT(*) as count FROM cancellation_policies GROUP BY policy_type");
            safeAddQuery(result, "policyStatus", "SELECT status, COUNT(*) as count FROM cancellation_policies GROUP BY status");
            safeAddQuery(result, "continent", "SELECT continent, COUNT(*) as count FROM countries GROUP BY continent");
            
            return ResponseEntity.ok(ApiResponse.success(
                "Current ENUM values in database", 
                result
            ));
        } catch (Exception e) {
            log.error("Error checking ENUM values", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to check ENUM values: " + e.getMessage()));
        }
    }
    
    private void safeAddQuery(Map<String, Object> result, String key, String query) {
        try {
            result.put(key, jdbcTemplate.queryForList(query));
        } catch (Exception e) {
            log.warn("Failed to query {}: {}", key, e.getMessage());
            result.put(key, List.of(Map.of("error", e.getMessage())));
        }
    }
}
