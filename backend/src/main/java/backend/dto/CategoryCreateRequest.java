package backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class CategoryCreateRequest {
    
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục không được vượt quá 100 ký tự")
    private String name;
    
    // Removed slug field
    
    private String description;
    
    private Integer displayOrder;
    
    private String imageUrl;
    
    private List<String> galleryImages;
    
    private Boolean isActive = true;

    // Constructors
    public CategoryCreateRequest() {}

    public CategoryCreateRequest(String name, String description) {
        this.name = name;
        this.description = description;
        this.isActive = true;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // Removed slug getter and setter

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public List<String> getGalleryImages() {
        return galleryImages;
    }

    public void setGalleryImages(List<String> galleryImages) {
        this.galleryImages = galleryImages;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    @Override
    public String toString() {
        return "CategoryCreateRequest{" +
                "name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", displayOrder=" + displayOrder +
                ", imageUrl='" + imageUrl + '\'' +
                ", galleryImages=" + galleryImages +
                ", isActive=" + isActive +
                '}';
    }
}
