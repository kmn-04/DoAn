package backend.service.impl;

import backend.dto.request.TourFaqRequest;
import backend.dto.response.TourFaqResponse;
import backend.entity.Tour;
import backend.entity.TourFaq;
import backend.mapper.EntityMapper;
import backend.repository.TourFaqRepository;
import backend.repository.TourRepository;
import backend.service.TourFaqService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TourFaqServiceImpl implements TourFaqService {
    
    private final TourFaqRepository faqRepository;
    private final TourRepository tourRepository;
    private final EntityMapper entityMapper;
    
    @Override
    @Transactional
    public TourFaqResponse createFaq(TourFaqRequest request) {
        Tour tour = tourRepository.findById(request.getTourId())
            .orElseThrow(() -> new RuntimeException("Tour not found"));
        
        TourFaq faq = new TourFaq();
        faq.setTour(tour);
        faq.setQuestion(request.getQuestion());
        faq.setAnswer(request.getAnswer());
        faq.setDisplayOrder(request.getDisplayOrder());
        
        TourFaq saved = faqRepository.save(faq);
        return entityMapper.toTourFaqResponse(saved);
    }
    
    @Override
    @Transactional
    public TourFaqResponse updateFaq(Long id, TourFaqRequest request) {
        TourFaq faq = faqRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("FAQ not found"));
        
        faq.setQuestion(request.getQuestion());
        faq.setAnswer(request.getAnswer());
        faq.setDisplayOrder(request.getDisplayOrder());
        
        TourFaq updated = faqRepository.save(faq);
        return entityMapper.toTourFaqResponse(updated);
    }
    
    @Override
    @Transactional
    public void deleteFaq(Long id) {
        faqRepository.deleteById(id);
    }
    
    @Override
    public TourFaqResponse getFaqById(Long id) {
        TourFaq faq = faqRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("FAQ not found"));
        return entityMapper.toTourFaqResponse(faq);
    }
    
    @Override
    public List<TourFaqResponse> getFaqsByTourId(Long tourId) {
        List<TourFaq> faqs = faqRepository.findByTourIdOrderByDisplayOrderAsc(tourId);
        return entityMapper.toTourFaqResponseList(faqs);
    }
    
    @Override
    public List<TourFaqResponse> searchFaqs(Long tourId, String keyword) {
        List<TourFaq> faqs = faqRepository.searchFaqsByTourIdAndKeyword(tourId, keyword);
        return entityMapper.toTourFaqResponseList(faqs);
    }
    
    @Override
    @Transactional
    public List<TourFaqResponse> createMultipleFaqs(List<TourFaqRequest> requests) {
        return requests.stream()
            .map(this::createFaq)
            .collect(Collectors.toList());
    }
}
