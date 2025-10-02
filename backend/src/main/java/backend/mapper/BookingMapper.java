package backend.mapper;

import backend.dto.response.BookingResponse;
import backend.entity.Booking;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class BookingMapper {
    
    public BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }
        
        BookingResponse response = new BookingResponse();
        
        // Basic info
        response.setId(booking.getId());
        response.setBookingCode(booking.getBookingCode());
        response.setConfirmationStatus(booking.getConfirmationStatus() != null ? 
                booking.getConfirmationStatus().name() : null);
        response.setPaymentStatus(booking.getPaymentStatus() != null ? 
                booking.getPaymentStatus().name() : null);
        
        // Pricing
        response.setTotalPrice(booking.getFinalAmount()); // Use finalAmount as totalPrice
        response.setDiscountAmount(booking.getDiscountAmount());
        response.setFinalAmount(booking.getFinalAmount());
        
        // Participant details
        response.setNumAdults(booking.getNumAdults());
        response.setNumChildren(booking.getNumChildren());
        response.setNumInfants(booking.getNumInfants());
        response.setTotalPeople(booking.getNumAdults() + booking.getNumChildren() + booking.getNumInfants());
        
        // Dates
        response.setStartDate(booking.getStartDate());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        
        // Customer info from User
        if (booking.getUser() != null) {
            response.setCustomerName(booking.getUser().getName());
            response.setCustomerEmail(booking.getUser().getEmail());
            response.setCustomerPhone(booking.getUser().getPhone());
        }
        
        // Notes
        response.setSpecialRequests(booking.getSpecialRequests());
        response.setCancellationReason(booking.getCancellationReason());
        response.setCancelledAt(booking.getCancelledAt());
        response.setCancelledBy(booking.getCancelledBy());
        
        // Tour info
        if (booking.getTour() != null) {
            BookingResponse.TourInfo tourInfo = new BookingResponse.TourInfo();
            tourInfo.setId(booking.getTour().getId());
            tourInfo.setName(booking.getTour().getName());
            tourInfo.setSlug(booking.getTour().getSlug());
            tourInfo.setDuration(booking.getTour().getDuration());
            tourInfo.setMainImage(booking.getTour().getMainImage());
            response.setTour(tourInfo);
        }
        
        // Promotion info
        if (booking.getPromotion() != null) {
            BookingResponse.PromotionInfo promotionInfo = new BookingResponse.PromotionInfo();
            promotionInfo.setId(booking.getPromotion().getId());
            promotionInfo.setCode(booking.getPromotion().getCode());
            promotionInfo.setDiscountValue(booking.getPromotion().getValue());
            promotionInfo.setDiscountType(booking.getPromotion().getType() != null ? 
                    booking.getPromotion().getType().name() : null);
            // Note: Promotion entity doesn't have 'name' field
            response.setPromotion(promotionInfo);
        }
        
        // Participants
        if (booking.getParticipants() != null && !booking.getParticipants().isEmpty()) {
            response.setParticipants(booking.getParticipants().stream()
                    .map(participant -> {
                        BookingResponse.ParticipantInfo info = new BookingResponse.ParticipantInfo();
                        info.setId(participant.getId());
                        info.setFullName(participant.getFullName());
                        info.setDateOfBirth(participant.getDateOfBirth());
                        info.setGender(participant.getGender() != null ? participant.getGender().name() : null);
                        info.setParticipantType(participant.getParticipantType() != null ? 
                                participant.getParticipantType().name() : null);
                        info.setPassportNumber(participant.getPassportNumber());
                        return info;
                    })
                    .collect(Collectors.toList()));
        }
        
        return response;
    }
}

