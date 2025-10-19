package backend.mapper;

import backend.dto.response.*;
import backend.entity.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class EntityMapper {
    
    private final ObjectMapper objectMapper;
    
    // ========== USER MAPPING ==========
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
        
        if (user.getRole() != null) {
            UserResponse.RoleResponse roleResponse = new UserResponse.RoleResponse();
            roleResponse.setId(user.getRole().getId());
            roleResponse.setName(user.getRole().getName());
            response.setRole(roleResponse);
        }
        
        return response;
    }
    
    public List<UserResponse> toUserResponseList(List<User> users) {
        if (users == null) return null;
        return users.stream().map(this::toUserResponse).collect(Collectors.toList());
    }
    
    // ========== TOUR MAPPING ==========
    public TourResponse toTourResponse(Tour tour) {
        return toTourResponse(tour, false);
    }
    
    public TourResponse toTourResponseWithDetails(Tour tour) {
        return toTourResponse(tour, true);
    }
    
    private TourResponse toTourResponse(Tour tour, boolean includeDetails) {
        if (tour == null) return null;
        
        TourResponse response = new TourResponse();
        response.setId(tour.getId());
        response.setName(tour.getName());
        response.setSlug(tour.getSlug());
        response.setShortDescription(tour.getShortDescription());
        response.setDescription(tour.getDescription());
        
        // Pricing
        response.setPrice(tour.getPrice());
        response.setSalePrice(tour.getSalePrice());
        response.setChildPrice(tour.getChildPrice());
        response.setInfantPrice(tour.getInfantPrice());
        response.setEffectivePrice(tour.getEffectivePrice());
        
        // Basic info
        response.setDuration(tour.getDuration());
        response.setMaxPeople(tour.getMaxPeople());
        response.setMinPeople(tour.getMinPeople());
        response.setStatus(tour.getStatus() != null ? tour.getStatus().toString() : null);
        response.setIsFeatured(tour.getIsFeatured());
        response.setMainImage(tour.getMainImage());
        
        // Location
        response.setTourType(tour.getTourType() != null ? tour.getTourType().toString() : null);
        response.setDepartureLocation(tour.getDepartureLocation());
        response.setDestination(tour.getDestination());
        response.setDestinations(parseJsonArray(tour.getDestinations()));
        response.setRegion(tour.getRegion());
        response.setCountryCode(tour.getCountryCode());
        
        // Transportation and accommodation
        response.setTransportation(tour.getTransportation());
        response.setAccommodation(tour.getAccommodation());
        response.setMealsIncluded(tour.getMealsIncluded());
        
        // Services - Parse to arrays
        response.setIncludedServices(parseJsonArray(tour.getIncludedServices()));
        response.setExcludedServices(parseJsonArray(tour.getExcludedServices()));
        response.setNote(tour.getNote());
        response.setCancellationPolicy(tour.getCancellationPolicy());
        
        // Highlights and suitability
        response.setHighlights(parseJsonArray(tour.getHighlights()));
        response.setSuitableFor(tour.getSuitableFor());
        
        // Visa and flight
        response.setVisaRequired(tour.getVisaRequired());
        response.setVisaInfo(tour.getVisaInfo());
        response.setFlightIncluded(tour.getFlightIncluded());
        
        // Statistics
        response.setViewCount(tour.getViewCount());
        
        // Weather coordinates
        response.setLatitude(tour.getLatitude());
        response.setLongitude(tour.getLongitude());
        response.setWeatherEnabled(tour.getWeatherEnabled());
        
        // Timestamps
        response.setCreatedAt(tour.getCreatedAt());
        response.setUpdatedAt(tour.getUpdatedAt());
        
        // Category
        if (tour.getCategory() != null) {
            response.setCategory(toCategoryResponseForTour(tour.getCategory()));
        }
        
        // Images - Always load for detail view
        if (includeDetails) {
            try {
                log.info("🖼️ Mapping images for tour {} (includeDetails={})", tour.getId(), includeDetails);
                if (tour.getImages() != null && !tour.getImages().isEmpty()) {
                    log.info("✅ Found {} images for tour {}", tour.getImages().size(), tour.getId());
                    List<TourResponse.TourImageResponse> imageResponses = tour.getImages().stream()
                            .map(this::toTourImageResponse)
                            .collect(Collectors.toList());
                    response.setImages(imageResponses);
                    log.info("📦 Set {} image responses", imageResponses != null ? imageResponses.size() : 0);
                } else {
                    log.warn("⚠️ No images found for tour {}", tour.getId());
                    response.setImages(new ArrayList<>());
                }
            } catch (Exception e) {
                // Ignore lazy loading exceptions
                log.error("❌ Could not load images for tour {}: {}", tour.getId(), e.getMessage(), e);
                response.setImages(new ArrayList<>());
            }
        } else {
            log.debug("⏩ Skipping images for tour {} (includeDetails=false)", tour.getId());
        }
        
        // Itineraries (with partners) - Only load for detail view
        if (includeDetails) {
            try {
                log.info("🔍 Mapping itineraries for tour {} (includeDetails={})", tour.getId(), includeDetails);
                if (tour.getItineraries() != null && !tour.getItineraries().isEmpty()) {
                    log.info("✅ Found {} itineraries for tour {}", tour.getItineraries().size(), tour.getId());
                    List<TourResponse.TourItineraryResponse> itineraryResponses = toTourItineraryResponseList(tour.getItineraries());
                    response.setItineraries(itineraryResponses);
                    log.info("📦 Set {} itinerary responses", itineraryResponses != null ? itineraryResponses.size() : 0);
                } else {
                    log.warn("⚠️ No itineraries found for tour {}", tour.getId());
                }
            } catch (Exception e) {
                // Ignore lazy loading exceptions
                log.error("❌ Could not load itineraries for tour {}: {}", tour.getId(), e.getMessage(), e);
            }
        } else {
            log.debug("⏩ Skipping itineraries for tour {} (includeDetails=false)", tour.getId());
        }
        
        return response;
    }
    
    public TourResponse.CategoryResponse toCategoryResponseForTour(Category category) {
        if (category == null) return null;
        
        TourResponse.CategoryResponse response = new TourResponse.CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setImageUrl(category.getImageUrl());
        response.setIcon(category.getIcon());
        response.setParentId(category.getParentId());
        response.setIsFeatured(category.getIsFeatured());
        return response;
    }
    
    public TourResponse.TourImageResponse toTourImageResponse(TourImage image) {
        if (image == null) return null;
        
        TourResponse.TourImageResponse response = new TourResponse.TourImageResponse();
        response.setId(image.getId());
        response.setImageUrl(image.getImageUrl());
        response.setCaption(null); // Not available in current entity
        response.setIsPrimary(false); // Additional images are not primary
        return response;
    }
    
    public List<TourResponse> toTourResponseList(List<Tour> tours) {
        if (tours == null) return null;
        return tours.stream().map(this::toTourResponse).collect(Collectors.toList());
    }
    
    // ========== TOUR ITINERARY MAPPING ==========
    public TourResponse.TourItineraryResponse toTourItineraryResponse(TourItinerary itinerary) {
        if (itinerary == null) return null;
        
        TourResponse.TourItineraryResponse response = new TourResponse.TourItineraryResponse();
        response.setId(itinerary.getId());
        response.setDayNumber(itinerary.getDayNumber());
        response.setTitle(itinerary.getTitle());
        response.setDescription(itinerary.getDescription());
        response.setLocation(itinerary.getLocation());
        response.setActivities(parseJsonArray(itinerary.getActivities()));
        response.setMeals(itinerary.getMeals());
        response.setAccommodation(itinerary.getAccommodation());
        response.setImages(parseJsonArray(itinerary.getImages()));
        
        // Map partners - Handle lazy loading carefully
        try {
            if (itinerary.getPartner() != null) {
                response.setPartner(toPartnerSummary(itinerary.getPartner()));
            }
        } catch (Exception e) {
            log.debug("Could not load partner for itinerary {}: {}", itinerary.getId(), e.getMessage());
        }
        
        try {
            if (itinerary.getAccommodationPartner() != null) {
                response.setAccommodationPartner(toPartnerSummary(itinerary.getAccommodationPartner()));
            }
        } catch (Exception e) {
            log.debug("Could not load accommodation partner for itinerary {}: {}", itinerary.getId(), e.getMessage());
        }
        
        try {
            if (itinerary.getMealsPartner() != null) {
                response.setMealsPartner(toPartnerSummary(itinerary.getMealsPartner()));
            }
        } catch (Exception e) {
            log.debug("Could not load meals partner for itinerary {}: {}", itinerary.getId(), e.getMessage());
        }
        
        return response;
    }
    
    public List<TourResponse.TourItineraryResponse> toTourItineraryResponseList(Set<TourItinerary> itineraries) {
        if (itineraries == null || itineraries.isEmpty()) return null;
        return itineraries.stream()
                .sorted((i1, i2) -> Integer.compare(i1.getDayNumber(), i2.getDayNumber()))
                .map(this::toTourItineraryResponse)
                .collect(Collectors.toList());
    }
    
    // Map Partner to simple summary (for itinerary)
    public TourResponse.PartnerResponse toPartnerSummary(Partner partner) {
        if (partner == null) return null;
        
        TourResponse.PartnerResponse response = new TourResponse.PartnerResponse();
        response.setId(partner.getId());
        response.setName(partner.getName());
        response.setType(partner.getType() != null ? partner.getType().getDisplayName() : null);
        response.setAddress(partner.getAddress());
        response.setRating(partner.getRating());
        return response;
    }
    
    // Map Partner to booking partner info
    public BookingResponse.PartnerInfo toBookingPartnerInfo(Partner partner) {
        if (partner == null) return null;
        
        BookingResponse.PartnerInfo info = new BookingResponse.PartnerInfo();
        info.setId(partner.getId());
        info.setName(partner.getName());
        info.setType(partner.getType() != null ? partner.getType().getDisplayName() : null);
        info.setAddress(partner.getAddress());
        info.setRating(partner.getRating());
        return info;
    }
    
    // ========== BOOKING MAPPING ==========
    public BookingResponse toBookingResponse(Booking booking) {
        if (booking == null) return null;
        
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setBookingCode(booking.getBookingCode());
        response.setStartDate(booking.getStartDate());
        
        // Customer info
        response.setCustomerName(booking.getCustomerName());
        response.setCustomerEmail(booking.getCustomerEmail());
        response.setCustomerPhone(booking.getCustomerPhone());
        response.setCustomerAddress(booking.getCustomerAddress());
        
        // Participants
        response.setNumAdults(booking.getNumAdults());
        response.setNumChildren(booking.getNumChildren());
        response.setNumInfants(booking.getNumInfants());
        response.setTotalPeople(booking.getTotalPeople());
        
        // Price
        response.setUnitPrice(booking.getUnitPrice());
        response.setTotalPrice(booking.getTotalPrice());
        response.setDiscountAmount(booking.getDiscountAmount());
        response.setFinalAmount(booking.getFinalAmount());
        
        // Status (UPPERCASE for dropdown value matching)
        response.setConfirmationStatus(booking.getConfirmationStatus() != null ? 
            booking.getConfirmationStatus().name() : null);
        response.setPaymentStatus(booking.getPaymentStatus() != null ? 
            booking.getPaymentStatus().name() : null);
        
        // Additional
        response.setSpecialRequests(booking.getSpecialRequests());
        response.setContactPhone(booking.getContactPhone());
        
        // Cancellation
        response.setCancellationReason(booking.getCancellationReason());
        response.setCancelledBy(booking.getCancelledBy());
        response.setCancelledAt(booking.getCancelledAt());
        
        // Timestamps
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        
        // Tour info
        if (booking.getTour() != null) {
            Tour tour = booking.getTour();
            log.debug("Mapping tour for booking {}: tour ID={}, name={}, tourType={}, departureLocation={}, destination={}, price={}", 
                booking.getId(), tour.getId(), tour.getName(), tour.getTourType(), 
                tour.getDepartureLocation(), tour.getDestination(), tour.getPrice());
            
            BookingResponse.TourInfo tourInfo = new BookingResponse.TourInfo();
            tourInfo.setId(tour.getId());
            tourInfo.setName(tour.getName());
            tourInfo.setSlug(tour.getSlug());
            tourInfo.setMainImage(tour.getMainImage());
            tourInfo.setDuration(tour.getDuration());
            tourInfo.setDepartureLocation(tour.getDepartureLocation());
            tourInfo.setDestination(tour.getDestination());
            tourInfo.setTourType(tour.getTourType() != null ? tour.getTourType().name() : null);
            tourInfo.setPrice(tour.getPrice());
            
            log.debug("Mapped tourInfo: tourType={}, departureLocation={}, destination={}, price={}", 
                tourInfo.getTourType(), tourInfo.getDepartureLocation(), 
                tourInfo.getDestination(), tourInfo.getPrice());
            
            response.setTour(tourInfo);
        }
        
        // Schedule info
        if (booking.getSchedule() != null) {
            TourSchedule schedule = booking.getSchedule();
            BookingResponse.TourScheduleInfo scheduleInfo = new BookingResponse.TourScheduleInfo();
            scheduleInfo.setId(schedule.getId());
            scheduleInfo.setDepartureDate(schedule.getDepartureDate());
            scheduleInfo.setReturnDate(schedule.getReturnDate());
            scheduleInfo.setAvailableSeats(schedule.getAvailableSeats());
            response.setSchedule(scheduleInfo);
        }
        
        // Itineraries from Tour
        if (booking.getTour() != null && booking.getTour().getItineraries() != null) {
            try {
                List<BookingResponse.TourItineraryInfo> itineraryInfos = booking.getTour().getItineraries().stream()
                    .sorted((i1, i2) -> Integer.compare(i1.getDayNumber(), i2.getDayNumber()))
                    .map(itinerary -> {
                        BookingResponse.TourItineraryInfo info = new BookingResponse.TourItineraryInfo();
                        info.setId(itinerary.getId());
                        info.setDayNumber(itinerary.getDayNumber());
                        info.setTitle(itinerary.getTitle());
                        info.setDescription(itinerary.getDescription());
                        info.setActivities(parseJsonArray(itinerary.getActivities()));
                        info.setMeals(itinerary.getMeals());
                        info.setAccommodation(itinerary.getAccommodation());
                        
                        // Map partners
                        try {
                            if (itinerary.getAccommodationPartner() != null) {
                                info.setAccommodationPartner(toBookingPartnerInfo(itinerary.getAccommodationPartner()));
                            }
                        } catch (Exception e) {
                            log.debug("Could not load accommodation partner: {}", e.getMessage());
                        }
                        
                        try {
                            if (itinerary.getMealsPartner() != null) {
                                info.setMealsPartner(toBookingPartnerInfo(itinerary.getMealsPartner()));
                            }
                        } catch (Exception e) {
                            log.debug("Could not load meals partner: {}", e.getMessage());
                        }
                        
                        return info;
                    })
                    .collect(Collectors.toList());
                response.setItineraries(itineraryInfos);
            } catch (Exception e) {
                log.error("Error loading itineraries for booking: {}", e.getMessage());
            }
        }
        
        return response;
    }
    
    public List<BookingResponse> toBookingResponseList(List<Booking> bookings) {
        if (bookings == null) return null;
        return bookings.stream().map(this::toBookingResponse).collect(Collectors.toList());
    }
    
    // ========== TOUR SCHEDULE MAPPING ==========
    public TourScheduleResponse toTourScheduleResponse(TourSchedule schedule) {
        if (schedule == null) return null;
        
        TourScheduleResponse response = new TourScheduleResponse();
        response.setId(schedule.getId());
        response.setTourId(schedule.getTour() != null ? schedule.getTour().getId() : null);
        response.setDepartureDate(schedule.getDepartureDate());
        response.setReturnDate(schedule.getReturnDate());
        response.setAvailableSeats(schedule.getAvailableSeats());
        response.setBookedSeats(schedule.getBookedSeats());
        response.setAdultPrice(schedule.getAdultPrice());
        response.setChildPrice(schedule.getChildPrice());
        response.setInfantPrice(schedule.getInfantPrice());
        response.setStatus(schedule.getStatus() != null ? schedule.getStatus().toString() : null);
        response.setNote(schedule.getNote());
        response.setCreatedAt(schedule.getCreatedAt());
        response.setUpdatedAt(schedule.getUpdatedAt());
        
        return response;
    }
    
    public List<TourScheduleResponse> toTourScheduleResponseList(List<TourSchedule> schedules) {
        if (schedules == null) return null;
        return schedules.stream().map(this::toTourScheduleResponse).collect(Collectors.toList());
    }
    
    // ========== WISHLIST MAPPING ==========
    public WishlistResponse toWishlistResponse(Wishlist wishlist) {
        if (wishlist == null) return null;
        
        WishlistResponse response = new WishlistResponse();
        response.setId(wishlist.getId());
        response.setUserId(wishlist.getUser() != null ? wishlist.getUser().getId() : null);
        response.setCreatedAt(wishlist.getCreatedAt());
        
        // Tour info
        if (wishlist.getTour() != null) {
            Tour tour = wishlist.getTour();
            WishlistResponse.TourInfo tourInfo = new WishlistResponse.TourInfo();
            tourInfo.setId(tour.getId());
            tourInfo.setName(tour.getName());
            tourInfo.setSlug(tour.getSlug());
            tourInfo.setMainImage(tour.getMainImage());
            tourInfo.setPrice(tour.getPrice());
            tourInfo.setSalePrice(tour.getSalePrice());
            tourInfo.setEffectivePrice(tour.getEffectivePrice());
            tourInfo.setDuration(tour.getDuration());
            tourInfo.setTourType(tour.getTourType() != null ? tour.getTourType().toString() : null);
            tourInfo.setDestination(tour.getDestination());
            tourInfo.setIsFeatured(tour.getIsFeatured());
            response.setTour(tourInfo);
        }
        
        return response;
    }
    
    public List<WishlistResponse> toWishlistResponseList(List<Wishlist> wishlists) {
        if (wishlists == null) return null;
        return wishlists.stream().map(this::toWishlistResponse).collect(Collectors.toList());
    }
    
    // ========== TOUR FAQ MAPPING ==========
    public TourFaqResponse toTourFaqResponse(TourFaq faq) {
        if (faq == null) return null;
        
        TourFaqResponse response = new TourFaqResponse();
        response.setId(faq.getId());
        response.setTourId(faq.getTour() != null ? faq.getTour().getId() : null);
        response.setQuestion(faq.getQuestion());
        response.setAnswer(faq.getAnswer());
        response.setDisplayOrder(faq.getDisplayOrder());
        response.setCreatedAt(faq.getCreatedAt());
        response.setUpdatedAt(faq.getUpdatedAt());
        
        return response;
    }
    
    public List<TourFaqResponse> toTourFaqResponseList(List<TourFaq> faqs) {
        if (faqs == null) return null;
        return faqs.stream().map(this::toTourFaqResponse).collect(Collectors.toList());
    }
    
    // ========== REVIEW MAPPING ==========
    public ReviewResponse toReviewResponse(Review review) {
        if (review == null) return null;
        
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setStatus(review.getStatus() != null ? review.getStatus().toString() : null);
        response.setHelpfulCount(review.getHelpfulCount());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        response.setAdminReply(review.getAdminReply());
        response.setRepliedAt(review.getRepliedAt());
        response.setRepliedBy(review.getRepliedBy());
        
        // Parse images JSON
        if (review.getImages() != null && !review.getImages().isEmpty()) {
            try {
                List<String> images = objectMapper.readValue(
                        review.getImages(), 
                        new TypeReference<List<String>>() {}
                );
                response.setImages(images);
            } catch (Exception e) {
                log.error("Error parsing review images JSON", e);
                response.setImages(new ArrayList<>());
            }
        }
        
        // User info
        if (review.getUser() != null) {
            User user = review.getUser();
            ReviewResponse.UserSummary userSummary = new ReviewResponse.UserSummary();
            userSummary.setId(user.getId());
            userSummary.setName(user.getName());
            userSummary.setAvatarUrl(user.getAvatarUrl());
            response.setUser(userSummary);
        }
        
        // Tour info
        if (review.getTour() != null) {
            Tour tour = review.getTour();
            ReviewResponse.TourSummary tourSummary = new ReviewResponse.TourSummary();
            tourSummary.setId(tour.getId());
            tourSummary.setName(tour.getName());
            tourSummary.setSlug(tour.getSlug());
            tourSummary.setMainImage(tour.getMainImage());
            response.setTour(tourSummary);
        }
        
        // Booking ID
        if (review.getBooking() != null) {
            response.setBookingId(review.getBooking().getId());
        }
        
        return response;
    }
    
    public List<ReviewResponse> toReviewResponseList(List<Review> reviews) {
        if (reviews == null) return null;
        return reviews.stream().map(this::toReviewResponse).collect(Collectors.toList());
    }
    
    // ========== CATEGORY MAPPING ==========
    public Category toCategory(backend.dto.request.CategoryRequest request) {
        if (request == null) return null;
        
        Category category = new Category();
        category.setName(request.getName());
        category.setSlug(request.getSlug());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        category.setIcon(request.getIcon());
        category.setParentId(request.getParentId());
        category.setDisplayOrder(request.getDisplayOrder());
        category.setIsFeatured(request.getIsFeatured());
        category.setStatus(request.getStatus());
        
        return category;
    }
    
    public CategoryResponse toCategoryResponse(Category category) {
        // Use simple mapping without loading lazy collections
        return toCategoryResponseSimple(category);
    }
    
    public CategoryResponse toCategoryResponseSimple(Category category) {
        if (category == null) return null;
        
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setDescription(category.getDescription());
        response.setImageUrl(category.getImageUrl());
        response.setIcon(category.getIcon());
        response.setParentId(category.getParentId());
        response.setDisplayOrder(category.getDisplayOrder());
        response.setIsFeatured(category.getIsFeatured());
        response.setStatus(category.getStatus() != null ? category.getStatus().toString() : null);
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        
        // DON'T load tours - avoid LazyInitializationException
        response.setTourCount(0L); // Will be set separately if needed
        
        return response;
    }
    
    public CategoryResponse toCategoryResponseFull(Category category) {
        if (category == null) return null;
        
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setSlug(category.getSlug());
        response.setDescription(category.getDescription());
        response.setImageUrl(category.getImageUrl());
        response.setIcon(category.getIcon());
        response.setParentId(category.getParentId());
        response.setDisplayOrder(category.getDisplayOrder());
        response.setIsFeatured(category.getIsFeatured());
        response.setStatus(category.getStatus() != null ? category.getStatus().toString() : null);
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        
        // Set tour count - only use in transactional context
        try {
            if (category.getTours() != null) {
                response.setTourCount((long) category.getTours().size());
            } else {
                response.setTourCount(0L);
            }
        } catch (Exception e) {
            log.warn("Could not load tour count for category {}: {}", category.getId(), e.getMessage());
            response.setTourCount(0L);
        }
        
        return response;
    }
    
    public List<CategoryResponse> toCategoryResponseList(List<Category> categories) {
        if (categories == null) return null;
        return categories.stream().map(this::toCategoryResponseFull).collect(Collectors.toList());
    }
    
    // ========== BOOKING CANCELLATION MAPPING ==========
    public BookingCancellationResponse toBookingCancellationResponse(BookingCancellation cancellation) {
        if (cancellation == null) return null;
        
        BookingCancellationResponse response = new BookingCancellationResponse();
        response.setId(cancellation.getId());
        
        // Booking summary
        if (cancellation.getBooking() != null) {
            Booking booking = cancellation.getBooking();
            BookingCancellationResponse.BookingSummary bookingSummary = new BookingCancellationResponse.BookingSummary();
            bookingSummary.setId(booking.getId());
            bookingSummary.setBookingCode(booking.getBookingCode());
            bookingSummary.setTourName(booking.getTour() != null ? booking.getTour().getName() : null);
            bookingSummary.setStartDate(booking.getStartDate() != null ? booking.getStartDate().atStartOfDay() : null);
            bookingSummary.setTotalPeople(booking.getTotalPeople());
            bookingSummary.setTotalPrice(booking.getTotalPrice());
            bookingSummary.setStatus(booking.getConfirmationStatus() != null ? booking.getConfirmationStatus().getDisplayName() : null);
            response.setBooking(bookingSummary);
        }
        
        // User summary - who cancelled
        if (cancellation.getCancelledBy() != null) {
            User user = cancellation.getCancelledBy();
            BookingCancellationResponse.UserSummary userSummary = new BookingCancellationResponse.UserSummary();
            userSummary.setId(user.getId());
            userSummary.setName(user.getName());
            userSummary.setEmail(user.getEmail());
            userSummary.setPhone(user.getPhone());
            response.setCancelledBy(userSummary);
        }
        
        // User summary - who processed
        if (cancellation.getProcessedBy() != null) {
            User user = cancellation.getProcessedBy();
            BookingCancellationResponse.UserSummary userSummary = new BookingCancellationResponse.UserSummary();
            userSummary.setId(user.getId());
            userSummary.setName(user.getName());
            userSummary.setEmail(user.getEmail());
            userSummary.setPhone(user.getPhone());
            response.setProcessedBy(userSummary);
        }
        
        // Basic fields
        response.setReason(cancellation.getReason());
        response.setReasonCategory(cancellation.getReasonCategory());
        response.setAdditionalNotes(cancellation.getAdditionalNotes());
        response.setStatus(cancellation.getStatus());
        response.setRefundStatus(cancellation.getRefundStatus());
        
        // Financial fields
        response.setOriginalAmount(cancellation.getOriginalAmount());
        response.setRefundAmount(cancellation.getRefundAmount());
        response.setFinalRefundAmount(cancellation.getFinalRefundAmount());
        response.setCancellationFee(cancellation.getCancellationFee());
        response.setProcessingFee(cancellation.getProcessingFee());
        response.setRefundPercentage(cancellation.getRefundPercentage());
        
        // Timing fields
        response.setHoursBeforeDeparture(cancellation.getHoursBeforeDeparture());
        response.setDepartureDate(cancellation.getDepartureDate());
        
        // Policy information
        if (cancellation.getCancellationPolicy() != null) {
            CancellationPolicy policy = cancellation.getCancellationPolicy();
            BookingCancellationResponse.CancellationPolicySummary policySummary = 
                new BookingCancellationResponse.CancellationPolicySummary();
            policySummary.setId(policy.getId());
            policySummary.setName(policy.getName());
            policySummary.setPolicyType(policy.getPolicyType() != null ? policy.getPolicyType().name() : null);
            policySummary.setHoursBeforeDepartureFullRefund(policy.getHoursBeforeDepartureFullRefund());
            policySummary.setHoursBeforeDeparturePartialRefund(policy.getHoursBeforeDeparturePartialRefund());
            policySummary.setFullRefundPercentage(policy.getFullRefundPercentage());
            policySummary.setPartialRefundPercentage(policy.getPartialRefundPercentage());
            policySummary.setCancellationFee(policy.getCancellationFee());
            policySummary.setProcessingFee(policy.getProcessingFee());
            response.setCancellationPolicy(policySummary);
        }
        
        // Emergency flags
        response.setIsMedicalEmergency(cancellation.getIsMedicalEmergency());
        response.setIsWeatherRelated(cancellation.getIsWeatherRelated());
        response.setIsForceMajeure(cancellation.getIsForceMajeure());
        
        // Supporting documents
        if (cancellation.getSupportingDocuments() != null && !cancellation.getSupportingDocuments().isEmpty()) {
            response.setSupportingDocuments(List.of(cancellation.getSupportingDocuments().split(",")));
        }
        
        // Refund tracking
        response.setRefundTransactionId(cancellation.getRefundTransactionId());
        response.setRefundMethod(cancellation.getRefundMethod());
        
        // Processing info
        response.setRefundProcessedAt(cancellation.getRefundProcessedAt());
        response.setProcessedAt(cancellation.getProcessedAt());
        response.setAdminNotes(cancellation.getAdminNotes());
        response.setCancelledAt(cancellation.getCancelledAt());
        response.setCreatedAt(cancellation.getCreatedAt());
        response.setUpdatedAt(cancellation.getUpdatedAt());
        
        return response;
    }
    
    // ========== PARTNER MAPPING ==========
    public Partner toPartner(backend.dto.request.PartnerRequest request) {
        if (request == null) return null;
        
        Partner partner = new Partner();
        partner.setName(request.getName());
        
        // Auto-generate slug if not provided
        if (request.getSlug() == null || request.getSlug().trim().isEmpty()) {
            partner.setSlug(generateSlug(request.getName()));
        } else {
            partner.setSlug(request.getSlug());
        }
        
        partner.setDescription(request.getDescription());
        partner.setType(request.getType());
        partner.setAddress(request.getAddress());
        partner.setPhone(request.getPhone());
        partner.setEmail(request.getEmail());
        partner.setWebsite(request.getWebsite());
        partner.setEstablishedYear(request.getEstablishedYear());
        partner.setAvatarUrl(request.getAvatarUrl());
        partner.setStatus(request.getStatus() != null ? request.getStatus() : backend.entity.Partner.PartnerStatus.ACTIVE);
        partner.setSpecialties(request.getSpecialties());
        
        return partner;
    }
    
    public PartnerResponse toPartnerResponse(Partner partner) {
        if (partner == null) return null;
        
        PartnerResponse response = new PartnerResponse();
        response.setId(partner.getId());
        response.setName(partner.getName());
        response.setSlug(partner.getSlug());
        response.setDescription(partner.getDescription());
        response.setType(partner.getType() != null ? partner.getType().name() : null);
        response.setAddress(partner.getAddress());
        response.setPhone(partner.getPhone());
        response.setEmail(partner.getEmail());
        response.setWebsite(partner.getWebsite());
        response.setEstablishedYear(partner.getEstablishedYear());
        response.setAvatarUrl(partner.getAvatarUrl());
        response.setRating(partner.getRating());
        response.setStatus(partner.getStatus() != null ? partner.getStatus().toString() : null);
        
        // Parse specialties from JSON string to List
        try {
            if (partner.getSpecialties() != null && !partner.getSpecialties().isEmpty()) {
                response.setSpecialties(parseJsonArray(partner.getSpecialties()));
            } else {
                response.setSpecialties(new ArrayList<>());
            }
        } catch (Exception e) {
            log.warn("Could not parse specialties for partner {}: {}", partner.getId(), e.getMessage());
            response.setSpecialties(new ArrayList<>());
        }
        
        response.setCreatedAt(partner.getCreatedAt());
        response.setUpdatedAt(partner.getUpdatedAt());
        
        // Calculate statistics from tour itineraries and map tours
        try {
            if (partner.getTourItineraries() != null) {
                // Get unique tours from itineraries
                Set<backend.entity.Tour> uniqueTours = partner.getTourItineraries().stream()
                    .map(backend.entity.TourItinerary::getTour)
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toSet());
                
                response.setTotalTours(uniqueTours.size());
                
                // Calculate total bookings and reviews from all tours
                int totalBookings = uniqueTours.stream()
                    .mapToInt(tour -> tour.getBookings() != null ? tour.getBookings().size() : 0)
                    .sum();
                
                int totalReviews = uniqueTours.stream()
                    .mapToInt(tour -> tour.getReviews() != null ? tour.getReviews().size() : 0)
                    .sum();
                
                response.setTotalBookings(totalBookings);
                response.setTotalReviews(totalReviews);
                
                // Map tours to response
                List<PartnerResponse.PartnerTourResponse> tourResponses = uniqueTours.stream()
                    .map(tour -> {
                        PartnerResponse.PartnerTourResponse tourResp = new PartnerResponse.PartnerTourResponse();
                        tourResp.setId(tour.getId());
                        tourResp.setTitle(tour.getName());
                        tourResp.setSlug(tour.getSlug());
                        tourResp.setDescription(tour.getDescription());
                        tourResp.setPrice(tour.getPrice());
                        tourResp.setSalePrice(tour.getSalePrice());
                        tourResp.setDuration(tour.getDuration());
                        tourResp.setLocation(tour.getDestination());
                        
                        // Use cached average rating for performance
                        tourResp.setRating(tour.getAverageRating() != null ? tour.getAverageRating() : 0.0);
                        
                        tourResp.setMaxGroupSize(tour.getMaxPeople());
                        tourResp.setDifficulty(null); // Not available in current schema
                        tourResp.setStatus(tour.getStatus() != null ? tour.getStatus().name() : null);
                        
                        // Map tour images
                        if (tour.getImages() != null && !tour.getImages().isEmpty()) {
                            List<String> imageUrls = tour.getImages().stream()
                                .map(backend.entity.TourImage::getImageUrl)
                                .collect(Collectors.toList());
                            tourResp.setImages(imageUrls);
                        } else {
                            tourResp.setImages(new ArrayList<>());
                        }
                        
                        // Use cached review count for performance
                        tourResp.setTotalReviews(tour.getReviewCount() != null ? tour.getReviewCount().intValue() : 0);
                        
                        // Map category
                        if (tour.getCategory() != null) {
                            PartnerResponse.CategoryResponse catResp = new PartnerResponse.CategoryResponse();
                            catResp.setId(tour.getCategory().getId());
                            catResp.setName(tour.getCategory().getName());
                            catResp.setSlug(tour.getCategory().getSlug());
                            tourResp.setCategory(catResp);
                        }
                        
                        // Map highlights
                        try {
                            if (tour.getHighlights() != null && !tour.getHighlights().isEmpty()) {
                                tourResp.setHighlights(parseJsonArray(tour.getHighlights()));
                            } else {
                                tourResp.setHighlights(new ArrayList<>());
                            }
                        } catch (Exception e) {
                            tourResp.setHighlights(new ArrayList<>());
                        }
                        
                        return tourResp;
                    })
                    .collect(Collectors.toList());
                
                response.setTours(tourResponses);
            } else {
                response.setTotalTours(0);
                response.setTotalBookings(0);
                response.setTotalReviews(0);
                response.setTours(new ArrayList<>());
            }
        } catch (Exception e) {
            log.warn("Could not calculate statistics for partner {}: {}", partner.getId(), e.getMessage());
            response.setTotalTours(0);
            response.setTotalBookings(0);
            response.setTotalReviews(0);
            response.setTours(new ArrayList<>());
        }
        
        // Map images if available - safely handle lazy loading
        try {
            if (partner.getImages() != null) {
                List<PartnerResponse.PartnerImageResponse> imageResponses = partner.getImages().stream()
                    .map(img -> {
                        PartnerResponse.PartnerImageResponse imgResp = new PartnerResponse.PartnerImageResponse();
                        imgResp.setId(img.getId());
                        imgResp.setImageUrl(img.getImageUrl());
                        imgResp.setImageType(img.getImageType());
                        imgResp.setAltText(img.getAltText());
                        imgResp.setDisplayOrder(img.getDisplayOrder());
                        return imgResp;
                    })
                    .collect(Collectors.toList());
                response.setImages(imageResponses);
            }
        } catch (Exception e) {
            log.warn("Could not load images for partner {}: {}", partner.getId(), e.getMessage());
            response.setImages(new ArrayList<>());
        }
        
        return response;
    }
    
    public List<PartnerResponse> toPartnerResponseList(List<Partner> partners) {
        if (partners == null) return null;
        return partners.stream()
                .map(this::toPartnerResponse)
                .collect(Collectors.toList());
    }
    
    // ========== HELPER METHODS ==========
    private List<String> parseJsonArray(String json) {
        if (json == null || json.isEmpty()) return new ArrayList<>();
        
        // Trim whitespace
        json = json.trim();
        
        // Check if it's a JSON array (starts with '[')
        if (json.startsWith("[")) {
            try {
                return objectMapper.readValue(json, new TypeReference<List<String>>() {});
            } catch (Exception e) {
                log.error("Error parsing JSON array: {}", e.getMessage());
                return new ArrayList<>();
            }
        } else {
            // It's plain text with line breaks - split by newline
            return Arrays.stream(json.split("\\r?\\n"))
                    .map(String::trim)
                    .filter(line -> !line.isEmpty())
                    .collect(Collectors.toList());
        }
    }
    
    // ========== HELPER METHODS ==========
    private String generateSlug(String name) {
        if (name == null || name.trim().isEmpty()) {
            return "partner-" + System.currentTimeMillis();
        }
        
        // Convert to lowercase and replace spaces with hyphens
        String slug = name.toLowerCase()
                .trim()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[^a-z0-9\\s-]", "") // Remove special chars
                .replaceAll("\\s+", "-")         // Replace spaces with hyphens
                .replaceAll("-+", "-")           // Replace multiple hyphens with single
                .replaceAll("^-|-$", "");        // Remove leading/trailing hyphens
        
        // Add timestamp to ensure uniqueness
        return slug + "-" + System.currentTimeMillis();
    }
}