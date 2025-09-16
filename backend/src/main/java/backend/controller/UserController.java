package backend.controller;

import backend.dto.UserDto;
import backend.dto.UserCreateRequest;
import backend.dto.UserUpdateRequest;
import backend.model.Role;
import backend.model.User;
import backend.repository.UserRepository;
import backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Lấy danh sách người dùng với phân trang và lọc
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        
        try {
            System.out.println("🔍 getUsersRequest - page: " + page + ", size: " + size + ", role: " + role + ", isActive: " + isActive + ", search: " + search + ", fromDate: " + fromDate + ", toDate: " + toDate);
            
            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            // Parse date strings to LocalDateTime
            LocalDateTime fromDateTime = null;
            LocalDateTime toDateTime = null;
            
            try {
                if (fromDate != null && !fromDate.isEmpty()) {
                    System.out.println("📅 Parsing fromDate: " + fromDate);
                    fromDateTime = LocalDate.parse(fromDate).atStartOfDay();
                    System.out.println("📅 Parsed fromDateTime: " + fromDateTime);
                }
                if (toDate != null && !toDate.isEmpty()) {
                    System.out.println("📅 Parsing toDate: " + toDate);
                    toDateTime = LocalDate.parse(toDate).atTime(23, 59, 59);
                    System.out.println("📅 Parsed toDateTime: " + toDateTime);
                }
            } catch (Exception e) {
                System.err.println("❌ Date parsing error: " + e.getMessage());
                e.printStackTrace();
            }
            
            // Use custom repository method with all filters including dates
            Page<User> userPage = userRepository.findUsersWithFilters(
                search, role, isActive, fromDateTime, toDateTime, pageable);
            
            System.out.println("📊 Query result: " + userPage.getTotalElements() + " users found");
            if (userPage.hasContent()) {
                userPage.getContent().forEach(user -> {
                    System.out.println("👤 User: " + user.getFullName() + " - Created: " + user.getCreatedAt());
                });
            }
            
            
            List<UserDto> userDtos = userPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("users", userDtos);
            response.put("totalElements", userPage.getTotalElements());
            response.put("totalPages", userPage.getTotalPages());
            response.put("currentPage", userPage.getNumber());
            response.put("size", userPage.getSize());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching users: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Có lỗi xảy ra khi lấy danh sách người dùng");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Lấy thông tin người dùng theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #id)")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
            
            return ResponseEntity.ok(convertToDto(user));
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Không tìm thấy người dùng");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Test endpoint for roles
    @GetMapping("/test-roles")
    public ResponseEntity<?> testRoles() {
        Map<String, Object> response = new HashMap<>();
        response.put("availableRoles", Role.values());
        response.put("message", "Available roles in system");
        return ResponseEntity.ok(response);
    }
    
    // Tạo người dùng mới
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@Valid @RequestBody UserCreateRequest createRequest) {
        try {
            System.out.println("🔍 Creating user with role: " + createRequest.getRole());
            
            // Kiểm tra username đã tồn tại
            if (userRepository.existsByUsername(createRequest.getUsername())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Tên đăng nhập đã tồn tại");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Kiểm tra email đã tồn tại
            if (userRepository.existsByEmail(createRequest.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email đã được sử dụng");
                return ResponseEntity.badRequest().body(error);
            }
            
            User user = new User();
            user.setUsername(createRequest.getUsername());
            user.setEmail(createRequest.getEmail());
            user.setPassword(passwordEncoder.encode(createRequest.getPassword()));
            user.setFullName(createRequest.getFullName());
            user.setPhone(createRequest.getPhone());
            user.setAddress(createRequest.getAddress());
            user.setRole(createRequest.getRole());
            user.setIsActive(createRequest.getIsActive());
            user.setAvatarUrl(createRequest.getAvatarUrl());
            
            User savedUser = userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Tạo người dùng thành công");
            response.put("user", convertToDto(savedUser));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error creating user: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("message", "Có lỗi xảy ra khi tạo người dùng");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Cập nhật người dùng
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(authentication, #id)")
    public ResponseEntity<?> updateUser(@PathVariable Long id, 
                                       @Valid @RequestBody UserUpdateRequest updateRequest,
                                       @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
            
            // Kiểm tra quyền thay đổi role (chỉ ADMIN mới được phép)
            if (updateRequest.getRole() != null && 
                !updateRequest.getRole().equals(user.getRole()) && 
                !currentUser.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"))) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Bạn không có quyền thay đổi vai trò người dùng");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Kiểm tra username nếu thay đổi
            if (updateRequest.getUsername() != null && 
                !updateRequest.getUsername().equals(user.getUsername()) &&
                userRepository.existsByUsername(updateRequest.getUsername())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Tên đăng nhập đã tồn tại");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Kiểm tra email nếu thay đổi
            if (updateRequest.getEmail() != null && 
                !updateRequest.getEmail().equals(user.getEmail()) &&
                userRepository.existsByEmail(updateRequest.getEmail())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email đã được sử dụng");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Cập nhật thông tin
            if (updateRequest.getUsername() != null) {
                user.setUsername(updateRequest.getUsername());
            }
            if (updateRequest.getEmail() != null) {
                user.setEmail(updateRequest.getEmail());
            }
            if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
            }
            if (updateRequest.getFullName() != null) {
                user.setFullName(updateRequest.getFullName());
            }
            if (updateRequest.getPhone() != null) {
                user.setPhone(updateRequest.getPhone());
            }
            if (updateRequest.getAddress() != null) {
                user.setAddress(updateRequest.getAddress());
            }
            if (updateRequest.getRole() != null) {
                user.setRole(updateRequest.getRole());
            }
            if (updateRequest.getIsActive() != null) {
                user.setIsActive(updateRequest.getIsActive());
            }
            if (updateRequest.getAvatarUrl() != null) {
                user.setAvatarUrl(updateRequest.getAvatarUrl());
            }
            
            User updatedUser = userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật người dùng thành công");
            response.put("user", convertToDto(updatedUser));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Có lỗi xảy ra khi cập nhật người dùng");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Xóa người dùng
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
            
            // Ngăn admin tự xóa tài khoản của mình
            if (currentUser.getId().equals(id)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Bạn không thể xóa tài khoản của chính mình");
                return ResponseEntity.badRequest().body(error);
            }
            
            userRepository.delete(user);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Xóa người dùng thành công");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Có lỗi xảy ra khi xóa người dùng");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Xóa nhiều người dùng
    @DeleteMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUsers(@RequestBody List<Long> userIds, @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            // Ngăn admin tự xóa tài khoản của mình
            if (userIds.contains(currentUser.getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Bạn không thể xóa tài khoản của chính mình");
                return ResponseEntity.badRequest().body(error);
            }
            
            List<User> usersToDelete = userRepository.findAllById(userIds);
            userRepository.deleteAll(usersToDelete);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Xóa " + usersToDelete.size() + " người dùng thành công");
            response.put("deletedCount", usersToDelete.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Có lỗi xảy ra khi xóa người dùng");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Thay đổi trạng thái một người dùng
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long id, @RequestBody Map<String, Object> request, @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));
            
            // Ngăn admin tự thay đổi trạng thái của mình
            if (currentUser.getId().equals(id)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Bạn không thể thay đổi trạng thái của chính mình");
                return ResponseEntity.badRequest().body(error);
            }
            
            Boolean isActive = (Boolean) request.get("isActive");
            user.setIsActive(isActive);
            User updatedUser = userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật trạng thái người dùng thành công");
            response.put("user", convertToDto(updatedUser));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Có lỗi xảy ra khi cập nhật trạng thái người dùng");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Thay đổi trạng thái nhiều người dùng
    @PutMapping("/bulk/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUsersStatus(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> userIds = (List<Long>) request.get("userIds");
            Boolean isActive = (Boolean) request.get("isActive");
            
            List<User> users = userRepository.findAllById(userIds);
            users.forEach(user -> user.setIsActive(isActive));
            userRepository.saveAll(users);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật trạng thái " + users.size() + " người dùng thành công");
            response.put("updatedCount", users.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Có lỗi xảy ra khi cập nhật trạng thái người dùng");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Thay đổi vai trò nhiều người dùng
    @PutMapping("/bulk/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUsersRole(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Long> userIds = (List<Long>) request.get("userIds");
            String roleString = (String) request.get("role");
            Role role = Role.valueOf(roleString);
            
            List<User> users = userRepository.findAllById(userIds);
            users.forEach(user -> user.setRole(role));
            userRepository.saveAll(users);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cập nhật vai trò " + users.size() + " người dùng thành công");
            response.put("updatedCount", users.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Có lỗi xảy ra khi cập nhật vai trò người dùng");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Lấy thông tin profile của user hiện tại
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            User user = userRepository.findByUsername(userPrincipal.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            
            return ResponseEntity.ok(convertToDto(user));
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Có lỗi xảy ra khi lấy thông tin profile");
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get user statistics overview (for dashboard cards)
     */
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> getUserStats() {
        try {
            System.out.println("📊 Getting user statistics overview...");

            // Get total counts
            long totalUsers = userRepository.count();
            long activeUsers = userRepository.countByIsActive(true);
            long inactiveUsers = userRepository.countByIsActive(false);
            long unverifiedUsers = userRepository.countByEmailVerified(false);

            // Get role breakdown
            long adminCount = userRepository.countByRole(Role.ADMIN);
            long staffCount = userRepository.countByRole(Role.STAFF);
            long userCount = userRepository.countByRole(Role.USER);

            Map<String, Object> stats = new HashMap<>();
            
            // Main stats for cards
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
            stats.put("inactiveUsers", inactiveUsers);
            stats.put("unverifiedUsers", unverifiedUsers);
            
            // Additional breakdown
            Map<String, Long> roleBreakdown = new HashMap<>();
            roleBreakdown.put("admin", adminCount);
            roleBreakdown.put("staff", staffCount);
            roleBreakdown.put("user", userCount);
            stats.put("roleBreakdown", roleBreakdown);

            // Calculate percentages
            if (totalUsers > 0) {
                stats.put("activePercentage", Math.round((activeUsers * 100.0) / totalUsers));
                stats.put("inactivePercentage", Math.round((inactiveUsers * 100.0) / totalUsers));
                stats.put("unverifiedPercentage", Math.round((unverifiedUsers * 100.0) / totalUsers));
            } else {
                stats.put("activePercentage", 0);
                stats.put("inactivePercentage", 0);
                stats.put("unverifiedPercentage", 0);
            }

            System.out.println("📈 Stats calculated - Total: " + totalUsers + 
                             ", Active: " + activeUsers + 
                             ", Inactive: " + inactiveUsers + 
                             ", Unverified: " + unverifiedUsers);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            System.err.println("❌ Error getting user stats: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Error getting user statistics"));
        }
    }

    // Convert User entity to DTO
    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole());
        dto.setIsActive(user.getIsActive());
        dto.setEmailVerified(user.getEmailVerified());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }
}

