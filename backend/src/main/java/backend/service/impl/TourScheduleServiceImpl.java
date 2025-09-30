package backend.service.impl;

import backend.dto.request.TourScheduleRequest;
import backend.dto.response.TourScheduleResponse;
import backend.entity.Tour;
import backend.entity.TourSchedule;
import backend.mapper.EntityMapper;
import backend.repository.TourRepository;
import backend.repository.TourScheduleRepository;
import backend.service.TourScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TourScheduleServiceImpl implements TourScheduleService {
    
    private final TourScheduleRepository scheduleRepository;
    private final TourRepository tourRepository;
    private final EntityMapper entityMapper;
    
    @Override
    @Transactional
    public TourScheduleResponse createSchedule(TourScheduleRequest request) {
        Tour tour = tourRepository.findById(request.getTourId())
            .orElseThrow(() -> new RuntimeException("Tour not found"));
        
        TourSchedule schedule = new TourSchedule();
        schedule.setTour(tour);
        schedule.setDepartureDate(request.getDepartureDate());
        schedule.setReturnDate(request.getReturnDate());
        schedule.setAvailableSeats(request.getAvailableSeats());
        schedule.setAdultPrice(request.getAdultPrice());
        schedule.setChildPrice(request.getChildPrice());
        schedule.setInfantPrice(request.getInfantPrice());
        schedule.setNote(request.getNote());
        
        if (request.getStatus() != null) {
            schedule.setStatus(TourSchedule.ScheduleStatus.valueOf(request.getStatus()));
        }
        
        TourSchedule saved = scheduleRepository.save(schedule);
        return entityMapper.toTourScheduleResponse(saved);
    }
    
    @Override
    @Transactional
    public TourScheduleResponse updateSchedule(Long id, TourScheduleRequest request) {
        TourSchedule schedule = scheduleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Schedule not found"));
        
        schedule.setDepartureDate(request.getDepartureDate());
        schedule.setReturnDate(request.getReturnDate());
        schedule.setAvailableSeats(request.getAvailableSeats());
        schedule.setAdultPrice(request.getAdultPrice());
        schedule.setChildPrice(request.getChildPrice());
        schedule.setInfantPrice(request.getInfantPrice());
        schedule.setNote(request.getNote());
        
        if (request.getStatus() != null) {
            schedule.setStatus(TourSchedule.ScheduleStatus.valueOf(request.getStatus()));
        }
        
        TourSchedule updated = scheduleRepository.save(schedule);
        return entityMapper.toTourScheduleResponse(updated);
    }
    
    @Override
    @Transactional
    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }
    
    @Override
    public TourScheduleResponse getScheduleById(Long id) {
        TourSchedule schedule = scheduleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Schedule not found"));
        return entityMapper.toTourScheduleResponse(schedule);
    }
    
    @Override
    public List<TourScheduleResponse> getSchedulesByTourId(Long tourId) {
        List<TourSchedule> schedules = scheduleRepository.findByTourIdOrderByDepartureDateAsc(tourId);
        return entityMapper.toTourScheduleResponseList(schedules);
    }
    
    @Override
    public List<TourScheduleResponse> getAvailableSchedules(Long tourId, LocalDate fromDate) {
        List<TourSchedule> schedules = scheduleRepository.findAvailableSchedulesByTourId(tourId, fromDate);
        return entityMapper.toTourScheduleResponseList(schedules);
    }
    
    @Override
    public List<TourScheduleResponse> getSchedulesByDateRange(Long tourId, LocalDate fromDate, LocalDate toDate) {
        List<TourSchedule> schedules = scheduleRepository.findSchedulesByTourIdAndDateRange(tourId, fromDate, toDate);
        return entityMapper.toTourScheduleResponseList(schedules);
    }
    
    @Override
    @Transactional
    public void bookSeats(Long scheduleId, Integer seats) {
        TourSchedule schedule = scheduleRepository.findById(scheduleId)
            .orElseThrow(() -> new RuntimeException("Schedule not found"));
        schedule.bookSeats(seats);
        scheduleRepository.save(schedule);
    }
    
    @Override
    @Transactional
    public void releaseSeats(Long scheduleId, Integer seats) {
        TourSchedule schedule = scheduleRepository.findById(scheduleId)
            .orElseThrow(() -> new RuntimeException("Schedule not found"));
        schedule.releaseSeats(seats);
        scheduleRepository.save(schedule);
    }
}
