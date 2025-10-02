package backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactRequestResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private String tourInterest;
    private String status;
    private Long assignedToId;
    private String assignedToName;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

