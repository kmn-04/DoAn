package backend.controller;

import backend.dto.*;
import backend.model.Tour;
import backend.service.TourService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TourController {
    
    private final TourService tourService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<TourDto>> getAllTours(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Tour.TourStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean isFeatured) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<TourDto> tours;
        if (keyword != null || status != null || categoryId != null || 
            minPrice != null || maxPrice != null || isFeatured != null) {
            tours = tourService.searchTours(keyword, status, categoryId, minPrice, maxPrice, isFeatured, pageable);
        } else {
            tours = tourService.getAllTours(pageable);
        }
        
        return ResponseEntity.ok(tours);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TourDto> getTourById(@PathVariable Long id) {
        TourDto tour = tourService.getTourById(id);
        return ResponseEntity.ok(tour);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TourDto> createTour(@Valid @RequestBody TourCreateRequest request) {
        TourDto createdTour = tourService.createTour(request);
        return ResponseEntity.ok(createdTour);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TourDto> updateTour(@PathVariable Long id, @Valid @RequestBody TourUpdateRequest request) {
        TourDto updatedTour = tourService.updateTour(id, request);
        return ResponseEntity.ok(updatedTour);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTour(@PathVariable Long id) {
        tourService.deleteTour(id);
        return ResponseEntity.ok().build();
    }
    
    // Update trạng thái tour (Admin)
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTourStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Trạng thái không được để trống"
                ));
            }
            
            TourDto updatedTour = tourService.updateTourStatus(id, Tour.TourStatus.valueOf(status));
            return ResponseEntity.ok(updatedTour);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Trạng thái không hợp lệ",
                "message", e.getMessage()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Cập nhật trạng thái tour thất bại",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/admin/stats")
    // @PreAuthorize("hasRole('ADMIN')") // Temporary disable for testing
    public ResponseEntity<Map<String, Object>> getTourStats() {
        Map<String, Object> stats = tourService.getTourStats();
        return ResponseEntity.ok(stats);
    }
}
