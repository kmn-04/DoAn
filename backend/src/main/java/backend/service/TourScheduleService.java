package backend.service;

import backend.dto.request.TourScheduleRequest;
import backend.dto.response.TourScheduleResponse;

import java.time.LocalDate;
import java.util.List;

public interface TourScheduleService {
    
    // Create a new schedule
    TourScheduleResponse createSchedule(TourScheduleRequest request);
    
    // Update an existing schedule
    TourScheduleResponse updateSchedule(Long id, TourScheduleRequest request);
    
    // Delete a schedule
    void deleteSchedule(Long id);
    
    // Get schedule by ID
    TourScheduleResponse getScheduleById(Long id);
    
    // Get all schedules for a tour
    List<TourScheduleResponse> getSchedulesByTourId(Long tourId);
    
    // Get available schedules for a tour
    List<TourScheduleResponse> getAvailableSchedules(Long tourId, LocalDate fromDate);
    
    // Get schedules by date range
    List<TourScheduleResponse> getSchedulesByDateRange(Long tourId, LocalDate fromDate, LocalDate toDate);
    
    // Book seats for a schedule
    void bookSeats(Long scheduleId, Integer seats);
    
    // Release seats for a schedule
    void releaseSeats(Long scheduleId, Integer seats);
}
