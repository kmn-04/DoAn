package backend.service.impl;

import backend.dto.request.PromotionRequest;
import backend.dto.response.PromotionResponse;
import backend.entity.Promotion;
import backend.repository.PromotionRepository;
import backend.service.PromotionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PromotionServiceImpl implements PromotionService {
    
    private final PromotionRepository promotionRepository;
    
    @Override
    @Transactional
    public Promotion createPromotion(PromotionRequest request) {
        log.info("Creating promotion with code: {}", request.getCode());
        
        // Check if code already exists
        if (promotionRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Promotion code already exists: " + request.getCode());
        }
        
        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }
        
        Promotion promotion = new Promotion();
        promotion.setCode(request.getCode().toUpperCase());
        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setType(Promotion.PromotionType.valueOf(request.getType()));
        promotion.setValue(request.getValue());
        promotion.setMinOrderAmount(request.getMinOrderAmount());
        promotion.setMaxDiscount(request.getMaxDiscount());
        promotion.setUsageLimit(request.getUsageLimit());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setStatus(request.getStatus() != null ? 
                Promotion.PromotionStatus.valueOf(request.getStatus()) : 
                Promotion.PromotionStatus.Active);
        
        Promotion savedPromotion = promotionRepository.save(promotion);
        log.info("✅ Created promotion: {} (ID: {})", savedPromotion.getCode(), savedPromotion.getId());
        
        return savedPromotion;
    }
    
    @Override
    @Transactional
    public Promotion updatePromotion(Long id, PromotionRequest request) {
        log.info("Updating promotion ID: {}", id);
        
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + id));
        
        // Check if code is being changed and if new code already exists
        if (!promotion.getCode().equals(request.getCode())) {
            if (promotionRepository.existsByCode(request.getCode())) {
                throw new RuntimeException("Promotion code already exists: " + request.getCode());
            }
            promotion.setCode(request.getCode().toUpperCase());
        }
        
        // Validate dates
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }
        
        promotion.setName(request.getName());
        promotion.setDescription(request.getDescription());
        promotion.setType(Promotion.PromotionType.valueOf(request.getType()));
        promotion.setValue(request.getValue());
        promotion.setMinOrderAmount(request.getMinOrderAmount());
        promotion.setMaxDiscount(request.getMaxDiscount());
        promotion.setUsageLimit(request.getUsageLimit());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        
        if (request.getStatus() != null) {
            promotion.setStatus(Promotion.PromotionStatus.valueOf(request.getStatus()));
        }
        
        Promotion updatedPromotion = promotionRepository.save(promotion);
        log.info("✅ Updated promotion: {}", updatedPromotion.getCode());
        
        return updatedPromotion;
    }
    
    @Override
    @Transactional
    public void deletePromotion(Long id) {
        log.info("Deleting promotion ID: {}", id);
        
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with ID: " + id));
        
        // Check if promotion is being used
        long usageCount = promotionRepository.countUsageByPromotionId(id);
        if (usageCount > 0) {
            // Instead of deleting, mark as Inactive
            log.warn("⚠️ Promotion {} is being used ({} times), marking as Inactive instead of deleting", 
                    promotion.getCode(), usageCount);
            promotion.setStatus(Promotion.PromotionStatus.Inactive);
            promotionRepository.save(promotion);
        } else {
            promotionRepository.delete(promotion);
            log.info("✅ Deleted promotion: {}", promotion.getCode());
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Promotion> getPromotionById(Long id) {
        return promotionRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Promotion> getPromotionByCode(String code) {
        return promotionRepository.findByCode(code.toUpperCase());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Promotion> getAllPromotions(Pageable pageable) {
        return promotionRepository.findAll(pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Promotion> getActivePromotions() {
        return promotionRepository.findByStatusOrderByCreatedAtDesc(Promotion.PromotionStatus.Active);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Promotion> getValidPromotions() {
        return promotionRepository.findValidPromotions(LocalDateTime.now());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Promotion> validatePromotionCode(String code) {
        log.info("Validating promotion code: {}", code);
        
        Optional<Promotion> promotionOpt = promotionRepository.findValidPromotionByCode(
                code.toUpperCase(), LocalDateTime.now());
        
        if (promotionOpt.isEmpty()) {
            log.warn("⚠️ Invalid promotion code: {}", code);
            return Optional.empty();
        }
        
        Promotion promotion = promotionOpt.get();
        
        // Check usage limit
        if (promotion.getUsageLimit() != null && promotion.getUsageLimit() > 0) {
            long usageCount = promotionRepository.countUsageByPromotionId(promotion.getId());
            if (usageCount >= promotion.getUsageLimit()) {
                log.warn("⚠️ Promotion {} has reached usage limit", code);
                return Optional.empty();
            }
        }
        
        log.info("✅ Promotion code {} is valid", code);
        return promotionOpt;
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isPromotionValid(Promotion promotion) {
        LocalDateTime now = LocalDateTime.now();
        
        // Check status
        if (promotion.getStatus() != Promotion.PromotionStatus.Active) {
            return false;
        }
        
        // Check dates
        if (now.isBefore(promotion.getStartDate()) || now.isAfter(promotion.getEndDate())) {
            return false;
        }
        
        // Check usage limit
        if (promotion.getUsageLimit() != null && promotion.getUsageLimit() > 0) {
            long usageCount = promotionRepository.countUsageByPromotionId(promotion.getId());
            if (usageCount >= promotion.getUsageLimit()) {
                return false;
            }
        }
        
        return true;
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getPromotionUsageCount(Long promotionId) {
        return promotionRepository.countUsageByPromotionId(promotionId);
    }
    
    @Override
    @Transactional
    public void markExpiredPromotions() {
        log.info("Marking expired promotions...");
        
        List<Promotion> expiredPromotions = promotionRepository.findExpiredPromotions(LocalDateTime.now());
        
        for (Promotion promotion : expiredPromotions) {
            promotion.setStatus(Promotion.PromotionStatus.Expired);
            promotionRepository.save(promotion);
            log.info("Marked promotion {} as Expired", promotion.getCode());
        }
        
        log.info("✅ Marked {} promotions as Expired", expiredPromotions.size());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PromotionResponse toResponse(Promotion promotion) {
        long usageCount = promotionRepository.countUsageByPromotionId(promotion.getId());
        LocalDateTime now = LocalDateTime.now();
        
        boolean isExpired = now.isAfter(promotion.getEndDate());
        boolean isValid = isPromotionValid(promotion);
        
        Integer remainingUses = null;
        if (promotion.getUsageLimit() != null && promotion.getUsageLimit() > 0) {
            remainingUses = Math.max(0, promotion.getUsageLimit() - (int) usageCount);
        }
        
        return PromotionResponse.builder()
                .id(promotion.getId())
                .code(promotion.getCode())
                .name(promotion.getName())
                .description(promotion.getDescription())
                .type(promotion.getType().name())
                .value(promotion.getValue())
                .minOrderAmount(promotion.getMinOrderAmount())
                .maxDiscount(promotion.getMaxDiscount())
                .usageLimit(promotion.getUsageLimit())
                .usageCount((int) usageCount)
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .status(promotion.getStatus().name())
                .createdAt(promotion.getCreatedAt())
                .updatedAt(promotion.getUpdatedAt())
                .isValid(isValid)
                .isExpired(isExpired)
                .remainingUses(remainingUses)
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Promotion> searchPromotions(String keyword, Pageable pageable) {
        // For now, return all promotions
        // TODO: Implement proper search by code or description if needed
        return promotionRepository.findAll(pageable);
    }
    
    @Override
    public long getTotalPromotions() {
        return promotionRepository.count();
    }
}

