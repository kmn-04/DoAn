package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public abstract class BaseController {
    
    /**
     * Create success response with data
     */
    protected <T> ApiResponse<T> success(T data) {
        return ApiResponse.success(data);
    }
    
    /**
     * Create success response with message and data
     */
    protected <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.success(message, data);
    }
    
    /**
     * Create success response with message only
     */
    protected <T> ApiResponse<T> success(String message) {
        return ApiResponse.success(message);
    }
    
    /**
     * Create error response
     */
    protected <T> ApiResponse<T> error(String error) {
        return ApiResponse.error(error);
    }
    
    /**
     * Create pageable object with sorting
     */
    protected Pageable createPageable(int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;
        
        Sort sort = Sort.by(direction, sortBy);
        return PageRequest.of(page, size, sort);
    }
    
    /**
     * Create pageable object without sorting
     */
    protected Pageable createPageable(int page, int size) {
        return PageRequest.of(page, size);
    }
    
    /**
     * Convert Page to PageResponse
     */
    protected <T> ApiResponse<PageResponse<T>> successPage(Page<T> page) {
        return success(PageResponse.of(page));
    }
}
