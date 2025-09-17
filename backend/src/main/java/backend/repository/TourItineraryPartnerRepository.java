package backend.repository;

import backend.model.TourItineraryPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourItineraryPartnerRepository extends JpaRepository<TourItineraryPartner, Long> {
    
    // Find partners for specific itinerary
    List<TourItineraryPartner> findByItineraryId(Long itineraryId);
    
    // Find by itinerary and partner
    TourItineraryPartner findByItineraryIdAndPartnerId(Long itineraryId, Long partnerId);
    
    // Delete all partners for an itinerary
    void deleteByItineraryId(Long itineraryId);
    
    // Delete specific partner from itinerary
    void deleteByItineraryIdAndPartnerId(Long itineraryId, Long partnerId);
}
