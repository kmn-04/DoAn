package backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TestController {

    @GetMapping("/public")
    public ResponseEntity<?> testPublic() {
        return ResponseEntity.ok(Map.of(
            "message", "Public endpoint working",
            "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> testUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(Map.of(
            "message", "User endpoint working",
            "user", auth.getName(),
            "authorities", auth.getAuthorities(),
            "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(Map.of(
            "message", "Admin endpoint working",
            "user", auth.getName(),
            "authorities", auth.getAuthorities(),
            "timestamp", System.currentTimeMillis()
        ));
    }

    @GetMapping("/categories-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testCategoriesAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(Map.of(
            "message", "Categories admin endpoint working",
            "user", auth.getName(),
            "authorities", auth.getAuthorities(),
            "timestamp", System.currentTimeMillis()
        ));
    }
}