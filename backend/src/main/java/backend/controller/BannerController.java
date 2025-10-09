package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.BannerResponse;
import backend.entity.Banner;
import backend.repository.BannerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Banner Management", description = "APIs for homepage banners")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class BannerController {
    
    private final BannerRepository bannerRepository;
    
    @GetMapping("/active")
    @Operation(summary = "Get active banners for homepage")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getActiveBanners() {
        try {
            List<Banner> banners = bannerRepository.findActiveBannersInDateRange(LocalDateTime.now());
            
            List<BannerResponse> responses = banners.stream()
                .map(this::toBannerResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("Active banners retrieved", responses));
        } catch (Exception e) {
            log.error("Error getting active banners", e);
            return ResponseEntity.ok(ApiResponse.success("Active banners retrieved", List.of()));
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

