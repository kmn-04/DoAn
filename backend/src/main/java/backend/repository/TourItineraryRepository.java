package backend.repository;

import backend.entity.TourItinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourItineraryRepository extends JpaRepository<TourItinerary, Long> {
    
    /**
     * Find itineraries by tour ID, ordered by day number
     */
    List<TourItinerary> findByTourIdOrderByDayNumberAsc(Long tourId);
    
    /**
     * Find itinerary by tour ID and day number
     */
    TourItinerary findByTourIdAndDayNumber(Long tourId, Integer dayNumber);
    
    /**
     * Find itineraries by partner
     */
    List<TourItinerary> findByPartnerId(Long partnerId);
    
    /**
     * Count itineraries by tour
     */
    long countByTourId(Long tourId);
    
    /**
     * Find itineraries with partner details
     */
    @Query("SELECT ti FROM TourItinerary ti LEFT JOIN FETCH ti.partner WHERE ti.tour.id = :tourId ORDER BY ti.dayNumber")
    List<TourItinerary> findByTourIdWithPartner(@Param("tourId") Long tourId);
    
    /**
     * Delete all itineraries by tour ID
     */
    void deleteByTourId(Long tourId);
}
