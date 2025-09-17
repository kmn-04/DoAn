package backend.service;

import backend.dto.*;
import backend.model.*;
import backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TourService {
    
    private final TourRepository tourRepository;
    private final TourItineraryRepository itineraryRepository;
    private final TourItineraryPartnerRepository itineraryPartnerRepository;
    private final CategoryRepository categoryRepository;
    private final PartnerRepository partnerRepository;
    
    public Page<TourDto> getAllTours(Pageable pageable) {
        try {
            return tourRepository.findAll(pageable).map(this::convertToDto);
        } catch (Exception e) {
            System.err.println("Error in getAllTours: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tải danh sách tours: " + e.getMessage());
        }
    }
    
    public Page<TourDto> searchTours(String keyword, Tour.TourStatus status, Long categoryId, 
                                   BigDecimal minPrice, BigDecimal maxPrice, Boolean isFeatured, 
                                   Pageable pageable) {
        return tourRepository.searchTours(keyword, status, categoryId, minPrice, maxPrice, isFeatured, pageable)
                .map(this::convertToDto);
    }
    
    public TourDto getTourById(Long id) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour không tồn tại"));
        return convertToDto(tour);
    }
    
    @Transactional
    public TourDto createTour(TourCreateRequest request) {
        Tour tour = new Tour();
        mapRequestToTour(request, tour);
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
            tour.setCategory(category);
        }
        
        Tour savedTour = tourRepository.save(tour);
        
        if (request.getItinerary() != null && !request.getItinerary().isEmpty()) {
            createItinerary(savedTour, request.getItinerary());
        }
        
        return convertToDto(savedTour);
    }
    
    @Transactional
    public TourDto updateTour(Long id, TourUpdateRequest request) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour không tồn tại"));
        
        mapUpdateRequestToTour(request, tour);
        
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
            tour.setCategory(category);
        }
        
        Tour savedTour = tourRepository.save(tour);
        
        if (request.getItinerary() != null) {
            itineraryRepository.deleteByTourId(id);
            if (!request.getItinerary().isEmpty()) {
                createItinerary(savedTour, request.getItinerary());
            }
        }
        
        return convertToDto(savedTour);
    }
    
    @Transactional
    public void deleteTour(Long id) {
        if (!tourRepository.existsById(id)) {
            throw new RuntimeException("Tour không tồn tại");
        }
        tourRepository.deleteById(id);
    }
    
    @Transactional
    public TourDto updateTourStatus(Long id, Tour.TourStatus newStatus) {
        Tour tour = tourRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tour không tồn tại"));
        
        tour.setStatus(newStatus);
        Tour savedTour = tourRepository.save(tour);
        return convertToDto(savedTour);
    }
    
    private void createItinerary(Tour tour, List<TourItineraryCreateRequest> itineraryRequests) {
        for (TourItineraryCreateRequest itineraryRequest : itineraryRequests) {
            TourItinerary itinerary = new TourItinerary();
            itinerary.setTour(tour);
            itinerary.setDayNumber(itineraryRequest.getDayNumber());
            itinerary.setTitle(itineraryRequest.getTitle());
            itinerary.setDescription(itineraryRequest.getDescription());
            
            TourItinerary savedItinerary = itineraryRepository.save(itinerary);
            
            if (itineraryRequest.getPartnerIds() != null && !itineraryRequest.getPartnerIds().isEmpty()) {
                for (Long partnerId : itineraryRequest.getPartnerIds()) {
                    Partner partner = partnerRepository.findById(partnerId)
                            .orElseThrow(() -> new RuntimeException("Đối tác không tồn tại"));
                    
                    TourItineraryPartner itineraryPartner = new TourItineraryPartner();
                    itineraryPartner.setItinerary(savedItinerary);
                    itineraryPartner.setPartner(partner);
                    itineraryPartnerRepository.save(itineraryPartner);
                }
            }
        }
    }
    
    private void mapRequestToTour(TourCreateRequest request, Tour tour) {
        tour.setTitle(request.getTitle());
        tour.setShortDescription(request.getShortDescription());
        tour.setDescription(request.getDescription());
        tour.setDepartureLocation(request.getDepartureLocation());
        tour.setTargetAudience(request.getTargetAudience());
        tour.setDurationDays(request.getDurationDays());
        tour.setDurationNights(request.getDurationNights());
        tour.setPrice(request.getPrice());
        tour.setDiscountedPrice(request.getDiscountedPrice());
        tour.setMaxParticipants(request.getMaxParticipants());
        tour.setGalleryImages(request.getGalleryImages());
        tour.setIncludedServices(request.getIncludedServices());
        tour.setExcludedServices(request.getExcludedServices());
        tour.setStatus(request.getStatus());
        tour.setIsFeatured(request.getIsFeatured());
    }
    
    private void mapUpdateRequestToTour(TourUpdateRequest request, Tour tour) {
        if (request.getTitle() != null) tour.setTitle(request.getTitle());
        if (request.getShortDescription() != null) tour.setShortDescription(request.getShortDescription());
        if (request.getDescription() != null) tour.setDescription(request.getDescription());
        if (request.getDepartureLocation() != null) tour.setDepartureLocation(request.getDepartureLocation());
        if (request.getTargetAudience() != null) tour.setTargetAudience(request.getTargetAudience());
        if (request.getDurationDays() != null) tour.setDurationDays(request.getDurationDays());
        if (request.getDurationNights() != null) tour.setDurationNights(request.getDurationNights());
        if (request.getPrice() != null) tour.setPrice(request.getPrice());
        if (request.getDiscountedPrice() != null) tour.setDiscountedPrice(request.getDiscountedPrice());
        if (request.getMaxParticipants() != null) tour.setMaxParticipants(request.getMaxParticipants());
        if (request.getGalleryImages() != null) tour.setGalleryImages(request.getGalleryImages());
        if (request.getIncludedServices() != null) tour.setIncludedServices(request.getIncludedServices());
        if (request.getExcludedServices() != null) tour.setExcludedServices(request.getExcludedServices());
        if (request.getStatus() != null) tour.setStatus(request.getStatus());
        if (request.getIsFeatured() != null) tour.setIsFeatured(request.getIsFeatured());
    }
    
    private TourDto convertToDto(Tour tour) {
        TourDto dto = new TourDto();
        dto.setId(tour.getId());
        dto.setTitle(tour.getTitle());
        dto.setShortDescription(tour.getShortDescription());
        dto.setDescription(tour.getDescription());
        dto.setDepartureLocation(tour.getDepartureLocation());
        
        if (tour.getCategory() != null) {
            CategoryDto categoryDto = new CategoryDto();
            categoryDto.setId(tour.getCategory().getId());
            categoryDto.setName(tour.getCategory().getName());
            dto.setCategory(categoryDto);
        }
        
        dto.setTargetAudience(tour.getTargetAudience());
        dto.setDurationDays(tour.getDurationDays());
        dto.setDurationNights(tour.getDurationNights());
        dto.setPrice(tour.getPrice());
        dto.setDiscountedPrice(tour.getDiscountedPrice());
        dto.setMaxParticipants(tour.getMaxParticipants());
        dto.setGalleryImages(tour.getGalleryImages());
        dto.setIncludedServices(tour.getIncludedServices());
        dto.setExcludedServices(tour.getExcludedServices());
        dto.setStatus(tour.getStatus());
        dto.setIsFeatured(tour.getIsFeatured());
        dto.setCreatedAt(tour.getCreatedAt());
        dto.setUpdatedAt(tour.getUpdatedAt());
        
        if (tour.getItinerary() != null) {
            List<TourItineraryDto> itineraryDtos = tour.getItinerary().stream()
                    .map(this::convertItineraryToDto)
                    .collect(Collectors.toList());
            dto.setItinerary(itineraryDtos);
        }
        
        return dto;
    }
    
    private TourItineraryDto convertItineraryToDto(TourItinerary itinerary) {
        TourItineraryDto dto = new TourItineraryDto();
        dto.setId(itinerary.getId());
        dto.setDayNumber(itinerary.getDayNumber());
        dto.setTitle(itinerary.getTitle());
        dto.setDescription(itinerary.getDescription());
        dto.setCreatedAt(itinerary.getCreatedAt());
        dto.setUpdatedAt(itinerary.getUpdatedAt());
        
        if (itinerary.getPartners() != null) {
            List<PartnerDto> partnerDtos = itinerary.getPartners().stream()
                    .map(ip -> convertPartnerToDto(ip.getPartner()))
                    .collect(Collectors.toList());
            dto.setPartners(partnerDtos);
        }
        
        return dto;
    }
    
    private PartnerDto convertPartnerToDto(Partner partner) {
        PartnerDto dto = new PartnerDto();
        dto.setId(partner.getId());
        dto.setName(partner.getName());
        dto.setType(partner.getType());
        dto.setAvatarUrl(partner.getAvatarUrl());
        dto.setDescription(partner.getDescription());
        dto.setAddress(partner.getAddress());
        dto.setPhone(partner.getPhone());
        dto.setEmail(partner.getEmail());
        dto.setWebsite(partner.getWebsite());
        dto.setRating(partner.getRating());
        dto.setPriceRange(partner.getPriceRange());
        dto.setIsActive(partner.getIsActive());
        return dto;
    }
    
    public Map<String, Object> getTourStats() {
        Map<String, Object> stats = new HashMap<>();
        
        // Basic counts
        long totalTours = tourRepository.count();
        long draftTours = tourRepository.countByStatus(Tour.TourStatus.DRAFT);
        long activeTours = tourRepository.countByStatus(Tour.TourStatus.ACTIVE);
        long inactiveTours = tourRepository.countByStatus(Tour.TourStatus.INACTIVE);
        long featuredTours = tourRepository.countByIsFeaturedTrue();
        
        stats.put("totalTours", totalTours);
        stats.put("draftTours", draftTours);
        stats.put("activeTours", activeTours);
        stats.put("inactiveTours", inactiveTours);
        stats.put("featuredTours", featuredTours);
        
        // Percentages
        if (totalTours > 0) {
            stats.put("draftPercentage", Math.round((draftTours * 100.0) / totalTours));
            stats.put("activePercentage", Math.round((activeTours * 100.0) / totalTours));
            stats.put("inactivePercentage", Math.round((inactiveTours * 100.0) / totalTours));
            stats.put("featuredPercentage", Math.round((featuredTours * 100.0) / totalTours));
        } else {
            stats.put("draftPercentage", 0);
            stats.put("activePercentage", 0);
            stats.put("inactivePercentage", 0);
            stats.put("featuredPercentage", 0);
        }
        
        return stats;
    }
}
