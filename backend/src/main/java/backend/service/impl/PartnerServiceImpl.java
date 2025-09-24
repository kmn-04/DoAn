package backend.service.impl;

import backend.entity.Partner;
import backend.repository.PartnerRepository;
import backend.service.PartnerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PartnerServiceImpl implements PartnerService {

    private final PartnerRepository partnerRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<Partner> getAllPartners(Pageable pageable) {
        log.info("Getting all partners with pagination: page={}, size={}", 
                pageable.getPageNumber(), pageable.getPageSize());
        return partnerRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Partner> getPartnerById(Long id) {
        log.info("Getting partner by ID: {}", id);
        return partnerRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Partner> searchPartners(String keyword, Pageable pageable) {
        log.info("Searching partners with keyword: {}", keyword);
        if (keyword == null || keyword.trim().isEmpty()) {
            return partnerRepository.findAll(pageable);
        }
        return partnerRepository.searchByName(keyword.trim(), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Partner> getPartnersByType(Partner.PartnerType type) {
        log.info("Getting partners by type: {}", type);
        return partnerRepository.findByTypeOrderByNameAsc(type);
    }

    @Override
    public Partner createPartner(Partner partner) {
        log.info("Creating new partner: {}", partner.getName());
        // Set created/updated timestamps will be handled by @PrePersist
        return partnerRepository.save(partner);
    }

    @Override
    public Partner updatePartner(Long id, Partner partner) {
        log.info("Updating partner with ID: {}", id);
        
        Partner existingPartner = partnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found with ID: " + id));
        
        // Update fields
        existingPartner.setName(partner.getName());
        existingPartner.setSlug(partner.getSlug());
        existingPartner.setDescription(partner.getDescription());
        existingPartner.setType(partner.getType());
        existingPartner.setAddress(partner.getAddress());
        existingPartner.setPhone(partner.getPhone());
        existingPartner.setEmail(partner.getEmail());
        existingPartner.setWebsite(partner.getWebsite());
        existingPartner.setEstablishedYear(partner.getEstablishedYear());
        existingPartner.setAvatarUrl(partner.getAvatarUrl());
        existingPartner.setSpecialties(partner.getSpecialties());
        
        return partnerRepository.save(existingPartner);
    }

    @Override
    public void deletePartner(Long id) {
        log.info("Deleting partner with ID: {}", id);
        
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Partner not found with ID: " + id));
        
        partnerRepository.delete(partner);
        log.info("Partner deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Partner> getPartnersByLocation(String location) {
        log.info("Getting partners by location: {}", location);
        if (location == null || location.trim().isEmpty()) {
            return List.of();
        }
        return partnerRepository.findByAddressContaining(location.trim());
    }

    @Override
    @Transactional(readOnly = true)
    public long countPartnersByType(Partner.PartnerType type) {
        log.info("Counting partners by type: {}", type);
        return partnerRepository.countByType(type);
    }
}
