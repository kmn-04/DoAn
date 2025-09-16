package backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class CategoryDto {
    private Long id;
    
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục không được vượt quá 100 ký tự")
    private String name;
    
    // Removed slug field
    
    private String description;
    
    private Integer displayOrder;
    
    private String imageUrl;
    
    private List<String> galleryImages;
    
    private Boolean isActive;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    // Constructors
    public CategoryDto() {}

    public CategoryDto(String name, String description) {
        this.name = name;
        this.description = description;
        this.isActive = true;
        this.displayOrder = 0;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    @JsonProperty("isActive")
    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "CategoryDto{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", displayOrder=" + displayOrder +
                ", imageUrl='" + imageUrl + '\'' +
                ", galleryImages=" + galleryImages +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
