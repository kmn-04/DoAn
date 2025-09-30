package backend.controller.admin;

import backend.controller.BaseController;
import backend.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/test")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Test", description = "Admin test endpoints")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AdminTestController extends BaseController {
    
    @GetMapping("/hello")
    @Operation(summary = "Test admin endpoint")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testAdmin() {
        Map<String, Object> response = Map.of(
            "message", "Admin endpoint working!",
            "timestamp", LocalDateTime.now(),
            "status", "OK"
        );
        
        return ResponseEntity.ok(success("Admin test successful", response));
    }
    
    @GetMapping("/simple-stats")
    @Operation(summary = "Simple statistics test")
    public ResponseEntity<ApiResponse<Map<String, Object>>> simpleStats() {
        Map<String, Object> stats = Map.of(
            "totalUsers", 10,
            "totalTours", 5,
            "totalBookings", 20,
            "timestamp", LocalDateTime.now()
        );
        
        return ResponseEntity.ok(success("Simple stats retrieved", stats));
    }
}
