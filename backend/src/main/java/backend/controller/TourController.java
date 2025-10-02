package backend.controller;

import backend.dto.request.TourCreateRequest;
import backend.dto.request.TourSearchRequest;
import backend.dto.request.TourUpdateRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.PageResponse;
import backend.dto.response.TourResponse;
import backend.entity.Category;
import backend.entity.Tour;
import backend.entity.Tour.TourStatus;
import backend.exception.ResourceNotFoundException;
import backend.service.CategoryService;
import backend.service.TourService;
import backend.mapper.EntityMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Tour Management", description = "APIs for managing tours")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class TourController extends BaseController {
    
    private final TourService tourService;
    private final CategoryService categoryService;
    private final EntityMapper mapper;
    
    @GetMapping
    @Operation(summary = "Get all tours with pagination")
    @Transactional(readOnly = true)  // Fix LazyInitializationException
    public ResponseEntity<ApiResponse<PageResponse<TourResponse>>> getAllTours(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        Pageable pageable = createPageable(page, size, sortBy, sortDirection);
        Page<Tour> tours = tourService.getAllTours(pageable);
        // Eagerly load category to avoid LazyInitializationException
        tours.forEach(tour -> {
            if (tour.getCategory() != null) {
                tour.getCategory().getName(); // Force load
            }
        });
        Page<TourResponse> tourResponses = tours.map(mapper::toTourResponse);
        
        return ResponseEntity.ok(successPage(tourResponses));
    }
    
    @GetMapping("/active")
    @Operation(summary = "Get all active tours")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<TourResponse>>> getActiveTours() {
        
        List<Tour> tours = tourService.getAllActiveTours();
        List<TourResponse> tourResponses = mapper.toTourResponseList(tours);
        
        return ResponseEntity.ok(success(tourResponses));
    }
    
    @GetMapping("/featured")
    @Operation(summary = "Get featured tours")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<TourResponse>>> getFeaturedTours() {
        
        List<Tour> tours = tourService.getFeaturedTours();
        List<TourResponse> tourResponses = mapper.toTourResponseList(tours);
        
        return ResponseEntity.ok(success(tourResponses));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search tours with filters (GET)")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<TourResponse>>> searchTours(@Valid TourSearchRequest request) {
        
        log.info("Searching tours with request: {}", request);
        
        Pageable pageable = createPageable(request.getPage(), request.getSize(), 
                                         request.getSortBy(), request.getSortDirection());
        
        // Use comprehensive filter search
        Page<Tour> tours = tourService.searchToursWithFilters(
            request.getKeyword(),
            request.getCategoryId(),
            request.getMinPrice(),
            request.getMaxPrice(),
            request.getMinDuration(),
            request.getMaxDuration(),
            request.getTourType() != null ? Tour.TourType.valueOf(request.getTourType()) : null,
            request.getLocation(),
            request.getCountryCode(),
            request.getContinent(),
            request.getMinRating(),
            request.getVisaRequired(),
            request.getFlightIncluded(),
            pageable
        );
        
        Page<TourResponse> tourResponses = tours.map(mapper::toTourResponse);
        
        return ResponseEntity.ok(successPage(tourResponses));
    }
    
    @PostMapping("/search")
    @Operation(summary = "Search tours with filters (POST)")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PageResponse<TourResponse>>> searchToursPost(@Valid @RequestBody TourSearchRequest request) {
        
        log.info("Searching tours (POST) with request: {}", request);
        
        Pageable pageable = createPageable(request.getPage(), request.getSize(), 
                                         request.getSortBy(), request.getSortDirection());
        
        // Use comprehensive filter search
        Page<Tour> tours = tourService.searchToursWithFilters(
            request.getKeyword(),
            request.getCategoryId(),
            request.getMinPrice(),
            request.getMaxPrice(),
            request.getMinDuration(),
            request.getMaxDuration(),
            request.getTourType() != null ? Tour.TourType.valueOf(request.getTourType()) : null,
            request.getLocation(),
            request.getCountryCode(),
            request.getContinent(),
            request.getMinRating(),
            request.getVisaRequired(),
            request.getFlightIncluded(),
            pageable
        );
        
        Page<TourResponse> tourResponses = tours.map(mapper::toTourResponse);
        
        return ResponseEntity.ok(successPage(tourResponses));
    }
    
    @GetMapping("/{tourId}")
    @Operation(summary = "Get tour by ID")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<TourResponse>> getTourById(
            @Parameter(description = "Tour ID") @PathVariable Long tourId) {
        
        Tour tour = tourService.getTourById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "id", tourId));
        
        return ResponseEntity.ok(success(mapper.toTourResponseWithDetails(tour)));
    }
    
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get tour by slug")
    public ResponseEntity<ApiResponse<TourResponse>> getTourBySlug(
            @Parameter(description = "Tour slug") @PathVariable String slug) {
        
        Tour tour = tourService.getTourBySlugWithDetails(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tour", "slug", slug));
        
        return ResponseEntity.ok(success(mapper.toTourResponseWithDetails(tour)));
    }
    
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get tours by category")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<TourResponse>>> getToursByCategory(
            @Parameter(description = "Category ID") @PathVariable Long categoryId) {
        
        List<Tour> tours = tourService.getToursByCategory(categoryId);
        List<TourResponse> tourResponses = mapper.toTourResponseList(tours);
        
        return ResponseEntity.ok(success(tourResponses));
    }
    
    @GetMapping("/category/slug/{categorySlug}")
    @Operation(summary = "Get tours by category slug")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<TourResponse>>> getToursByCategorySlug(
            @Parameter(description = "Category slug") @PathVariable String categorySlug) {
        
        List<Tour> tours = tourService.getToursByCategorySlug(categorySlug);
        List<TourResponse> tourResponses = mapper.toTourResponseList(tours);
        
        return ResponseEntity.ok(success(tourResponses));
    }
    
    @GetMapping("/top-rated")
    @Operation(summary = "Get top rated tours")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<TourResponse>>> getTopRatedTours(
            @Parameter(description = "Number of tours to return") @RequestParam(defaultValue = "10") int limit) {
        
        List<Tour> tours = tourService.getTopRatedTours(limit);
        List<TourResponse> tourResponses = mapper.toTourResponseList(tours);
        
        return ResponseEntity.ok(success(tourResponses));
    }
    
    @PostMapping
    @Operation(summary = "Create new tour")
    public ResponseEntity<ApiResponse<TourResponse>> createTour(@Valid @RequestBody TourCreateRequest request) {
        
        // Convert request to Tour entity
        Tour tour = new Tour();
        tour.setName(request.getName());
        tour.setSlug(request.getSlug());
        tour.setShortDescription(request.getShortDescription());
        tour.setDescription(request.getDescription());
        tour.setPrice(request.getPrice());
        tour.setSalePrice(request.getSalePrice());
        tour.setDuration(request.getDuration());
        tour.setMaxPeople(request.getMaxPeople());
        tour.setIsFeatured(request.getIsFeatured());
        
        // Set category
        Category category = categoryService.getCategoryById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        tour.setCategory(category);
        
        Tour createdTour = tourService.createTour(tour);
        
        return ResponseEntity.ok(success("Tour created successfully", mapper.toTourResponse(createdTour)));
    }
    
    @PutMapping("/{tourId}")
    @Operation(summary = "Update tour")
    public ResponseEntity<ApiResponse<TourResponse>> updateTour(
            @Parameter(description = "Tour ID") @PathVariable Long tourId,
            @Valid @RequestBody TourUpdateRequest request) {
        
        // Convert request to Tour entity
        Tour tourUpdate = new Tour();
        tourUpdate.setName(request.getName());
        tourUpdate.setShortDescription(request.getShortDescription());
        tourUpdate.setDescription(request.getDescription());
        tourUpdate.setPrice(request.getPrice());
        tourUpdate.setSalePrice(request.getSalePrice());
        tourUpdate.setDuration(request.getDuration());
        tourUpdate.setMaxPeople(request.getMaxPeople());
        tourUpdate.setIsFeatured(request.getIsFeatured());
        
        // Set category if provided
        if (request.getCategoryId() != null) {
            Category category = categoryService.getCategoryById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            tourUpdate.setCategory(category);
        }
        
        Tour updatedTour = tourService.updateTour(tourId, tourUpdate);
        
        return ResponseEntity.ok(success("Tour updated successfully", mapper.toTourResponse(updatedTour)));
    }
    
    @PutMapping("/{tourId}/featured")
    @Operation(summary = "Set tour as featured/unfeatured")
    public ResponseEntity<ApiResponse<TourResponse>> setFeaturedTour(
            @Parameter(description = "Tour ID") @PathVariable Long tourId,
            @Parameter(description = "Featured status") @RequestParam boolean featured) {
        
        Tour updatedTour = tourService.setFeaturedTour(tourId, featured);
        
        return ResponseEntity.ok(success("Tour featured status updated", mapper.toTourResponse(updatedTour)));
    }
    
    @PutMapping("/{tourId}/status")
    @Operation(summary = "Change tour status")
    public ResponseEntity<ApiResponse<TourResponse>> changeTourStatus(
            @Parameter(description = "Tour ID") @PathVariable Long tourId,
            @Parameter(description = "New status") @RequestParam TourStatus status) {
        
        Tour updatedTour = tourService.changeTourStatus(tourId, status);
        
        return ResponseEntity.ok(success("Tour status updated", mapper.toTourResponse(updatedTour)));
    }
    
    @DeleteMapping("/{tourId}")
    @Operation(summary = "Soft delete tour")
    public ResponseEntity<ApiResponse<String>> deleteTour(
            @Parameter(description = "Tour ID") @PathVariable Long tourId) {
        
        tourService.deleteTour(tourId);
        
        return ResponseEntity.ok(success("Tour deleted successfully"));
    }
    
    @GetMapping("/statistics")
    @Operation(summary = "Get tour statistics")
    public ResponseEntity<ApiResponse<TourService.TourStatistics>> getTourStatistics() {
        
        TourService.TourStatistics statistics = tourService.getTourStatistics();
        
        return ResponseEntity.ok(success(statistics));
    }
    
    @GetMapping("/check-slug/{slug}")
    @Operation(summary = "Check if slug exists")
    public ResponseEntity<ApiResponse<Boolean>> checkSlugExists(
            @Parameter(description = "Slug to check") @PathVariable String slug) {
        
        boolean exists = tourService.slugExists(slug);
        
        return ResponseEntity.ok(success("Slug check completed", exists));
    }
    
    @GetMapping("/locations")
    @Operation(summary = "Get unique locations from tours")
    public ResponseEntity<ApiResponse<List<String>>> getUniqueLocations() {
        
        List<String> locations = tourService.getUniqueLocations();
        
        return ResponseEntity.ok(success("Locations retrieved successfully", locations));
    }
}
