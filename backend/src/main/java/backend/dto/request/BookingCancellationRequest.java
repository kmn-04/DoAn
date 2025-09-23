package backend.dto.request;

import backend.entity.BookingCancellation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingCancellationRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotBlank(message = "Cancellation reason is required")
    @Size(min = 10, max = 500, message = "Reason must be between 10 and 500 characters")
    private String reason;

    @NotNull(message = "Reason category is required")
    private BookingCancellation.CancellationReason reasonCategory;

    @Size(max = 1000, message = "Additional notes cannot exceed 1000 characters")
    private String additionalNotes;

    // Special circumstances flags
    private Boolean isMedicalEmergency = false;
    private Boolean isWeatherRelated = false;
    private Boolean isForceMajeure = false;

    // Supporting documents (file URLs or IDs)
    private List<String> supportingDocuments;

    // Emergency contact information
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;

    // Preferred refund method
    private String preferredRefundMethod; // ORIGINAL_PAYMENT_METHOD, BANK_TRANSFER, VOUCHER

    // Additional customer information
    private String customerNotes;
    
    // Acknowledgment flags
    private Boolean acknowledgesCancellationPolicy = false;
    private Boolean acknowledgesRefundTerms = false;
    private Boolean requestsExpediteProcessing = false;
}
