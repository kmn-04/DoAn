package backend.controller;

import backend.dto.response.ApiResponse;
import backend.entity.Role;
import backend.repository.RoleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Role Management", description = "APIs for managing roles")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class RoleController extends BaseController {
    
    private final RoleRepository roleRepository;
    
    @GetMapping
    @Operation(summary = "Get all roles", description = "Get all available roles in the system")
    public ResponseEntity<ApiResponse<List<Role>>> getAllRoles() {
        try {
            log.info("Fetching all roles");
            List<Role> roles = roleRepository.findAll();
            log.info("Found {} roles", roles.size());
            return ResponseEntity.ok(success("Roles retrieved successfully", roles));
        } catch (Exception e) {
            log.error("Error fetching roles", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to fetch roles: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID", description = "Get a specific role by its ID")
    public ResponseEntity<ApiResponse<Role>> getRoleById(@PathVariable Long id) {
        try {
            log.info("Fetching role with ID: {}", id);
            Role role = roleRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));
            return ResponseEntity.ok(success("Role retrieved successfully", role));
        } catch (Exception e) {
            log.error("Error fetching role with ID: {}", id, e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to fetch role: " + e.getMessage()));
        }
    }
    
    @GetMapping("/name/{name}")
    @Operation(summary = "Get role by name", description = "Get a specific role by its name")
    public ResponseEntity<ApiResponse<Role>> getRoleByName(@PathVariable String name) {
        try {
            log.info("Fetching role with name: {}", name);
            Role role = roleRepository.findByNameIgnoreCase(name)
                    .orElseThrow(() -> new RuntimeException("Role not found with name: " + name));
            return ResponseEntity.ok(success("Role retrieved successfully", role));
        } catch (Exception e) {
            log.error("Error fetching role with name: {}", name, e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to fetch role: " + e.getMessage()));
        }
    }
}

