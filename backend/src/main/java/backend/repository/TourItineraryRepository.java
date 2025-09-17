package backend.repository;

import backend.model.TourItinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourItineraryRepository extends JpaRepository<TourItinerary, Long> {
    
    // Find itinerary by tour ID ordered by day number
    List<TourItinerary> findByTourIdOrderByDayNumberAsc(Long tourId);
    
    // Find specific day for a tour
    TourItinerary findByTourIdAndDayNumber(Long tourId, Integer dayNumber);
    
    // Get max day number for a tour
    @Query("SELECT MAX(ti.dayNumber) FROM TourItinerary ti WHERE ti.tour.id = :tourId")
    Integer findMaxDayNumberByTourId(@Param("tourId") Long tourId);
    
    // Delete all itinerary for a tour
    void deleteByTourId(Long tourId);
}
