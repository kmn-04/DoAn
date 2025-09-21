package backend.controller;

import backend.entity.User;
import backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class PasswordUpdateController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PostMapping("/update-passwords")
    public ResponseEntity<Map<String, Object>> updatePasswords() {
        try {
            // Update admin password
            var adminUser = userRepository.findByEmail("admin@gmail.com");
            if (adminUser.isPresent()) {
                User admin = adminUser.get();
                admin.setPassword(passwordEncoder.encode("admin123"));
                userRepository.save(admin);
            }
            
            // Update staff password
            var staffUser = userRepository.findByEmail("staff@gmail.com");
            if (staffUser.isPresent()) {
                User staff = staffUser.get();
                staff.setPassword(passwordEncoder.encode("staff123"));
                userRepository.save(staff);
            }
            
            // Update test password
            var testUser = userRepository.findByEmail("test@test.com");
            if (testUser.isPresent()) {
                User test = testUser.get();
                test.setPassword(passwordEncoder.encode("123456"));
                userRepository.save(test);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Passwords updated successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
}
