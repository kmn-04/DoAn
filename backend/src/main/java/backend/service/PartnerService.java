package backend.service;

import backend.entity.Partner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface PartnerService {
    
    /**
     * Get all partners with pagination
     */
    Page<Partner> getAllPartners(Pageable pageable);
    
    /**
     * Get partner by ID
     */
    Optional<Partner> getPartnerById(Long id);
    
    /**
     * Search partners by keyword
     */
    Page<Partner> searchPartners(String keyword, Pageable pageable);
    
    /**
     * Get partners by type
     */
    List<Partner> getPartnersByType(Partner.PartnerType type);
    
    /**
     * Create new partner
     */
    Partner createPartner(Partner partner);
    
    /**
     * Update partner
     */
    Partner updatePartner(Long id, Partner partner);
    
    /**
     * Delete partner
     */
    void deletePartner(Long id);
    
    /**
     * Get partners by location
     */
    List<Partner> getPartnersByLocation(String location);
    
    /**
     * Count partners by type
     */
    long countPartnersByType(Partner.PartnerType type);
}
