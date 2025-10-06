package backend.controller;

import backend.dto.request.PromotionRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.PageResponse;
import backend.dto.response.PromotionResponse;
import backend.entity.Promotion;
import backend.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Promotion Management", description = "APIs for managing promotions and discount codes")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class PromotionController extends BaseController {
    
    private final PromotionService promotionService;
    
    // ================================
    // ADMIN ENDPOINTS
    // ================================
    
    @PostMapping("/admin/promotions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create promotion", description = "Create a new promotion (Admin only)")
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(
            @Valid @RequestBody PromotionRequest request) {
        
        try {
            log.info("Admin creating promotion with code: {}", request.getCode());
            
            Promotion promotion = promotionService.createPromotion(request);
            PromotionResponse response = promotionService.toResponse(promotion);
            
            return ResponseEntity.ok(success("Promotion created successfully", response));
            
        } catch (Exception e) {
            log.error("Error creating promotion", e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to create promotion: " + e.getMessage()));
        }
    }
    
    @GetMapping("/admin/promotions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all promotions", description = "Get all promotions with pagination (Admin only)")
    public ResponseEntity<ApiResponse<PageResponse<PromotionResponse>>> getAllPromotions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search) {
        
        try {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<Promotion> promotionPage;
            if (search != null && !search.trim().isEmpty()) {
                promotionPage = promotionService.searchPromotions(search.trim(), pageable);
            } else {
                promotionPage = promotionService.getAllPromotions(pageable);
            }
            
            // Convert to DTO
            Page<PromotionResponse> responsePage = promotionPage.map(promotionService::toResponse);
            
            return ResponseEntity.ok(successPage(responsePage));
            
        } catch (Exception e) {
            log.error("Error getting promotions", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get promotions: " + e.getMessage()));
        }
    }
    
    @GetMapping("/admin/promotions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get promotion by ID", description = "Get promotion details by ID (Admin only)")
    public ResponseEntity<ApiResponse<PromotionResponse>> getPromotionById(
            @Parameter(description = "Promotion ID") @PathVariable Long id) {
        
        try {
            Promotion promotion = promotionService.getPromotionById(id)
                    .orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + id));
            
            PromotionResponse response = promotionService.toResponse(promotion);
            
            return ResponseEntity.ok(success("Promotion retrieved successfully", response));
            
        } catch (Exception e) {
            log.error("Error getting promotion", e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to get promotion: " + e.getMessage()));
        }
    }
    
    @PutMapping("/admin/promotions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update promotion", description = "Update an existing promotion (Admin only)")
    public ResponseEntity<ApiResponse<PromotionResponse>> updatePromotion(
            @Parameter(description = "Promotion ID") @PathVariable Long id,
            @Valid @RequestBody PromotionRequest request) {
        
        try {
            log.info("Admin updating promotion ID: {}", id);
            
            Promotion promotion = promotionService.updatePromotion(id, request);
            PromotionResponse response = promotionService.toResponse(promotion);
            
            return ResponseEntity.ok(success("Promotion updated successfully", response));
            
        } catch (Exception e) {
            log.error("Error updating promotion", e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to update promotion: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/admin/promotions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete promotion", description = "Delete a promotion (Admin only)")
    public ResponseEntity<ApiResponse<String>> deletePromotion(
            @Parameter(description = "Promotion ID") @PathVariable Long id) {
        
        try {
            log.info("Admin deleting promotion ID: {}", id);
            
            promotionService.deletePromotion(id);
            
            return ResponseEntity.ok(success("Promotion deleted successfully", null));
            
        } catch (Exception e) {
            log.error("Error deleting promotion", e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to delete promotion: " + e.getMessage()));
        }
    }
    
    @PostMapping("/admin/promotions/mark-expired")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mark expired promotions", description = "Mark all expired promotions as Expired (Admin only)")
    public ResponseEntity<ApiResponse<String>> markExpiredPromotions() {
        
        try {
            promotionService.markExpiredPromotions();
            return ResponseEntity.ok(success("Expired promotions marked successfully", null));
            
        } catch (Exception e) {
            log.error("Error marking expired promotions", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to mark expired promotions: " + e.getMessage()));
        }
    }
    
    // ================================
    // PUBLIC ENDPOINTS
    // ================================
    
    @GetMapping("/promotions")
    @Operation(summary = "Get all promotions (public)", description = "Get all active promotions with pagination")
    public ResponseEntity<ApiResponse<Page<PromotionResponse>>> getAllPromotionsPublic(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            // Get active promotions only for public endpoint
            Page<PromotionResponse> promotionPage = promotionService.getAllPromotions(pageable)
                    .map(promotionService::toResponse);
            
            return ResponseEntity.ok(success("Promotions retrieved successfully", promotionPage));
            
        } catch (Exception e) {
            log.error("Error getting promotions", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get promotions: " + e.getMessage()));
        }
    }
    
    @GetMapping("/promotions/active")
    @Operation(summary = "Get active promotions", description = "Get all currently active promotions")
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getActivePromotions() {
        
        try {
            List<Promotion> promotions = promotionService.getValidPromotions();
            List<PromotionResponse> responses = promotions.stream()
                    .map(promotionService::toResponse)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(success("Active promotions retrieved successfully", responses));
            
        } catch (Exception e) {
            log.error("Error getting active promotions", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get active promotions: " + e.getMessage()));
        }
    }
    
    @PostMapping("/promotions/validate")
    @Operation(summary = "Validate promotion code", description = "Validate a promotion code and return promotion details if valid")
    public ResponseEntity<ApiResponse<PromotionResponse>> validatePromotionCode(
            @RequestBody Map<String, String> request) {
        
        try {
            String code = request.get("code");
            
            if (code == null || code.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(error("Promotion code is required"));
            }
            
            log.info("Validating promotion code: {}", code);
            
            Promotion promotion = promotionService.validatePromotionCode(code)
                    .orElseThrow(() -> new RuntimeException("Invalid or expired promotion code"));
            
            PromotionResponse response = promotionService.toResponse(promotion);
            
            return ResponseEntity.ok(success("Promotion code is valid", response));
            
        } catch (Exception e) {
            log.warn("Promotion validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(error(e.getMessage()));
        }
    }
    
    @GetMapping("/promotions/{code}")
    @Operation(summary = "Get promotion by code", description = "Get promotion details by code")
    public ResponseEntity<ApiResponse<PromotionResponse>> getPromotionByCode(
            @Parameter(description = "Promotion code") @PathVariable String code) {
        
        try {
            Promotion promotion = promotionService.getPromotionByCode(code)
                    .orElseThrow(() -> new RuntimeException("Promotion not found with code: " + code));
            
            PromotionResponse response = promotionService.toResponse(promotion);
            
            return ResponseEntity.ok(success("Promotion retrieved successfully", response));
            
        } catch (Exception e) {
            log.error("Error getting promotion by code", e);
            return ResponseEntity.badRequest()
                    .body(error("Failed to get promotion: " + e.getMessage()));
        }
    }
    
    @GetMapping("/admin/promotions/count")
    @Operation(summary = "Get total promotions count", description = "Get total number of promotions (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getTotalPromotionsCount() {
        try {
            long count = promotionService.getTotalPromotions();
            return ResponseEntity.ok(success("Total promotions count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting promotions count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get promotions count: " + e.getMessage()));
        }
    }
    
    @GetMapping("/admin/promotions/count/active")
    @Operation(summary = "Get active promotions count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> getActivePromotionsCount() {
        try {
            long count = promotionService.getValidPromotions().size();
            return ResponseEntity.ok(success("Active promotions count retrieved successfully", count));
        } catch (Exception e) {
            log.error("Error getting active promotions count", e);
            return ResponseEntity.internalServerError()
                    .body(error("Failed to get active promotions count: " + e.getMessage()));
        }
    }
}

