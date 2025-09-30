package backend.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class EnumValidator implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        // Only run if --validate-enums argument is passed
        boolean shouldValidate = false;
        for (String arg : args) {
            if ("--validate-enums".equals(arg)) {
                shouldValidate = true;
                break;
            }
        }
        
        if (!shouldValidate) {
            log.debug("Skipping ENUM validation (use --validate-enums to run or call /api/admin/validate-enums)");
            return;
        }
        
        validateAndFix();
    }
    
    public void validateAndFix() {
        log.info("=== Starting ENUM Value Validation ===");
        
        checkAndFixRoles();
        checkAndFixUserStatus();
        checkAndFixCategoryStatus();
        checkAndFixTourStatus();
        checkAndFixTourType();
        checkAndFixBookingStatus();
        checkAndFixPromotions();
        checkAndFixPaymentStatus();
        checkAndFixPartnerType();
        checkAndFixCancellationPolicy();
        checkAndFixContinent();
        
        log.info("=== ENUM Validation Completed ===");
    }

    private void checkAndFixRoles() {
        log.info("Checking roles...");
        List<Map<String, Object>> roles = jdbcTemplate.queryForList(
            "SELECT name, COUNT(*) as count FROM roles GROUP BY name"
        );
        
        roles.forEach(role -> {
            String name = (String) role.get("name");
            Long count = (Long) role.get("count");
            log.info("  Role: {} (count: {})", name, count);
            
            // Fix case mismatches
            if (name.equalsIgnoreCase("admin") && !name.equals("Admin")) {
                jdbcTemplate.update("UPDATE roles SET name = 'Admin' WHERE name = ?", name);
                log.warn("  ✓ Fixed: {} -> Admin", name);
            } else if (name.equalsIgnoreCase("staff") && !name.equals("Staff")) {
                jdbcTemplate.update("UPDATE roles SET name = 'Staff' WHERE name = ?", name);
                log.warn("  ✓ Fixed: {} -> Staff", name);
            } else if (name.equalsIgnoreCase("customer") && !name.equals("Customer")) {
                jdbcTemplate.update("UPDATE roles SET name = 'Customer' WHERE name = ?", name);
                log.warn("  ✓ Fixed: {} -> Customer", name);
            }
        });
    }

    private void checkAndFixUserStatus() {
        log.info("Checking user status...");
        List<Map<String, Object>> statuses = jdbcTemplate.queryForList(
            "SELECT status, COUNT(*) as count FROM users GROUP BY status"
        );
        
        statuses.forEach(status -> {
            String value = (String) status.get("status");
            Long count = (Long) status.get("count");
            log.info("  User Status: {} (count: {})", value, count);
            
            if (value.equalsIgnoreCase("active") && !value.equals("Active")) {
                jdbcTemplate.update("UPDATE users SET status = 'Active' WHERE status = ?", value);
                log.warn("  ✓ Fixed: {} -> Active", value);
            } else if (value.equalsIgnoreCase("inactive") && !value.equals("Inactive")) {
                jdbcTemplate.update("UPDATE users SET status = 'Inactive' WHERE status = ?", value);
                log.warn("  ✓ Fixed: {} -> Inactive", value);
            }
        });
    }

    private void checkAndFixCategoryStatus() {
        log.info("Checking category status...");
        List<Map<String, Object>> statuses = jdbcTemplate.queryForList(
            "SELECT status, COUNT(*) as count FROM categories GROUP BY status"
        );
        
        statuses.forEach(status -> {
            String value = (String) status.get("status");
            Long count = (Long) status.get("count");
            log.info("  Category Status: {} (count: {})", value, count);
            
            if (value.equalsIgnoreCase("active") && !value.equals("Active")) {
                jdbcTemplate.update("UPDATE categories SET status = 'Active' WHERE status = ?", value);
                log.warn("  ✓ Fixed: {} -> Active", value);
            } else if (value.equalsIgnoreCase("inactive") && !value.equals("Inactive")) {
                jdbcTemplate.update("UPDATE categories SET status = 'Inactive' WHERE status = ?", value);
                log.warn("  ✓ Fixed: {} -> Inactive", value);
            }
        });
    }

    private void checkAndFixTourStatus() {
        log.info("Checking tour status...");
        List<Map<String, Object>> statuses = jdbcTemplate.queryForList(
            "SELECT status, COUNT(*) as count FROM tours GROUP BY status"
        );
        
        statuses.forEach(status -> {
            String value = (String) status.get("status");
            Long count = (Long) status.get("count");
            log.info("  Tour Status: {} (count: {})", value, count);
            
            if (value.equalsIgnoreCase("active") && !value.equals("Active")) {
                jdbcTemplate.update("UPDATE tours SET status = 'Active' WHERE status = ?", value);
                log.warn("  ✓ Fixed: {} -> Active", value);
            } else if (value.equalsIgnoreCase("inactive") && !value.equals("Inactive")) {
                jdbcTemplate.update("UPDATE tours SET status = 'Inactive' WHERE status = ?", value);
                log.warn("  ✓ Fixed: {} -> Inactive", value);
            }
        });
    }

    private void checkAndFixTourType() {
        log.info("Checking tour type...");
        List<Map<String, Object>> types = jdbcTemplate.queryForList(
            "SELECT tour_type, COUNT(*) as count FROM tours GROUP BY tour_type"
        );
        
        types.forEach(type -> {
            String value = (String) type.get("tour_type");
            Long count = (Long) type.get("count");
            log.info("  Tour Type: {} (count: {})", value, count);
            
            if (value.equalsIgnoreCase("domestic") && !value.equals("DOMESTIC")) {
                jdbcTemplate.update("UPDATE tours SET tour_type = 'DOMESTIC' WHERE tour_type = ?", value);
                log.warn("  ✓ Fixed: {} -> DOMESTIC", value);
            } else if (value.equalsIgnoreCase("international") && !value.equals("INTERNATIONAL")) {
                jdbcTemplate.update("UPDATE tours SET tour_type = 'INTERNATIONAL' WHERE tour_type = ?", value);
                log.warn("  ✓ Fixed: {} -> INTERNATIONAL", value);
            }
        });
    }

    private void checkAndFixBookingStatus() {
        log.info("Checking booking status...");
        List<Map<String, Object>> statuses = jdbcTemplate.queryForList(
            "SELECT status, COUNT(*) as count FROM bookings GROUP BY status"
        );
        
        statuses.forEach(status -> {
            String value = (String) status.get("status");
            Long count = (Long) status.get("count");
            log.info("  Booking Status: {} (count: {})", value, count);
            
            // Fix case mismatches for booking status
            String correctValue = fixBookingStatusCase(value);
            if (!value.equals(correctValue)) {
                jdbcTemplate.update("UPDATE bookings SET status = ? WHERE status = ?", correctValue, value);
                log.warn("  ✓ Fixed: {} -> {}", value, correctValue);
            }
        });
    }

    private String fixBookingStatusCase(String value) {
        if (value.equalsIgnoreCase("pending")) return "Pending";
        if (value.equalsIgnoreCase("confirmed")) return "Confirmed";
        if (value.equalsIgnoreCase("paid")) return "Paid";
        if (value.equalsIgnoreCase("cancelled")) return "Cancelled";
        if (value.equalsIgnoreCase("completed")) return "Completed";
        if (value.equalsIgnoreCase("cancellationrequested") || 
            value.equalsIgnoreCase("cancellation_requested") ||
            value.equalsIgnoreCase("cancellation requested")) return "CancellationRequested";
        return value;
    }

    private void checkAndFixPromotions() {
        log.info("Checking promotion type...");
        List<Map<String, Object>> types = jdbcTemplate.queryForList(
            "SELECT type, COUNT(*) as count FROM promotions GROUP BY type"
        );
        
        types.forEach(type -> {
            String value = (String) type.get("type");
            Long count = (Long) type.get("count");
            log.info("  Promotion Type: {} (count: {})", value, count);
            
            if (value.equalsIgnoreCase("percentage") && !value.equals("Percentage")) {
                jdbcTemplate.update("UPDATE promotions SET type = 'Percentage' WHERE type = ?", value);
                log.warn("  ✓ Fixed: {} -> Percentage", value);
            } else if (value.equalsIgnoreCase("fixed") && !value.equals("Fixed")) {
                jdbcTemplate.update("UPDATE promotions SET type = 'Fixed' WHERE type = ?", value);
                log.warn("  ✓ Fixed: {} -> Fixed", value);
            }
        });

        log.info("Checking promotion status...");
        List<Map<String, Object>> statuses = jdbcTemplate.queryForList(
            "SELECT status, COUNT(*) as count FROM promotions GROUP BY status"
        );
        
        statuses.forEach(status -> {
            String value = (String) status.get("status");
            Long count = (Long) status.get("count");
            log.info("  Promotion Status: {} (count: {})", value, count);
            
            String correctValue = fixPromotionStatusCase(value);
            if (!value.equals(correctValue)) {
                jdbcTemplate.update("UPDATE promotions SET status = ? WHERE status = ?", correctValue, value);
                log.warn("  ✓ Fixed: {} -> {}", value, correctValue);
            }
        });
    }

    private String fixPromotionStatusCase(String value) {
        if (value.equalsIgnoreCase("active")) return "Active";
        if (value.equalsIgnoreCase("inactive")) return "Inactive";
        if (value.equalsIgnoreCase("expired")) return "Expired";
        return value;
    }

    private void checkAndFixPaymentStatus() {
        log.info("Checking payment status...");
        List<Map<String, Object>> statuses = jdbcTemplate.queryForList(
            "SELECT status, COUNT(*) as count FROM payments GROUP BY status"
        );
        
        statuses.forEach(status -> {
            String value = (String) status.get("status");
            Long count = (Long) status.get("count");
            log.info("  Payment Status: {} (count: {})", value, count);
            
            String correctValue = fixPaymentStatusCase(value);
            if (!value.equals(correctValue)) {
                jdbcTemplate.update("UPDATE payments SET status = ? WHERE status = ?", correctValue, value);
                log.warn("  ✓ Fixed: {} -> {}", value, correctValue);
            }
        });
    }

    private String fixPaymentStatusCase(String value) {
        if (value.equalsIgnoreCase("pending")) return "Pending";
        if (value.equalsIgnoreCase("completed")) return "Completed";
        if (value.equalsIgnoreCase("failed")) return "Failed";
        if (value.equalsIgnoreCase("refunded")) return "Refunded";
        return value;
    }

    private void checkAndFixPartnerType() {
        log.info("Checking partner type...");
        List<Map<String, Object>> types = jdbcTemplate.queryForList(
            "SELECT type, COUNT(*) as count FROM partners GROUP BY type"
        );
        
        types.forEach(type -> {
            String value = (String) type.get("type");
            Long count = (Long) type.get("count");
            log.info("  Partner Type: {} (count: {})", value, count);
            
            String correctValue = fixPartnerTypeCase(value);
            if (!value.equals(correctValue)) {
                jdbcTemplate.update("UPDATE partners SET type = ? WHERE type = ?", correctValue, value);
                log.warn("  ✓ Fixed: {} -> {}", value, correctValue);
            }
        });
    }

    private String fixPartnerTypeCase(String value) {
        if (value.equalsIgnoreCase("hotel")) return "Hotel";
        if (value.equalsIgnoreCase("restaurant")) return "Restaurant";
        if (value.equalsIgnoreCase("transport")) return "Transport";
        if (value.equalsIgnoreCase("touroperator") || value.equalsIgnoreCase("tour_operator")) return "TourOperator";
        if (value.equalsIgnoreCase("service")) return "Service";
        return value;
    }

    private void checkAndFixCancellationPolicy() {
        log.info("Checking cancellation policy type...");
        List<Map<String, Object>> types = jdbcTemplate.queryForList(
            "SELECT policy_type, COUNT(*) as count FROM cancellation_policies GROUP BY policy_type"
        );
        
        types.forEach(type -> {
            String value = (String) type.get("policy_type");
            Long count = (Long) type.get("count");
            log.info("  Policy Type: {} (count: {})", value, count);
            
            if (!value.equals(value.toUpperCase())) {
                String upperValue = value.toUpperCase();
                jdbcTemplate.update("UPDATE cancellation_policies SET policy_type = ? WHERE policy_type = ?", upperValue, value);
                log.warn("  ✓ Fixed: {} -> {}", value, upperValue);
            }
        });

        log.info("Checking cancellation policy status...");
        List<Map<String, Object>> statuses = jdbcTemplate.queryForList(
            "SELECT status, COUNT(*) as count FROM cancellation_policies GROUP BY status"
        );
        
        statuses.forEach(status -> {
            String value = (String) status.get("status");
            Long count = (Long) status.get("count");
            log.info("  Policy Status: {} (count: {})", value, count);
            
            if (!value.equals(value.toUpperCase())) {
                String upperValue = value.toUpperCase();
                jdbcTemplate.update("UPDATE cancellation_policies SET status = ? WHERE status = ?", upperValue, value);
                log.warn("  ✓ Fixed: {} -> {}", value, upperValue);
            }
        });
    }

    private void checkAndFixContinent() {
        log.info("Checking continent...");
        List<Map<String, Object>> continents = jdbcTemplate.queryForList(
            "SELECT continent, COUNT(*) as count FROM countries GROUP BY continent"
        );
        
        continents.forEach(continent -> {
            String value = (String) continent.get("continent");
            Long count = (Long) continent.get("count");
            log.info("  Continent: {} (count: {})", value, count);
            
            if (!value.equals(value.toUpperCase())) {
                String upperValue = value.toUpperCase();
                jdbcTemplate.update("UPDATE countries SET continent = ? WHERE continent = ?", upperValue, value);
                log.warn("  ✓ Fixed: {} -> {}", value, upperValue);
            }
        });
    }
}
