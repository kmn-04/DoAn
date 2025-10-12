package backend.controller;

import backend.dto.request.ChangePasswordRequest;
import backend.dto.request.UserUpdateRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.PageResponse;
import backend.dto.response.UserResponse;
import backend.entity.User;
import backend.exception.BadRequestException;
import backend.exception.ResourceNotFoundException;
import backend.service.UserService;
import backend.mapper.EntityMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Management", description = "APIs for managing users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class UserController extends BaseController {
    
    private final UserService userService;
    private final EntityMapper mapper;
    
    @GetMapping
    @Operation(summary = "Get all users with pagination")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);
        Page<User> users = userService.getAllUsers(pageable);
        Page<UserResponse> userResponses = users.map(mapper::toUserResponse);
        
        return ResponseEntity.ok(successPage(userResponses));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search users by keyword")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> searchUsers(
            @Parameter(description = "Search keyword") @RequestParam String keyword,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = createPageable(page, size);
        Page<User> users = userService.searchUsers(keyword, pageable);
        Page<UserResponse> userResponses = users.map(mapper::toUserResponse);
        
        return ResponseEntity.ok(successPage(userResponses));
    }
    
    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        return ResponseEntity.ok(success(mapper.toUserResponse(user)));
    }
    
    @GetMapping("/email/{email}")
    @Operation(summary = "Get user by email")
    public ResponseEntity<ApiResponse<UserResponse>> getUserByEmail(
            @Parameter(description = "User email") @PathVariable String email) {
        
        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        return ResponseEntity.ok(success(mapper.toUserResponse(user)));
    }
    
    @GetMapping("/role/{roleName}")
    @Operation(summary = "Get users by role")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(
            @Parameter(description = "Role name") @PathVariable String roleName) {
        
        List<User> users = userService.getUsersByRole(roleName);
        List<UserResponse> userResponses = mapper.toUserResponseList(users);
        
        return ResponseEntity.ok(success(userResponses));
    }
    
    @PutMapping("/{userId}")
    @Operation(summary = "Update user information")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Valid @RequestBody UserUpdateRequest request) {
        
        log.info("Updating user with ID: {}, request: {}", userId, request);
        
        // Convert request to User entity
        User userUpdate = new User();
        userUpdate.setName(request.getName());
        userUpdate.setPhone(request.getPhone());
        userUpdate.setAddress(request.getAddress());
        userUpdate.setDateOfBirth(request.getDateOfBirth());
        userUpdate.setAvatarUrl(request.getAvatarUrl());
        
        User updatedUser = userService.updateUser(userId, userUpdate);
        
        return ResponseEntity.ok(success("User updated successfully", mapper.toUserResponse(updatedUser)));
    }
    
    @PutMapping("/{userId}/activate")
    @Operation(summary = "Activate user")
    public ResponseEntity<ApiResponse<UserResponse>> activateUser(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        
        User activatedUser = userService.activateUser(userId);
        
        return ResponseEntity.ok(success("User activated successfully", mapper.toUserResponse(activatedUser)));
    }
    
    @PutMapping("/{userId}/deactivate")
    @Operation(summary = "Deactivate user")
    public ResponseEntity<ApiResponse<UserResponse>> deactivateUser(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        
        User deactivatedUser = userService.deactivateUser(userId);
        
        return ResponseEntity.ok(success("User deactivated successfully", mapper.toUserResponse(deactivatedUser)));
    }
    
    @PutMapping("/{userId}/change-password")
    @Operation(summary = "Change user password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        
        if (!request.isPasswordMatching()) {
            throw new BadRequestException("New password and confirm password do not match");
        }
        
        userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
        
        return ResponseEntity.ok(success("Password changed successfully"));
    }
    
    @PutMapping("/{userId}/verify-email")
    @Operation(summary = "Verify user email")
    public ResponseEntity<ApiResponse<UserResponse>> verifyEmail(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        
        User verifiedUser = userService.verifyEmail(userId);
        
        return ResponseEntity.ok(success("Email verified successfully", mapper.toUserResponse(verifiedUser)));
    }
    
    @DeleteMapping("/{userId}")
    @Operation(summary = "Delete user permanently")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        
        userService.deleteUser(userId);
        
        return ResponseEntity.ok(success("User deleted successfully"));
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get user statistics")
    public ResponseEntity<ApiResponse<UserService.UserStatistics>> getUserStatistics() {
        
        UserService.UserStatistics statistics = userService.getUserStatistics();
        
        return ResponseEntity.ok(success(statistics));
    }
    
    @GetMapping("/check-email/{email}")
    @Operation(summary = "Check if email exists")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailExists(
            @Parameter(description = "Email to check") @PathVariable String email) {
        
        boolean exists = userService.emailExists(email);
        
        return ResponseEntity.ok(success("Email check completed", exists));
    }
}
