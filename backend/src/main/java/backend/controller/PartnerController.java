package backend.controller;

import backend.dto.*;
import backend.model.Partner;
import backend.service.PartnerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PartnerController {

    @Autowired
    private PartnerService partnerService;

    // Lấy tất cả partners với phân trang và lọc (Admin) - General endpoint
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PartnerDto>> getAllPartners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) Partner.PartnerType type,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search) {
        
        Page<PartnerDto> partners = partnerService.getAllPartners(page, size, sortBy, sortDir, type, isActive, search);
        return ResponseEntity.ok(partners);
    }

    // Lấy tất cả partners với phân trang và lọc (Admin)
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PartnerDto>> getAllPartnersAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) Partner.PartnerType type,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search) {
        
        Page<PartnerDto> partners = partnerService.getAllPartners(page, size, sortBy, sortDir, type, isActive, search);
        return ResponseEntity.ok(partners);
    }

    // Lấy partners đang active (Public)
    @GetMapping("/active")
    public ResponseEntity<List<PartnerDto>> getActivePartners() {
        List<PartnerDto> partners = partnerService.getActivePartners();
        return ResponseEntity.ok(partners);
    }

    // Lấy partners theo loại (Public)
    @GetMapping("/type/{type}")
    public ResponseEntity<List<PartnerDto>> getPartnersByType(@PathVariable Partner.PartnerType type) {
        List<PartnerDto> partners = partnerService.getPartnersByType(type);
        return ResponseEntity.ok(partners);
    }

    // Lấy partner theo ID (Public)
    @GetMapping("/{id}")
    public ResponseEntity<PartnerDto> getPartnerById(@PathVariable Long id) {
        Optional<PartnerDto> partner = partnerService.getPartnerById(id);
        return partner.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Tìm kiếm partners với bộ lọc nâng cao (Admin)
    @GetMapping("/admin/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PartnerDto>> searchPartnersWithFilters(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Partner.PartnerType type,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Partner.PriceRange priceRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Page<PartnerDto> partners = partnerService.searchPartnersWithFilters(
            search, type, isActive, minRating, priceRange, fromDate, toDate,
            page, size, sortBy, sortDir);
        return ResponseEntity.ok(partners);
    }

    // Tạo partner mới (Admin)
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPartner(@Valid @RequestBody PartnerCreateRequest request) {
        try {
            PartnerDto createdPartner = partnerService.createPartner(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPartner);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Tạo đối tác thất bại",
                "message", e.getMessage()
            ));
        }
    }

    // Cập nhật partner (Admin)
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updatePartner(
            @PathVariable Long id,
            @Valid @RequestBody PartnerUpdateRequest request) {
        try {
            PartnerDto updatedPartner = partnerService.updatePartner(id, request);
            return ResponseEntity.ok(updatedPartner);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Cập nhật đối tác thất bại",
                "message", e.getMessage()
            ));
        }
    }

    // Xóa partner (Admin)
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePartner(@PathVariable Long id) {
        try {
            partnerService.deletePartner(id);
            return ResponseEntity.ok(Map.of(
                "message", "Xóa đối tác thành công"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Xóa đối tác thất bại",
                "message", e.getMessage()
            ));
        }
    }

    // Toggle trạng thái active/inactive (Admin)
    @PatchMapping("/admin/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> togglePartnerStatus(@PathVariable Long id) {
        try {
            PartnerDto updatedPartner = partnerService.togglePartnerStatus(id);
            return ResponseEntity.ok(updatedPartner);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Thay đổi trạng thái thất bại",
                "message", e.getMessage()
            ));
        }
    }

    // Lấy thống kê partners (Admin)
    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PartnerService.PartnerStatsDto> getPartnerStats() {
        PartnerService.PartnerStatsDto stats = partnerService.getPartnerStats();
        return ResponseEntity.ok(stats);
    }

    // Lấy danh sách các enum values cho frontend
    @GetMapping("/enums/types")
    public ResponseEntity<Map<String, Object>> getPartnerTypes() {
        return ResponseEntity.ok(Map.of(
            "types", Partner.PartnerType.values(),
            "typeDisplayNames", Map.of(
                "HOTEL", Partner.PartnerType.HOTEL.getDisplayName(),
                "RESTAURANT", Partner.PartnerType.RESTAURANT.getDisplayName(),
                "TRANSPORT", Partner.PartnerType.TRANSPORT.getDisplayName()
            )
        ));
    }

    @GetMapping("/enums/price-ranges")
    public ResponseEntity<Map<String, Object>> getPriceRanges() {
        return ResponseEntity.ok(Map.of(
            "priceRanges", Partner.PriceRange.values(),
            "priceRangeDisplayNames", Map.of(
                "BUDGET", Partner.PriceRange.BUDGET.getDisplayName(),
                "MID_RANGE", Partner.PriceRange.MID_RANGE.getDisplayName(),
                "LUXURY", Partner.PriceRange.LUXURY.getDisplayName()
            )
        ));
    }
}
