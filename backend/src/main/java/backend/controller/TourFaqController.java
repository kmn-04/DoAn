package backend.controller;

import backend.dto.request.TourFaqRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.TourFaqResponse;
import backend.service.TourFaqService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static backend.dto.response.ApiResponse.success;

@RestController
@RequestMapping("/api/tour-faqs")
@RequiredArgsConstructor
@Tag(name = "Tour FAQs", description = "API quản lý câu hỏi thường gặp của tour")
public class TourFaqController {
    
    private final TourFaqService faqService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo FAQ mới")
    public ResponseEntity<ApiResponse<TourFaqResponse>> createFaq(
            @Valid @RequestBody TourFaqRequest request) {
        TourFaqResponse response = faqService.createFaq(request);
        return ResponseEntity.ok(success("FAQ created successfully", response));
    }
    
    @PostMapping("/batch")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo nhiều FAQs cùng lúc")
    public ResponseEntity<ApiResponse<List<TourFaqResponse>>> createMultipleFaqs(
            @Valid @RequestBody List<TourFaqRequest> requests) {
        List<TourFaqResponse> responses = faqService.createMultipleFaqs(requests);
        return ResponseEntity.ok(success("FAQs created successfully", responses));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật FAQ")
    public ResponseEntity<ApiResponse<TourFaqResponse>> updateFaq(
            @PathVariable Long id,
            @Valid @RequestBody TourFaqRequest request) {
        TourFaqResponse response = faqService.updateFaq(id, request);
        return ResponseEntity.ok(success("FAQ updated successfully", response));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa FAQ")
    public ResponseEntity<ApiResponse<Void>> deleteFaq(@PathVariable Long id) {
        faqService.deleteFaq(id);
        return ResponseEntity.ok(success("FAQ deleted successfully", null));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin FAQ")
    public ResponseEntity<ApiResponse<TourFaqResponse>> getFaqById(@PathVariable Long id) {
        TourFaqResponse response = faqService.getFaqById(id);
        return ResponseEntity.ok(success("FAQ retrieved successfully", response));
    }
    
    @GetMapping("/tour/{tourId}")
    @Operation(summary = "Lấy tất cả FAQs của tour")
    public ResponseEntity<ApiResponse<List<TourFaqResponse>>> getFaqsByTourId(
            @PathVariable Long tourId) {
        List<TourFaqResponse> faqs = faqService.getFaqsByTourId(tourId);
        return ResponseEntity.ok(success("FAQs retrieved successfully", faqs));
    }
    
    @GetMapping("/tour/{tourId}/search")
    @Operation(summary = "Tìm kiếm FAQs theo từ khóa")
    public ResponseEntity<ApiResponse<List<TourFaqResponse>>> searchFaqs(
            @PathVariable Long tourId,
            @RequestParam String keyword) {
        List<TourFaqResponse> faqs = faqService.searchFaqs(tourId, keyword);
        return ResponseEntity.ok(success("FAQs retrieved successfully", faqs));
    }
}
