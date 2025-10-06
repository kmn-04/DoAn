package backend.repository;

import backend.entity.TourSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {
    
    // Find all schedules for a tour
    List<TourSchedule> findByTourIdOrderByDepartureDateAsc(Long tourId);
    
    // Find available schedules for a tour
    @Query("SELECT s FROM TourSchedule s WHERE s.tour.id = :tourId " +
           "AND s.status = 'Available' " +
           "AND s.departureDate >= :fromDate " +
           "ORDER BY s.departureDate ASC")
    List<TourSchedule> findAvailableSchedulesByTourId(
        @Param("tourId") Long tourId,
        @Param("fromDate") LocalDate fromDate
    );
    
    // Find schedule by tour and departure date
    Optional<TourSchedule> findByTourIdAndDepartureDate(Long tourId, LocalDate departureDate);
    
    // Find schedules by date range
    @Query("SELECT s FROM TourSchedule s WHERE s.tour.id = :tourId " +
           "AND s.departureDate BETWEEN :fromDate AND :toDate " +
           "ORDER BY s.departureDate ASC")
    List<TourSchedule> findSchedulesByTourIdAndDateRange(
        @Param("tourId") Long tourId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );
    
    // Count available schedules for a tour
    @Query("SELECT COUNT(s) FROM TourSchedule s WHERE s.tour.id = :tourId " +
           "AND s.status = 'Available' " +
           "AND s.departureDate >= :fromDate")
    Long countAvailableSchedules(@Param("tourId") Long tourId, @Param("fromDate") LocalDate fromDate);
    
    // Delete all schedules by tour ID
    @org.springframework.data.jpa.repository.Modifying
    void deleteByTourId(Long tourId);
}
