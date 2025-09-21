package backend.util;

import backend.dto.response.*;
import backend.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityMapper {
    
    /**
     * Convert User to UserResponse
     */
    public UserResponse toUserResponse(User user) {
        if (user == null) return null;
        
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setStatus(user.getStatus().name());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setDateOfBirth(user.getDateOfBirth());
        response.setEmailVerifiedAt(user.getEmailVerifiedAt());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        
        if (user.getRole() != null) {
            response.setRole(new UserResponse.RoleResponse(
                    user.getRole().getId(),
                    user.getRole().getName()
            ));
        }
        
        return response;
    }
    
    /**
     * Convert Tour to TourResponse
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
        response.setEffectivePrice(tour.getEffectivePrice());
        response.setDuration(tour.getDuration());
        response.setMaxPeople(tour.getMaxPeople());
        response.setStatus(tour.getStatus().name());
        response.setIsFeatured(tour.getIsFeatured());
        response.setCreatedAt(tour.getCreatedAt());
        response.setUpdatedAt(tour.getUpdatedAt());
        
        // Category
        if (tour.getCategory() != null) {
            response.setCategory(new TourResponse.CategoryResponse(
                    tour.getCategory().getId(),
                    tour.getCategory().getName(),
                    tour.getCategory().getSlug(),
                    tour.getCategory().getImageUrl()
            ));
        }
        
        // Images
        if (tour.getImages() != null) {
            response.setImages(tour.getImages().stream()
                    .map(img -> new TourResponse.TourImageResponse(img.getId(), img.getImageUrl()))
                    .collect(Collectors.toList()));
        }
        
        // Itineraries
        if (tour.getItineraries() != null) {
            response.setItineraries(tour.getItineraries().stream()
                    .map(this::toTourItineraryResponse)
                    .collect(Collectors.toList()));
        }
        
        // Target Audiences
        if (tour.getTargetAudiences() != null) {
            response.setTargetAudiences(tour.getTargetAudiences().stream()
                    .map(ta -> new TourResponse.TargetAudienceResponse(ta.getId(), ta.getName()))
                    .collect(Collectors.toList()));
        }
        
        return response;
    }
    
    private TourResponse.TourItineraryResponse toTourItineraryResponse(TourItinerary itinerary) {
        TourResponse.PartnerResponse partner = null;
        if (itinerary.getPartner() != null) {
            Partner p = itinerary.getPartner();
            partner = new TourResponse.PartnerResponse(
                    p.getId(), p.getName(), p.getType().name(), p.getAddress(), p.getPhone()
            );
        }
        
        return new TourResponse.TourItineraryResponse(
                itinerary.getId(),
                itinerary.getDayNumber(),
                itinerary.getTitle(),
                itinerary.getDescription(),
                partner
        );
    }
    
    /**
     * Convert Booking to BookingResponse
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
        response.setStatus(booking.getStatus().name());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        
        // User summary
        if (booking.getUser() != null) {
            User user = booking.getUser();
            response.setUser(new BookingResponse.UserSummary(
                    user.getId(), user.getName(), user.getEmail(), user.getPhone()
            ));
        }
        
        // Tour summary
        if (booking.getTour() != null) {
            Tour tour = booking.getTour();
            String mainImage = tour.getImages() != null && !tour.getImages().isEmpty() 
                    ? tour.getImages().iterator().next().getImageUrl() 
                    : null;
            String categoryName = tour.getCategory() != null ? tour.getCategory().getName() : null;
            
            response.setTour(new BookingResponse.TourSummary(
                    tour.getId(), tour.getName(), tour.getSlug(), 
                    tour.getPrice(), tour.getDuration(), categoryName, mainImage
            ));
        }
        
        // Promotion
        if (booking.getPromotion() != null) {
            Promotion promo = booking.getPromotion();
            // Calculate discount amount (simplified)
            response.setPromotion(new BookingResponse.PromotionResponse(
                    promo.getId(), promo.getCode(), promo.getType().name(), 
                    promo.getValue(), promo.getValue() // TODO: Calculate actual discount
            ));
        }
        
        return response;
    }
    
    /**
     * Convert Category to CategoryResponse
     */
    public CategoryResponse toCategoryResponse(Category category) {
        if (category == null) return null;
        
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setDescription(category.getDescription());
        response.setImageUrl(category.getImageUrl());
        response.setStatus(category.getStatus().name());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        
        // Tour count (if needed)
        if (category.getTours() != null) {
            response.setTourCount((long) category.getTours().size());
        }
        
        return response;
    }
    
    /**
     * Convert Review to ReviewResponse
     */
    public ReviewResponse toReviewResponse(Review review) {
        if (review == null) return null;
        
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setStatus(review.getStatus().name());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        
        // User summary
        if (review.getUser() != null) {
            User user = review.getUser();
            response.setUser(new ReviewResponse.UserSummary(
                    user.getId(), user.getName(), user.getAvatarUrl()
            ));
        }
        
        // Tour summary
        if (review.getTour() != null) {
            Tour tour = review.getTour();
            String mainImage = tour.getImages() != null && !tour.getImages().isEmpty() 
                    ? tour.getImages().iterator().next().getImageUrl() 
                    : null;
            
            response.setTour(new ReviewResponse.TourSummary(
                    tour.getId(), tour.getName(), tour.getSlug(), mainImage
            ));
        }
        
        return response;
    }
    
    /**
     * Convert lists
     */
    public List<UserResponse> toUserResponseList(List<User> users) {
        return users.stream().map(this::toUserResponse).collect(Collectors.toList());
    }
    
    public List<TourResponse> toTourResponseList(List<Tour> tours) {
        return tours.stream().map(this::toTourResponse).collect(Collectors.toList());
    }
    
    public List<BookingResponse> toBookingResponseList(List<Booking> bookings) {
        return bookings.stream().map(this::toBookingResponse).collect(Collectors.toList());
    }
    
    public List<CategoryResponse> toCategoryResponseList(List<Category> categories) {
        return categories.stream().map(this::toCategoryResponse).collect(Collectors.toList());
    }
    
    public List<ReviewResponse> toReviewResponseList(List<Review> reviews) {
        return reviews.stream().map(this::toReviewResponse).collect(Collectors.toList());
    }
}
