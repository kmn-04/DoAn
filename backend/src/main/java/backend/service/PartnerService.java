package backend.service;

import backend.dto.*;
import backend.model.Partner;
import backend.repository.PartnerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PartnerService {

    @Autowired
    private PartnerRepository partnerRepository;

    // Lấy tất cả partners với phân trang và lọc
    public Page<PartnerDto> getAllPartners(int page, int size, String sortBy, String sortDir, 
                                          Partner.PartnerType type, Boolean isActive, String search) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Partner> partners;
        
        // Áp dụng các bộ lọc
        if (search != null && !search.trim().isEmpty()) {
            if (type != null && isActive != null) {
                partners = partnerRepository.findByNameContainingIgnoreCaseAndTypeAndIsActive(
                    search, type, isActive, pageable);
            } else if (type != null) {
                partners = partnerRepository.findByNameContainingIgnoreCaseAndType(search, type, pageable);
            } else if (isActive != null) {
                partners = partnerRepository.findByNameContainingIgnoreCaseAndIsActive(search, isActive, pageable);
            } else {
                partners = partnerRepository.findByNameContainingIgnoreCase(search, pageable);
            }
        } else {
            if (type != null && isActive != null) {
                partners = partnerRepository.findByTypeAndIsActive(type, isActive, pageable);
            } else if (type != null) {
                partners = partnerRepository.findByType(type, pageable);
            } else if (isActive != null) {
                partners = partnerRepository.findByIsActive(isActive, pageable);
            } else {
                partners = partnerRepository.findAll(pageable);
            }
        }
        
        return partners.map(this::convertToDto);
    }

    // Lấy tất cả partners đang active
    public List<PartnerDto> getActivePartners() {
        List<Partner> partners = partnerRepository.findByIsActive(true);
        return partners.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Lấy partners theo loại
    public List<PartnerDto> getPartnersByType(Partner.PartnerType type) {
        List<Partner> partners = partnerRepository.findByTypeAndIsActive(type, true);
        return partners.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // Lấy partner theo ID
    public Optional<PartnerDto> getPartnerById(Long id) {
        return partnerRepository.findById(id)
                .map(this::convertToDto);
    }

    // Tìm kiếm partners với bộ lọc nâng cao
    public Page<PartnerDto> searchPartnersWithFilters(
            String search, Partner.PartnerType type, Boolean isActive, 
            Integer minRating, Partner.PriceRange priceRange,
            LocalDateTime fromDate, LocalDateTime toDate,
            int page, int size, String sortBy, String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : 
            Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Partner> partners = partnerRepository.findPartnersWithFilters(
            search, type, isActive, minRating, priceRange, fromDate, toDate, pageable);
        
        return partners.map(this::convertToDto);
    }

    // Tạo partner mới
    public PartnerDto createPartner(PartnerCreateRequest request) {
        // Kiểm tra tên đối tác đã tồn tại chưa
        if (partnerRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Tên đối tác đã tồn tại");
        }

        Partner partner = new Partner();
        partner.setName(request.getName());
        partner.setType(request.getType());
        partner.setAvatarUrl(request.getAvatarUrl());
        partner.setGalleryImages(request.getGalleryImages());
        partner.setDescription(request.getDescription());
        partner.setAddress(request.getAddress());
        partner.setPhone(request.getPhone());
        partner.setEmail(request.getEmail());
        partner.setWebsite(request.getWebsite());
        partner.setAmenities(request.getAmenities());
        partner.setRating(request.getRating() != null ? request.getRating() : 1);
        partner.setPriceRange(request.getPriceRange());
        partner.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        Partner savedPartner = partnerRepository.save(partner);
        return convertToDto(savedPartner);
    }

    // Cập nhật partner
    public PartnerDto updatePartner(Long id, PartnerUpdateRequest request) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đối tác với ID: " + id));

        // Kiểm tra tên đối tác đã tồn tại chưa (trừ chính nó)
        if (partnerRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new RuntimeException("Tên đối tác đã tồn tại");
        }

        partner.setName(request.getName());
        partner.setType(request.getType());
        partner.setAvatarUrl(request.getAvatarUrl());
        partner.setGalleryImages(request.getGalleryImages());
        partner.setDescription(request.getDescription());
        partner.setAddress(request.getAddress());
        partner.setPhone(request.getPhone());
        partner.setEmail(request.getEmail());
        partner.setWebsite(request.getWebsite());
        partner.setAmenities(request.getAmenities());
        partner.setRating(request.getRating());
        partner.setPriceRange(request.getPriceRange());
        partner.setIsActive(request.getIsActive());

        Partner savedPartner = partnerRepository.save(partner);
        return convertToDto(savedPartner);
    }

    // Xóa partner
    public void deletePartner(Long id) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đối tác với ID: " + id));
        
        partnerRepository.delete(partner);
    }

    // Thay đổi trạng thái partner
    public PartnerDto togglePartnerStatus(Long id) {
        Partner partner = partnerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đối tác với ID: " + id));
        
        partner.setIsActive(!partner.getIsActive());
        Partner savedPartner = partnerRepository.save(partner);
        return convertToDto(savedPartner);
    }

    // Thống kê partners
    public PartnerStatsDto getPartnerStats() {
        long totalPartners = partnerRepository.count();
        long activePartners = partnerRepository.countByIsActive(true);
        long inactivePartners = partnerRepository.countByIsActive(false);
        
        long hotelCount = partnerRepository.countByTypeAndIsActive(Partner.PartnerType.HOTEL, true);
        long restaurantCount = partnerRepository.countByTypeAndIsActive(Partner.PartnerType.RESTAURANT, true);
        long transportCount = partnerRepository.countByTypeAndIsActive(Partner.PartnerType.TRANSPORT, true);
        
        long highRatedCount = partnerRepository.countByRatingGreaterThanEqual(4);

        PartnerStatsDto stats = new PartnerStatsDto();
        stats.setTotalPartners(totalPartners);
        stats.setActivePartners(activePartners);
        stats.setInactivePartners(inactivePartners);
        stats.setHotelCount(hotelCount);
        stats.setRestaurantCount(restaurantCount);
        stats.setTransportCount(transportCount);
        stats.setHighRatedCount(highRatedCount);

        return stats;
    }

    // Chuyển đổi Entity thành DTO
    private PartnerDto convertToDto(Partner partner) {
        PartnerDto dto = new PartnerDto();
        dto.setId(partner.getId());
        dto.setName(partner.getName());
        dto.setType(partner.getType());
        dto.setAvatarUrl(partner.getAvatarUrl());
        dto.setGalleryImages(partner.getGalleryImages());
        dto.setDescription(partner.getDescription());
        dto.setAddress(partner.getAddress());
        dto.setPhone(partner.getPhone());
        dto.setEmail(partner.getEmail());
        dto.setWebsite(partner.getWebsite());
        dto.setAmenities(partner.getAmenities());
        dto.setRating(partner.getRating());
        dto.setPriceRange(partner.getPriceRange());
        dto.setIsActive(partner.getIsActive());
        dto.setCreatedAt(partner.getCreatedAt());
        dto.setUpdatedAt(partner.getUpdatedAt());
        return dto;
    }

    // DTO class cho thống kê
    public static class PartnerStatsDto {
        private long totalPartners;
        private long activePartners;
        private long inactivePartners;
        private long hotelCount;
        private long restaurantCount;
        private long transportCount;
        private long highRatedCount;

        // Getters and setters
        public long getTotalPartners() {
            return totalPartners;
        }

        public void setTotalPartners(long totalPartners) {
            this.totalPartners = totalPartners;
        }

        public long getActivePartners() {
            return activePartners;
        }

        public void setActivePartners(long activePartners) {
            this.activePartners = activePartners;
        }

        public long getInactivePartners() {
            return inactivePartners;
        }

        public void setInactivePartners(long inactivePartners) {
            this.inactivePartners = inactivePartners;
        }

        public long getHotelCount() {
            return hotelCount;
        }

        public void setHotelCount(long hotelCount) {
            this.hotelCount = hotelCount;
        }

        public long getRestaurantCount() {
            return restaurantCount;
        }

        public void setRestaurantCount(long restaurantCount) {
            this.restaurantCount = restaurantCount;
        }

        public long getTransportCount() {
            return transportCount;
        }

        public void setTransportCount(long transportCount) {
            this.transportCount = transportCount;
        }

        public long getHighRatedCount() {
            return highRatedCount;
        }

        public void setHighRatedCount(long highRatedCount) {
            this.highRatedCount = highRatedCount;
        }
    }
}
