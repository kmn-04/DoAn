package backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục không được vượt quá 100 ký tự")
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    // Removed slug field

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "gallery_images", columnDefinition = "JSON")
    private String galleryImagesJson;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Category() {}

    public Category(String name, String description) {
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

    public String getGalleryImagesJson() {
        return galleryImagesJson;
    }

    public void setGalleryImagesJson(String galleryImagesJson) {
        this.galleryImagesJson = galleryImagesJson;
    }

    @JsonProperty("galleryImages")
    public List<String> getGalleryImages() {
        if (galleryImagesJson == null || galleryImagesJson.isEmpty()) {
            return List.of();
        }
        try {
            // Simple JSON parsing for array of strings
            String cleaned = galleryImagesJson.replace("[", "").replace("]", "").replace("\"", "");
            if (cleaned.trim().isEmpty()) {
                return List.of();
            }
            return List.of(cleaned.split(","));
        } catch (Exception e) {
            return List.of();
        }
    }

    @JsonProperty("galleryImages")
    public void setGalleryImages(List<String> galleryImages) {
        if (galleryImages == null || galleryImages.isEmpty()) {
            this.galleryImagesJson = null;
        } else {
            // Simple JSON serialization for array of strings
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < galleryImages.size(); i++) {
                sb.append("\"").append(galleryImages.get(i)).append("\"");
                if (i < galleryImages.size() - 1) {
                    sb.append(",");
                }
            }
            sb.append("]");
            this.galleryImagesJson = sb.toString();
        }
    }

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

    // Removed slug generation methods

    @Override
    public String toString() {
        return "Category{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                ", displayOrder=" + displayOrder +
                ", imageUrl='" + imageUrl + '\'' +
                ", isActive=" + isActive +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
