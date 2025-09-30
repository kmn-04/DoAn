package backend.repository;

import backend.entity.BookingParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingParticipantRepository extends JpaRepository<BookingParticipant, Long> {
    
    // Find all participants for a booking
    List<BookingParticipant> findByBookingId(Long bookingId);
    
    // Count participants by type for a booking
    @Query("SELECT COUNT(p) FROM BookingParticipant p WHERE p.booking.id = :bookingId " +
           "AND p.participantType = :type")
    Long countByBookingIdAndType(
        @Param("bookingId") Long bookingId,
        @Param("type") String type
    );
    
    // Find participants by booking and type
    @Query("SELECT p FROM BookingParticipant p WHERE p.booking.id = :bookingId " +
           "AND p.participantType = :type")
    List<BookingParticipant> findByBookingIdAndType(
        @Param("bookingId") Long bookingId,
        @Param("type") String type
    );
    
    // Delete all participants for a booking
    void deleteByBookingId(Long bookingId);
}
