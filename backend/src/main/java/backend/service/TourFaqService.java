package backend.service;

import backend.dto.request.TourFaqRequest;
import backend.dto.response.TourFaqResponse;

import java.util.List;

public interface TourFaqService {
    
    // Create a new FAQ
    TourFaqResponse createFaq(TourFaqRequest request);
    
    // Update an existing FAQ
    TourFaqResponse updateFaq(Long id, TourFaqRequest request);
    
    // Delete a FAQ
    void deleteFaq(Long id);
    
    // Get FAQ by ID
    TourFaqResponse getFaqById(Long id);
    
    // Get all FAQs for a tour
    List<TourFaqResponse> getFaqsByTourId(Long tourId);
    
    // Search FAQs by keyword
    List<TourFaqResponse> searchFaqs(Long tourId, String keyword);
    
    // Batch create FAQs
    List<TourFaqResponse> createMultipleFaqs(List<TourFaqRequest> requests);
}
