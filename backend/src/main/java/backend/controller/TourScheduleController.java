package backend.controller;

import backend.dto.request.TourScheduleRequest;
import backend.dto.response.ApiResponse;
import backend.dto.response.TourScheduleResponse;
import backend.service.TourScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static backend.dto.response.ApiResponse.success;

@RestController
@RequestMapping("/api/tour-schedules")
@RequiredArgsConstructor
@Tag(name = "Tour Schedules", description = "API quản lý lịch khởi hành tour")
public class TourScheduleController {
    
    private final TourScheduleService scheduleService;
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo lịch khởi hành mới")
    public ResponseEntity<ApiResponse<TourScheduleResponse>> createSchedule(
            @Valid @RequestBody TourScheduleRequest request) {
        TourScheduleResponse response = scheduleService.createSchedule(request);
        return ResponseEntity.ok(success("Schedule created successfully", response));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật lịch khởi hành")
    public ResponseEntity<ApiResponse<TourScheduleResponse>> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody TourScheduleRequest request) {
        TourScheduleResponse response = scheduleService.updateSchedule(id, request);
        return ResponseEntity.ok(success("Schedule updated successfully", response));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa lịch khởi hành")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(success("Schedule deleted successfully", null));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin lịch khởi hành")
    public ResponseEntity<ApiResponse<TourScheduleResponse>> getScheduleById(@PathVariable Long id) {
        TourScheduleResponse response = scheduleService.getScheduleById(id);
        return ResponseEntity.ok(success("Schedule retrieved successfully", response));
    }
    
    @GetMapping("/tour/{tourId}")
    @Operation(summary = "Lấy tất cả lịch khởi hành của tour")
    public ResponseEntity<ApiResponse<List<TourScheduleResponse>>> getSchedulesByTourId(
            @PathVariable Long tourId) {
        List<TourScheduleResponse> schedules = scheduleService.getSchedulesByTourId(tourId);
        return ResponseEntity.ok(success("Schedules retrieved successfully", schedules));
    }
    
    @GetMapping("/tour/{tourId}/available")
    @Operation(summary = "Lấy các lịch còn chỗ của tour")
    public ResponseEntity<ApiResponse<List<TourScheduleResponse>>> getAvailableSchedules(
            @PathVariable Long tourId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate) {
        LocalDate date = fromDate != null ? fromDate : LocalDate.now();
        List<TourScheduleResponse> schedules = scheduleService.getAvailableSchedules(tourId, date);
        return ResponseEntity.ok(success("Available schedules retrieved successfully", schedules));
    }
    
    @GetMapping("/tour/{tourId}/range")
    @Operation(summary = "Lấy lịch khởi hành theo khoảng thời gian")
    public ResponseEntity<ApiResponse<List<TourScheduleResponse>>> getSchedulesByDateRange(
            @PathVariable Long tourId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<TourScheduleResponse> schedules = scheduleService.getSchedulesByDateRange(tourId, fromDate, toDate);
        return ResponseEntity.ok(success("Schedules retrieved successfully", schedules));
    }
}
