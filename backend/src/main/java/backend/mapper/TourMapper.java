package backend.mapper;

import backend.dto.request.TourRequest;
import backend.dto.response.TourResponse;
import backend.entity.*;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TourMapper {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    public Tour toEntity(TourRequest request) {
        Tour tour = new Tour();
        
        // Basic info
        tour.setName(request.getName());
        tour.setShortDescription(request.getShortDescription());
        tour.setDescription(request.getDescription());
        
        // Pricing
        tour.setPrice(request.getPrice());
        tour.setSalePrice(request.getSalePrice());
        tour.setChildPrice(request.getChildPrice());
        tour.setInfantPrice(request.getInfantPrice());
        
        // Duration and capacity
        tour.setDuration(request.getDuration());
        tour.setMaxPeople(request.getMaxPeople());
        tour.setMinPeople(request.getMinPeople());
        
        // Status and featured
        if (request.getStatus() != null) {
            tour.setStatus(Tour.TourStatus.valueOf(request.getStatus()));
        } else {
            tour.setStatus(Tour.TourStatus.Inactive);
        }
        
        tour.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        tour.setMainImage(request.getMainImage());
        
        // Location
        tour.setTourType(Tour.TourType.valueOf(request.getTourType()));
        tour.setDepartureLocation(request.getDepartureLocation());
        tour.setDestination(request.getDestination());
        tour.setRegion(request.getRegion());
        tour.setCountryCode(request.getCountryCode());
        
        // Transportation and accommodation
        tour.setTransportation(request.getTransportation());
        tour.setAccommodation(request.getAccommodation());
        tour.setMealsIncluded(request.getMealsIncluded());
        
        // Services - convert List to String (comma-separated)
        if (request.getIncludedServices() != null) {
            tour.setIncludedServices(String.join(", ", request.getIncludedServices()));
        }
        if (request.getExcludedServices() != null) {
            tour.setExcludedServices(String.join(", ", request.getExcludedServices()));
        }
        if (request.getHighlights() != null) {
            tour.setHighlights(String.join(", ", request.getHighlights()));
        }
        if (request.getDestinations() != null) {
            tour.setDestinations(String.join(", ", request.getDestinations()));
        }
        
        tour.setNote(request.getNote());
        tour.setCancellationPolicy(request.getCancellationPolicy());
        tour.setSuitableFor(request.getSuitableFor());
        
        // Visa and flight
        tour.setVisaRequired(request.getVisaRequired() != null ? request.getVisaRequired() : false);
        tour.setVisaInfo(request.getVisaInfo());
        tour.setFlightIncluded(request.getFlightIncluded() != null ? request.getFlightIncluded() : false);
        
        return tour;
    }
    
    public void updateEntity(Tour tour, TourRequest request) {
        // Basic info
        tour.setName(request.getName());
        tour.setShortDescription(request.getShortDescription());
        tour.setDescription(request.getDescription());
        
        // Pricing
        tour.setPrice(request.getPrice());
        tour.setSalePrice(request.getSalePrice());
        tour.setChildPrice(request.getChildPrice());
        tour.setInfantPrice(request.getInfantPrice());
        
        // Duration and capacity
        tour.setDuration(request.getDuration());
        tour.setMaxPeople(request.getMaxPeople());
        tour.setMinPeople(request.getMinPeople());
        
        // Status and featured
        if (request.getStatus() != null) {
            tour.setStatus(Tour.TourStatus.valueOf(request.getStatus()));
        }
        
        if (request.getIsFeatured() != null) {
            tour.setIsFeatured(request.getIsFeatured());
        }
        
        tour.setMainImage(request.getMainImage());
        
        // Location
        tour.setTourType(Tour.TourType.valueOf(request.getTourType()));
        tour.setDepartureLocation(request.getDepartureLocation());
        tour.setDestination(request.getDestination());
        tour.setRegion(request.getRegion());
        tour.setCountryCode(request.getCountryCode());
        
        // Transportation and accommodation
        tour.setTransportation(request.getTransportation());
        tour.setAccommodation(request.getAccommodation());
        tour.setMealsIncluded(request.getMealsIncluded());
        
        // Services
        if (request.getIncludedServices() != null) {
            tour.setIncludedServices(String.join(", ", request.getIncludedServices()));
        }
        if (request.getExcludedServices() != null) {
            tour.setExcludedServices(String.join(", ", request.getExcludedServices()));
        }
        if (request.getHighlights() != null) {
            tour.setHighlights(String.join(", ", request.getHighlights()));
        }
        if (request.getDestinations() != null) {
            tour.setDestinations(String.join(", ", request.getDestinations()));
        }
        
        tour.setNote(request.getNote());
        tour.setCancellationPolicy(request.getCancellationPolicy());
        tour.setSuitableFor(request.getSuitableFor());
        
        // Visa and flight
        if (request.getVisaRequired() != null) {
            tour.setVisaRequired(request.getVisaRequired());
        }
        tour.setVisaInfo(request.getVisaInfo());
        if (request.getFlightIncluded() != null) {
            tour.setFlightIncluded(request.getFlightIncluded());
        }
    }
    
    public TourResponse toResponse(Tour tour) {
        TourResponse response = new TourResponse();
        
        // Basic info
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
        response.setEffectivePrice(tour.getSalePrice() != null ? tour.getSalePrice() : tour.getPrice());
        
        // Duration and capacity
        response.setDuration(tour.getDuration());
        response.setMaxPeople(tour.getMaxPeople());
        response.setMinPeople(tour.getMinPeople());
        
        // Status and featured
        response.setStatus(tour.getStatus() != null ? tour.getStatus().name() : null);
        response.setIsFeatured(tour.getIsFeatured());
        response.setMainImage(tour.getMainImage());
        
        // Location
        response.setTourType(tour.getTourType() != null ? tour.getTourType().name() : null);
        response.setDepartureLocation(tour.getDepartureLocation());
        response.setDestination(tour.getDestination());
        response.setRegion(tour.getRegion());
        response.setCountryCode(tour.getCountryCode());
        
        // Destinations - convert String to List
        if (tour.getDestinations() != null && !tour.getDestinations().isEmpty()) {
            response.setDestinations(List.of(tour.getDestinations().split(",\\s*")));
        }
        
        // Transportation and accommodation
        response.setTransportation(tour.getTransportation());
        response.setAccommodation(tour.getAccommodation());
        response.setMealsIncluded(tour.getMealsIncluded());
        
        // Services - convert String to List
        if (tour.getIncludedServices() != null && !tour.getIncludedServices().isEmpty()) {
            response.setIncludedServices(List.of(tour.getIncludedServices().split(",\\s*")));
        }
        if (tour.getExcludedServices() != null && !tour.getExcludedServices().isEmpty()) {
            response.setExcludedServices(List.of(tour.getExcludedServices().split(",\\s*")));
        }
        if (tour.getHighlights() != null && !tour.getHighlights().isEmpty()) {
            response.setHighlights(List.of(tour.getHighlights().split(",\\s*")));
        }
        
        response.setNote(tour.getNote());
        response.setCancellationPolicy(tour.getCancellationPolicy());
        response.setSuitableFor(tour.getSuitableFor());
        
        // Visa and flight
        response.setVisaRequired(tour.getVisaRequired());
        response.setVisaInfo(tour.getVisaInfo());
        response.setFlightIncluded(tour.getFlightIncluded());
        
        // Statistics
        response.setViewCount(tour.getViewCount());
        
        // Timestamps
        response.setCreatedAt(tour.getCreatedAt());
        response.setUpdatedAt(tour.getUpdatedAt());
        
        // Category
        if (tour.getCategory() != null) {
            TourResponse.CategoryResponse categoryResponse = new TourResponse.CategoryResponse();
            categoryResponse.setId(tour.getCategory().getId());
            categoryResponse.setName(tour.getCategory().getName());
            categoryResponse.setSlug(tour.getCategory().getSlug());
            categoryResponse.setImageUrl(tour.getCategory().getImageUrl());
            categoryResponse.setIcon(tour.getCategory().getIcon());
            categoryResponse.setParentId(tour.getCategory().getParentId());
            categoryResponse.setIsFeatured(tour.getCategory().getIsFeatured());
            response.setCategory(categoryResponse);
        }
        
        // Images
        if (tour.getImages() != null && !tour.getImages().isEmpty()) {
            response.setImages(tour.getImages().stream()
                    .map(this::toImageResponse)
                    .collect(Collectors.toList()));
        }
        
        // Itineraries
        if (tour.getItineraries() != null && !tour.getItineraries().isEmpty()) {
            response.setItineraries(tour.getItineraries().stream()
                    .map(this::toItineraryResponse)
                    .collect(Collectors.toList()));
        }
        
        // Target Audiences
        if (tour.getTargetAudiences() != null && !tour.getTargetAudiences().isEmpty()) {
            response.setTargetAudiences(tour.getTargetAudiences().stream()
                    .map(ta -> {
                        TourResponse.TargetAudienceResponse taResponse = new TourResponse.TargetAudienceResponse();
                        taResponse.setId(ta.getId());
                        taResponse.setName(ta.getName());
                        return taResponse;
                    })
                    .collect(Collectors.toList()));
        }
        
        // Schedules
        if (tour.getSchedules() != null && !tour.getSchedules().isEmpty()) {
            response.setSchedules(tour.getSchedules().stream()
                    .map(this::toScheduleResponse)
                    .collect(Collectors.toList()));
        }
        
        // FAQs
        if (tour.getFaqs() != null && !tour.getFaqs().isEmpty()) {
            response.setFaqs(tour.getFaqs().stream()
                    .map(this::toFaqResponse)
                    .collect(Collectors.toList()));
        }
        
        return response;
    }
    
    private TourResponse.TourImageResponse toImageResponse(TourImage image) {
        return new TourResponse.TourImageResponse(
                image.getId(),
                image.getImageUrl(),
                null, // caption - not in entity
                false // isPrimary - not in entity
        );
    }
    
    private TourResponse.TourItineraryResponse toItineraryResponse(TourItinerary itinerary) {
        TourResponse.TourItineraryResponse response = new TourResponse.TourItineraryResponse();
        response.setId(itinerary.getId());
        response.setDayNumber(itinerary.getDayNumber());
        response.setTitle(itinerary.getTitle());
        response.setDescription(itinerary.getDescription());
        response.setLocation(itinerary.getLocation());
        
        if (itinerary.getActivities() != null && !itinerary.getActivities().isEmpty()) {
            response.setActivities(List.of(itinerary.getActivities().split(",\\s*")));
        }
        
        response.setMeals(itinerary.getMeals());
        response.setAccommodation(itinerary.getAccommodation());
        
        if (itinerary.getImages() != null && !itinerary.getImages().isEmpty()) {
            response.setImages(List.of(itinerary.getImages().split(",\\s*")));
        }
        
        // Partners
        if (itinerary.getPartner() != null) {
            response.setPartner(toPartnerResponse(itinerary.getPartner()));
        }
        if (itinerary.getAccommodationPartner() != null) {
            response.setAccommodationPartner(toPartnerResponse(itinerary.getAccommodationPartner()));
        }
        if (itinerary.getMealsPartner() != null) {
            response.setMealsPartner(toPartnerResponse(itinerary.getMealsPartner()));
        }
        
        return response;
    }
    
    private TourResponse.PartnerResponse toPartnerResponse(Partner partner) {
        return new TourResponse.PartnerResponse(
                partner.getId(),
                partner.getName(),
                partner.getType() != null ? partner.getType().name() : null,
                partner.getAddress(),
                partner.getRating()
        );
    }
    
    private TourResponse.TourScheduleResponse toScheduleResponse(TourSchedule schedule) {
        return new TourResponse.TourScheduleResponse(
                schedule.getId(),
                schedule.getDepartureDate() != null ? schedule.getDepartureDate().toString() : null,
                schedule.getReturnDate() != null ? schedule.getReturnDate().toString() : null,
                schedule.getAvailableSeats(),
                schedule.getBookedSeats(),
                schedule.getAdultPrice(),
                schedule.getChildPrice(),
                schedule.getInfantPrice(),
                schedule.getStatus() != null ? schedule.getStatus().name() : null
        );
    }
    
    private TourResponse.TourFaqResponse toFaqResponse(TourFaq faq) {
        return new TourResponse.TourFaqResponse(
                faq.getId(),
                faq.getQuestion(),
                faq.getAnswer(),
                faq.getDisplayOrder()
        );
    }
}

