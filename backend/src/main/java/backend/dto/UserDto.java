package backend.dto;

import backend.model.Role;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String address;
    private Role role;
    private Boolean isActive;
    private Boolean emailVerified;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

