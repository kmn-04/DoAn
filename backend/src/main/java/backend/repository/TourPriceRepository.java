package backend.repository;

import backend.entity.TourPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TourPriceRepository extends JpaRepository<TourPrice, Long> {
    
    // Find all prices for a tour
    List<TourPrice> findByTourIdOrderByValidFromAsc(Long tourId);
    
    // Find price valid for a specific date
    @Query("SELECT p FROM TourPrice p WHERE p.tour.id = :tourId " +
           "AND :date BETWEEN p.validFrom AND p.validTo")
    Optional<TourPrice> findValidPriceByTourIdAndDate(
        @Param("tourId") Long tourId,
        @Param("date") LocalDate date
    );
    
    // Find prices by season
    @Query("SELECT p FROM TourPrice p WHERE p.tour.id = :tourId " +
           "AND p.season = :season " +
           "ORDER BY p.validFrom ASC")
    List<TourPrice> findByTourIdAndSeason(
        @Param("tourId") Long tourId,
        @Param("season") String season
    );
    
    // Find prices overlapping with date range
    @Query("SELECT p FROM TourPrice p WHERE p.tour.id = :tourId " +
           "AND p.validFrom <= :toDate AND p.validTo >= :fromDate")
    List<TourPrice> findOverlappingPrices(
        @Param("tourId") Long tourId,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );
    
    // Delete all prices by tour ID
    @org.springframework.data.jpa.repository.Modifying
    void deleteByTourId(Long tourId);
}
