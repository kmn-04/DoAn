package backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CategoryReorderRequest {
    
    @NotEmpty(message = "Danh sách thứ tự danh mục không được để trống")
    private List<CategoryOrderItem> categoryOrders;

    public static class CategoryOrderItem {
        @NotNull(message = "ID danh mục không được để trống")
        private Long id;
        
        @NotNull(message = "Thứ tự hiển thị không được để trống")
        private Integer displayOrder;

        public CategoryOrderItem() {}

        public CategoryOrderItem(Long id, Integer displayOrder) {
            this.id = id;
            this.displayOrder = displayOrder;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }

        public void setDisplayOrder(Integer displayOrder) {
            this.displayOrder = displayOrder;
        }

        @Override
        public String toString() {
            return "CategoryOrderItem{" +
                    "id=" + id +
                    ", displayOrder=" + displayOrder +
                    '}';
        }
    }

    // Constructors
    public CategoryReorderRequest() {}

    public CategoryReorderRequest(List<CategoryOrderItem> categoryOrders) {
        this.categoryOrders = categoryOrders;
    }

    // Getters and Setters
    public List<CategoryOrderItem> getCategoryOrders() {
        return categoryOrders;
    }

    public void setCategoryOrders(List<CategoryOrderItem> categoryOrders) {
        this.categoryOrders = categoryOrders;
    }

    @Override
    public String toString() {
        return "CategoryReorderRequest{" +
                "categoryOrders=" + categoryOrders +
                '}';
    }
}
