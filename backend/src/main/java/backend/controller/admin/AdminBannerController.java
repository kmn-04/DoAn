package backend.controller.admin;

import backend.dto.request.BannerRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.BannerResponse;
import backend.entity.Banner;
import backend.repository.BannerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Banner Management", description = "Admin APIs for banner management")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class AdminBannerController {
    
    private final BannerRepository bannerRepository;
    
    @GetMapping
    @Operation(summary = "Get all banners")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getAllBanners() {
        try {
            List<Banner> banners = bannerRepository.findAllByOrderByDisplayOrderAsc();
            
            List<BannerResponse> responses = banners.stream()
                .map(this::toBannerResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Banners retrieved", responses));
        } catch (Exception e) {
            log.error("Error getting banners", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Error getting banners: " + e.getMessage()));
        }
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get banner by ID")
    public ResponseEntity<ApiResponse<BannerResponse>> getBannerById(@PathVariable Long id) {
        try {
            Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
            
            return ResponseEntity.ok(ApiResponse.success("Banner retrieved", toBannerResponse(banner)));
        } catch (Exception e) {
            log.error("Error getting banner", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Error getting banner: " + e.getMessage()));
        }
    }
    
    @PostMapping
    @Operation(summary = "Create new banner")
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(@Valid @RequestBody BannerRequest request) {
        try {
            Banner banner = new Banner();
            banner.setTitle(request.getTitle());
            banner.setSubtitle(request.getSubtitle());
            banner.setImageUrl(request.getImageUrl());
            banner.setLinkUrl(request.getLinkUrl());
            banner.setButtonText(request.getButtonText());
            banner.setDisplayOrder(request.getDisplayOrder());
            banner.setIsActive(request.getIsActive());
            banner.setStartDate(request.getStartDate());
            banner.setEndDate(request.getEndDate());
            
            Banner saved = bannerRepository.save(banner);
            
            return ResponseEntity.ok(ApiResponse.success("Banner created", toBannerResponse(saved)));
        } catch (Exception e) {
            log.error("Error creating banner", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Error creating banner: " + e.getMessage()));
        }
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update banner")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(
            @PathVariable Long id,
            @Valid @RequestBody BannerRequest request) {
        try {
            Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
            
            banner.setTitle(request.getTitle());
            banner.setSubtitle(request.getSubtitle());
            banner.setImageUrl(request.getImageUrl());
            banner.setLinkUrl(request.getLinkUrl());
            banner.setButtonText(request.getButtonText());
            banner.setDisplayOrder(request.getDisplayOrder());
            banner.setIsActive(request.getIsActive());
            banner.setStartDate(request.getStartDate());
            banner.setEndDate(request.getEndDate());
            
            Banner updated = bannerRepository.save(banner);
            
            return ResponseEntity.ok(ApiResponse.success("Banner updated", toBannerResponse(updated)));
        } catch (Exception e) {
            log.error("Error updating banner", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Error updating banner: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete banner")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        try {
            bannerRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Banner deleted", null));
        } catch (Exception e) {
            log.error("Error deleting banner", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Error deleting banner: " + e.getMessage()));
        }
    }
    
    private BannerResponse toBannerResponse(Banner banner) {
        return BannerResponse.builder()
            .id(banner.getId())
            .title(banner.getTitle())
            .subtitle(banner.getSubtitle())
            .imageUrl(banner.getImageUrl())
            .linkUrl(banner.getLinkUrl())
            .buttonText(banner.getButtonText())
            .displayOrder(banner.getDisplayOrder())
            .isActive(banner.getIsActive())
            .startDate(banner.getStartDate())
            .endDate(banner.getEndDate())
            .createdAt(banner.getCreatedAt())
            .updatedAt(banner.getUpdatedAt())
            .build();
    }
}

