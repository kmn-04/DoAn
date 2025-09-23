package backend.controller;

import backend.dto.response.ApiResponse;
import backend.dto.response.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public abstract class BaseController {

    protected <T> ApiResponse<T> success(T data) {
        return ApiResponse.success(data);
    }

    protected <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.success(message, data);
    }

    protected <T> ApiResponse<T> success(String message) {
        return ApiResponse.success(message);
    }

    protected <T> ApiResponse<T> error(String message) {
        return ApiResponse.error(message);
    }

    protected <T> ApiResponse<T> error(String message, String details) {
        return ApiResponse.error(message, details);
    }

    protected Pageable createPageable(int page, int size) {
        return PageRequest.of(page, size);
    }

    protected Pageable createPageable(int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(page, size, Sort.by(direction, sortBy));
    }

    protected <T> ApiResponse<PageResponse<T>> successPage(Page<T> page) {
        PageResponse<T> pageResponse = new PageResponse<>();
        pageResponse.setContent(page.getContent());
        pageResponse.setPageNumber(page.getNumber());
        pageResponse.setPageSize(page.getSize());
        pageResponse.setTotalElements(page.getTotalElements());
        pageResponse.setTotalPages(page.getTotalPages());
        pageResponse.setFirst(page.isFirst());
        pageResponse.setLast(page.isLast());
        pageResponse.setEmpty(page.isEmpty());
        
        return ApiResponse.success(pageResponse);
    }
}