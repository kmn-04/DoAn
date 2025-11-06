package backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Generic response wrapper for paginated data.
 * Provides consistent pagination metadata across all API endpoints.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    
    private List<T> content;           // Actual data
    private int page;                  // Current page (0-indexed)
    private int size;                  // Page size
    private long totalElements;        // Total number of elements
    private int totalPages;            // Total number of pages
    private boolean first;             // Is first page?
    private boolean last;              // Is last page?
    private boolean empty;             // Is empty?
    private int numberOfElements;      // Number of elements in current page
    
    /**
     * Create PageResponse from Spring Data Page
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast(),
            page.isEmpty(),
            page.getNumberOfElements()
        );
    }
    
    /**
     * Create PageResponse from content list and Page metadata
     */
    public static <T, U> PageResponse<T> of(List<T> content, Page<U> page) {
        return new PageResponse<>(
            content,
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast(),
            page.isEmpty(),
            content.size()
        );
    }
    
    /**
     * Map content to different type while preserving pagination metadata
     */
    public <U> PageResponse<U> map(List<U> newContent) {
        return new PageResponse<>(
            newContent,
            this.page,
            this.size,
            this.totalElements,
            this.totalPages,
            this.first,
            this.last,
            newContent.isEmpty(),
            newContent.size()
        );
    }
}
