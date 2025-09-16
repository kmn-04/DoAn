package backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class RoleMigration implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("🔄 Checking role migration...");
            
            // Check if migration is needed
            String checkSql = "SELECT COUNT(*) FROM users WHERE role = 'CUSTOMER'";
            Integer customerCount = jdbcTemplate.queryForObject(checkSql, Integer.class);
            
            if (customerCount != null && customerCount > 0) {
                System.out.println("📝 Found " + customerCount + " users with CUSTOMER role. Updating to USER...");
                
                // Update existing CUSTOMER users to USER
                String updateSql = "UPDATE users SET role = 'USER' WHERE role = 'CUSTOMER'";
                int updated = jdbcTemplate.update(updateSql);
                System.out.println("✅ Updated " + updated + " users from CUSTOMER to USER");
            }
            
            // Try to alter table enum (this might fail if already done)
            try {
                String alterSql = "ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'STAFF', 'USER') NOT NULL DEFAULT 'USER'";
                jdbcTemplate.execute(alterSql);
                System.out.println("✅ Updated role enum to ADMIN, STAFF, USER");
            } catch (Exception e) {
                System.out.println("ℹ️ Role enum already updated or failed: " + e.getMessage());
            }
            
            System.out.println("🎉 Role migration completed!");
            
        } catch (Exception e) {
            System.err.println("❌ Role migration failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
