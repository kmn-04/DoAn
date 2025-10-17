package backend.controller;

import backend.dto.response.ApiResponse;
import backend.entity.ContactRequest;
import backend.repository.ContactRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Contact", description = "APIs for contact form")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class ContactController extends BaseController {
    
    private final ContactRequestRepository contactRequestRepository;
    
    @PostMapping
    @Operation(summary = "Submit contact form")
    public ResponseEntity<ApiResponse<ContactRequest>> submitContact(@Valid @RequestBody ContactFormRequest request) {
        log.info("Submitting contact from: {}", request.getEmail());
        
        ContactRequest contact = new ContactRequest();
        contact.setName(request.getName());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setSubject(request.getSubject());
        contact.setMessage(request.getMessage());
        contact.setTourInterest(request.getTourInterest());
        contact.setStatus(ContactRequest.ContactStatus.NEW);
        
        ContactRequest savedContact = contactRequestRepository.save(contact);
        
        log.info("Contact submitted successfully with ID: {}", savedContact.getId());
        
        return ResponseEntity.ok(success("Tin nhắn của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ với bạn sớm!", savedContact));
    }
    
    @PostMapping("/partner")
    @Operation(summary = "Submit partner application")
    public ResponseEntity<ApiResponse<ContactRequest>> submitPartnerApplication(@Valid @RequestBody PartnerApplicationRequest request) {
        log.info("Submitting partner application from: {} - {}", request.getCompanyName(), request.getEmail());
        
        ContactRequest application = new ContactRequest();
        application.setName(request.getContactPerson());
        application.setEmail(request.getEmail());
        application.setPhone(request.getPhone());
        application.setSubject("PARTNER_APPLICATION: " + request.getCompanyName());
        application.setMessage(String.format(
            "Công ty: %s\nLĩnh vực: %s\nĐịa điểm: %s\nWebsite: %s\n\nLời nhắn: %s",
            request.getCompanyName(),
            request.getBusinessType(),
            request.getLocation(),
            request.getWebsite() != null ? request.getWebsite() : "Không có",
            request.getMessage() != null ? request.getMessage() : "Không có"
        ));
        application.setTourInterest(request.getBusinessType());
        application.setStatus(ContactRequest.ContactStatus.NEW);
        
        ContactRequest savedApplication = contactRequestRepository.save(application);
        
        log.info("Partner application submitted successfully with ID: {}", savedApplication.getId());
        
        return ResponseEntity.ok(success(
            "Đăng ký hợp tác thành công! Chúng tôi sẽ liên hệ với bạn trong vòng 24-48 giờ.",
            savedApplication
        ));
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactFormRequest {
        @NotBlank(message = "Name is required")
        private String name;
        
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        private String phone;
        private String subject;
        
        @NotBlank(message = "Message is required")
        private String message;
        
        private String tourInterest;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartnerApplicationRequest {
        @NotBlank(message = "Company name is required")
        private String companyName;
        
        @NotBlank(message = "Contact person is required")
        private String contactPerson;
        
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;
        
        @NotBlank(message = "Phone is required")
        private String phone;
        
        @NotBlank(message = "Business type is required")
        private String businessType;
        
        @NotBlank(message = "Location is required")
        private String location;
        
        private String website;
        private String message;
    }
}

