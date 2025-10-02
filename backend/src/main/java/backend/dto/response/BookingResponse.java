package backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private LocalDate startDate;
    
    // Customer information
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String customerAddress;
    
    // Participants
    private Integer numAdults;
    private Integer numChildren;
    private Integer numInfants;
    private Integer totalPeople;
    
    // Price information
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    
    // Status
    private String confirmationStatus;
    private String paymentStatus;
    
    // Additional info
    private String specialRequests;
    private String contactPhone;
    
    // Cancellation
    private String cancellationReason;
    private Long cancelledBy;
    private LocalDateTime cancelledAt;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Related data
    private TourInfo tour;
    private TourScheduleInfo schedule;
    private PromotionInfo promotion;
    private List<ParticipantInfo> participants;
    private List<PaymentInfo> payments;
    private List<TourItineraryInfo> itineraries;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourInfo {
        private Long id;
        private String name;
        private String slug;
        private String mainImage;
        private Integer duration;
        private String departureLocation;
        private String destination;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourScheduleInfo {
        private Long id;
        private LocalDate departureDate;
        private LocalDate returnDate;
        private Integer availableSeats;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromotionInfo {
        private Long id;
        private String code;
        private String name;
        private BigDecimal discountValue;
        private String discountType;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo {
        private Long id;
        private String fullName;
        private String gender;
        private LocalDate dateOfBirth;
        private String nationality;
        private String passportNumber;
        private LocalDate passportExpiry;
        private String participantType;
        private String specialRequirements;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        private Long id;
        private String paymentCode;
        private BigDecimal amount;
        private String paymentMethod;
        private String paymentProvider;
        private String status;
        private LocalDateTime paidAt;
        private LocalDateTime createdAt;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TourItineraryInfo {
        private Long id;
        private Integer dayNumber;
        private String title;
        private String description;
        private List<String> activities;
        private String meals;
        private String accommodation;
        private PartnerInfo accommodationPartner;
        private PartnerInfo mealsPartner;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartnerInfo {
        private Long id;
        private String name;
        private String type;
        private String address;
        private Double rating;
    }
}