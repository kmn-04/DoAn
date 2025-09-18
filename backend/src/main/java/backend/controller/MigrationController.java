package backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/migration")
@PreAuthorize("hasRole('ADMIN')")
public class MigrationController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/run-step-11")
    public ResponseEntity<Map<String, String>> runStep11Migration() {
        try {
            // Kiểm tra xem migration đã chạy chưa
            int count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM migrations WHERE step = 'step_11_update_tours_structure'", 
                Integer.class
            );
            
            if (count > 0) {
                return ResponseEntity.ok(Map.of("status", "Migration already executed"));
            }

            // Xóa các cột không cần thiết (nếu tồn tại)
            try {
                jdbcTemplate.execute("ALTER TABLE tours DROP COLUMN IF EXISTS excluded_services");
            } catch (Exception e) { /* Column may not exist */ }
            
            try {
                jdbcTemplate.execute("ALTER TABLE tours DROP COLUMN IF EXISTS terms_and_policies");
            } catch (Exception e) { /* Column may not exist */ }
            
            try {
                jdbcTemplate.execute("ALTER TABLE tours DROP COLUMN IF EXISTS meta_title");
            } catch (Exception e) { /* Column may not exist */ }
            
            try {
                jdbcTemplate.execute("ALTER TABLE tours DROP COLUMN IF EXISTS meta_description");
            } catch (Exception e) { /* Column may not exist */ }
            
            try {
                jdbcTemplate.execute("ALTER TABLE tours DROP COLUMN IF EXISTS meta_keywords");
            } catch (Exception e) { /* Column may not exist */ }

            // Cập nhật enum status
            jdbcTemplate.execute("ALTER TABLE tours MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE'");

            // Cập nhật các tour có status DRAFT thành ACTIVE
            jdbcTemplate.execute("UPDATE tours SET status = 'ACTIVE' WHERE status = 'DRAFT'");

            // Đổi tên cột departure_location thành location (nếu chưa)
            try {
                jdbcTemplate.execute("ALTER TABLE tours CHANGE COLUMN departure_location location VARCHAR(100)");
            } catch (Exception e) { 
                // Column may already be renamed
            }

            // Tạo index cho location
            try {
                jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_tours_location ON tours(location)");
            } catch (Exception e) { /* Index may already exist */ }

            // Ghi log migration
            jdbcTemplate.execute("INSERT INTO migrations (step, description) VALUES ('step_11_update_tours_structure', 'Simplify tours table structure')");

            return ResponseEntity.ok(Map.of("status", "Migration completed successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/check-structure")
    public ResponseEntity<Map<String, Object>> checkTableStructure() {
        try {
            // Kiểm tra cấu trúc bảng tours
            String sql = "DESCRIBE tours";
            var columns = jdbcTemplate.queryForList(sql);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "columns", columns
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
