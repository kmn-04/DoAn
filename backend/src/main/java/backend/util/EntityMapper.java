package backend.util;

import backend.dto.response.UserResponse;
import backend.dto.response.TourResponse;
import backend.dto.response.CategoryResponse;
import backend.dto.response.BookingResponse;
import backend.dto.response.BookingCancellationResponse;
import backend.entity.*;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityMapper {
    
    /**
     * Convert User entity to UserResponse
     */
    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setStatus(user.getStatus() != null ? user.getStatus().toString() : null);
        response.setAvatarUrl(user.getAvatarUrl());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setEmailVerifiedAt(user.getEmailVerifiedAt());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        
        // Convert role
        if (user.getRole() != null) {
            UserResponse.RoleResponse roleResponse = new UserResponse.RoleResponse();
            roleResponse.setId(user.getRole().getId());
            roleResponse.setName(user.getRole().getName());
            response.setRole(roleResponse);
        }
        
        return response;
    }
    
    /**
     * Convert User entity list to UserResponse list
     */
    public List<UserResponse> toUserResponseList(List<User> users) {
        if (users == null) return null;
        return users.stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert Tour entity to TourResponse
     */
    public TourResponse toTourResponse(Tour tour) {
        if (tour == null) return null;
        
        TourResponse response = new TourResponse();
        response.setId(tour.getId());
        response.setName(tour.getName());
        response.setSlug(tour.getSlug());
        response.setShortDescription(tour.getShortDescription());
        response.setDescription(tour.getDescription());
        response.setPrice(tour.getPrice());
        response.setSalePrice(tour.getSalePrice());
        response.setDuration(tour.getDuration());
        response.setMaxPeople(tour.getMaxPeople());
        response.setIsFeatured(tour.getIsFeatured());
        response.setStatus(tour.getStatus() != null ? tour.getStatus().toString() : null);
        response.setCreatedAt(tour.getCreatedAt());
        response.setUpdatedAt(tour.getUpdatedAt());
        
        // Convert category
        if (tour.getCategory() != null) {
            TourResponse.CategoryResponse categoryResponse = new TourResponse.CategoryResponse();
            categoryResponse.setId(tour.getCategory().getId());
            categoryResponse.setName(tour.getCategory().getName());
            categoryResponse.setSlug(tour.getCategory().getSlug());
            categoryResponse.setImageUrl(tour.getCategory().getImageUrl());
            response.setCategory(categoryResponse);
        }
        
        return response;
    }
    
    /**
     * Convert Tour entity list to TourResponse list
     */
    public List<TourResponse> toTourResponseList(List<Tour> tours) {
        if (tours == null) return null;
        return tours.stream()
                .map(this::toTourResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert Category entity to CategoryResponse
     */
    public CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setDescription(category.getDescription());
        response.setImageUrl(category.getImageUrl());
        response.setStatus(category.getStatus() != null ? category.getStatus().toString() : null);
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        
        return response;
    }
    
    /**
     * Convert Category entity list to CategoryResponse list
     */
    public List<CategoryResponse> toCategoryResponseList(List<Category> categories) {
        if (categories == null) return null;
        return categories.stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert Booking entity to BookingResponse
     */
    public BookingResponse toBookingResponse(Booking booking) {
        if (booking == null) return null;
        
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setBookingCode(booking.getBookingCode());
        response.setStartDate(booking.getStartDate());
        response.setNumAdults(booking.getNumAdults());
        response.setNumChildren(booking.getNumChildren());
        response.setTotalPeople(booking.getTotalPeople());
        response.setTotalPrice(booking.getTotalPrice());
        response.setSpecialRequests(booking.getSpecialRequests());
        response.setContactPhone(booking.getContactPhone());
        response.setStatus(booking.getStatus() != null ? booking.getStatus().toString() : null);
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        
        // Convert user
        if (booking.getUser() != null) {
            BookingResponse.UserSummary userSummary = new BookingResponse.UserSummary();
            userSummary.setId(booking.getUser().getId());
            userSummary.setName(booking.getUser().getName());
            userSummary.setEmail(booking.getUser().getEmail());
            response.setUser(userSummary);
        }
        
        // Convert tour
        if (booking.getTour() != null) {
            BookingResponse.TourSummary tourSummary = new BookingResponse.TourSummary();
            tourSummary.setId(booking.getTour().getId());
            tourSummary.setName(booking.getTour().getName());
            tourSummary.setSlug(booking.getTour().getSlug());
            tourSummary.setPrice(booking.getTour().getPrice());
            tourSummary.setDuration(booking.getTour().getDuration());
            response.setTour(tourSummary);
        }
        
        return response;
    }
    
    /**
     * Convert Booking entity list to BookingResponse list
     */
    public List<BookingResponse> toBookingResponseList(List<Booking> bookings) {
        if (bookings == null) return null;
        return bookings.stream()
                .map(this::toBookingResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Convert BookingCancellation entity to BookingCancellationResponse
     */
    public BookingCancellationResponse toBookingCancellationResponse(BookingCancellation cancellation) {
        if (cancellation == null) return null;
        
        BookingCancellationResponse response = new BookingCancellationResponse();
        response.setId(cancellation.getId());
        response.setReason(cancellation.getReason());
        response.setReasonCategory(cancellation.getReasonCategory());
        response.setAdditionalNotes(cancellation.getAdditionalNotes());
        response.setOriginalAmount(cancellation.getOriginalAmount());
        response.setRefundPercentage(cancellation.getRefundPercentage());
        response.setRefundAmount(cancellation.getRefundAmount());
        response.setCancellationFee(cancellation.getCancellationFee());
        response.setProcessingFee(cancellation.getProcessingFee());
        response.setFinalRefundAmount(cancellation.getFinalRefundAmount());
        response.setHoursBeforeDeparture(cancellation.getHoursBeforeDeparture());
        response.setDepartureDate(cancellation.getDepartureDate());
        response.setCancelledAt(cancellation.getCancelledAt());
        response.setStatus(cancellation.getStatus());
        response.setRefundStatus(cancellation.getRefundStatus());
        response.setIsMedicalEmergency(cancellation.getIsMedicalEmergency());
        response.setIsWeatherRelated(cancellation.getIsWeatherRelated());
        response.setIsForceMajeure(cancellation.getIsForceMajeure());
        response.setRefundTransactionId(cancellation.getRefundTransactionId());
        response.setRefundMethod(cancellation.getRefundMethod());
        response.setRefundProcessedAt(cancellation.getRefundProcessedAt());
        response.setAdminNotes(cancellation.getAdminNotes());
        response.setProcessedAt(cancellation.getProcessedAt());
        response.setCreatedAt(cancellation.getCreatedAt());
        response.setUpdatedAt(cancellation.getUpdatedAt());
        
        // Convert supporting documents from comma-separated string to list
        if (cancellation.getSupportingDocuments() != null && !cancellation.getSupportingDocuments().trim().isEmpty()) {
            response.setSupportingDocuments(List.of(cancellation.getSupportingDocuments().split(",")));
        }
        
        // Convert booking summary
        if (cancellation.getBooking() != null) {
            BookingCancellationResponse.BookingSummary bookingSummary = new BookingCancellationResponse.BookingSummary();
            bookingSummary.setId(cancellation.getBooking().getId());
            bookingSummary.setBookingCode(cancellation.getBooking().getBookingCode());
            bookingSummary.setStartDate(cancellation.getBooking().getStartDate().atStartOfDay());
            bookingSummary.setTotalPeople(cancellation.getBooking().getTotalPeople());
            bookingSummary.setTotalPrice(cancellation.getBooking().getTotalPrice());
            bookingSummary.setStatus(cancellation.getBooking().getStatus() != null ? cancellation.getBooking().getStatus().toString() : null);
            
            if (cancellation.getBooking().getTour() != null) {
                bookingSummary.setTourName(cancellation.getBooking().getTour().getName());
            }
            
            response.setBooking(bookingSummary);
        }
        
        // Convert cancelled by user
        if (cancellation.getCancelledBy() != null) {
            BookingCancellationResponse.UserSummary userSummary = new BookingCancellationResponse.UserSummary();
            userSummary.setId(cancellation.getCancelledBy().getId());
            userSummary.setName(cancellation.getCancelledBy().getName());
            userSummary.setEmail(cancellation.getCancelledBy().getEmail());
            userSummary.setPhone(cancellation.getCancelledBy().getPhone());
            response.setCancelledBy(userSummary);
        }
        
        // Convert processed by user
        if (cancellation.getProcessedBy() != null) {
            BookingCancellationResponse.UserSummary processedByUser = new BookingCancellationResponse.UserSummary();
            processedByUser.setId(cancellation.getProcessedBy().getId());
            processedByUser.setName(cancellation.getProcessedBy().getName());
            processedByUser.setEmail(cancellation.getProcessedBy().getEmail());
            processedByUser.setPhone(cancellation.getProcessedBy().getPhone());
            response.setProcessedBy(processedByUser);
        }
        
        // Convert cancellation policy
        if (cancellation.getCancellationPolicy() != null) {
            BookingCancellationResponse.CancellationPolicySummary policySummary = new BookingCancellationResponse.CancellationPolicySummary();
            policySummary.setId(cancellation.getCancellationPolicy().getId());
            policySummary.setName(cancellation.getCancellationPolicy().getName());
            policySummary.setPolicyType(cancellation.getCancellationPolicy().getPolicyType() != null ? 
                    cancellation.getCancellationPolicy().getPolicyType().toString() : null);
            policySummary.setHoursBeforeDepartureFullRefund(cancellation.getCancellationPolicy().getHoursBeforeDepartureFullRefund());
            policySummary.setHoursBeforeDeparturePartialRefund(cancellation.getCancellationPolicy().getHoursBeforeDeparturePartialRefund());
            policySummary.setFullRefundPercentage(cancellation.getCancellationPolicy().getFullRefundPercentage());
            policySummary.setPartialRefundPercentage(cancellation.getCancellationPolicy().getPartialRefundPercentage());
            policySummary.setCancellationFee(cancellation.getCancellationPolicy().getCancellationFee());
            policySummary.setProcessingFee(cancellation.getCancellationPolicy().getProcessingFee());
            response.setCancellationPolicy(policySummary);
        }
        
        return response;
    }
    
    public List<BookingCancellationResponse> toBookingCancellationResponseList(List<BookingCancellation> cancellations) {
        if (cancellations == null) return null;
        return cancellations.stream()
                .map(this::toBookingCancellationResponse)
                .collect(Collectors.toList());
    }
}
