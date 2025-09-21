package backend.controller;

import backend.dto.request.LoginRequest;
import backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/simple")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class SimpleTestController {
    
    private final AuthService authService;
    
    @PostMapping("/test-login")
    public ResponseEntity<Map<String, Object>> testLogin(@RequestBody LoginRequest request) {
        try {
            var authResponse = authService.login(request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("token", authResponse.getToken());
            response.put("userEmail", authResponse.getUser().getEmail());
            response.put("userName", authResponse.getUser().getName());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("class", e.getClass().getSimpleName());
            return ResponseEntity.ok(response);
        }
    }
}
