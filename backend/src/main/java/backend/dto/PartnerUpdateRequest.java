package backend.dto;

import backend.model.Partner;
import jakarta.validation.constraints.*;

import java.util.List;

public class PartnerUpdateRequest {
    
    @NotBlank(message = "Tên đối tác không được để trống")
    @Size(max = 200, message = "Tên đối tác không được vượt quá 200 ký tự")
    private String name;
    
    @NotNull(message = "Phân loại đối tác không được để trống")
    private Partner.PartnerType type;
    
    private String avatarUrl;
    
    private List<String> galleryImages;
    
    private String description;
    
    private String address;
    
    @Pattern(regexp = "^[0-9+\\-\\s()]*$", message = "Số điện thoại không hợp lệ")
    @Size(max = 20, message = "Số điện thoại không được vượt quá 20 ký tự")
    private String phone;
    
    @Email(message = "Email không hợp lệ")
    @Size(max = 100, message = "Email không được vượt quá 100 ký tự")
    private String email;
    
    @Size(max = 255, message = "Website không được vượt quá 255 ký tự")
    private String website;
    
    private List<String> amenities;
    
    @NotNull(message = "Rating không được để trống")
    @Min(value = 1, message = "Rating phải từ 1 đến 5")
    @Max(value = 5, message = "Rating phải từ 1 đến 5")
    private Integer rating;
    
    private Partner.PriceRange priceRange;
    
    @NotNull(message = "Trạng thái không được để trống")
    private Boolean isActive;

    // Constructors
    public PartnerUpdateRequest() {}

    public PartnerUpdateRequest(String name, Partner.PartnerType type, Integer rating, Boolean isActive) {
        this.name = name;
        this.type = type;
        this.rating = rating;
        this.isActive = isActive;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Partner.PartnerType getType() {
        return type;
    }

    public void setType(Partner.PartnerType type) {
        this.type = type;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public List<String> getGalleryImages() {
        return galleryImages;
    }

    public void setGalleryImages(List<String> galleryImages) {
        this.galleryImages = galleryImages;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Partner.PriceRange getPriceRange() {
        return priceRange;
    }

    public void setPriceRange(Partner.PriceRange priceRange) {
        this.priceRange = priceRange;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    @Override
    public String toString() {
        return "PartnerUpdateRequest{" +
                "name='" + name + '\'' +
                ", type=" + type +
                ", avatarUrl='" + avatarUrl + '\'' +
                ", description='" + description + '\'' +
                ", address='" + address + '\'' +
                ", phone='" + phone + '\'' +
                ", email='" + email + '\'' +
                ", website='" + website + '\'' +
                ", amenities=" + amenities +
                ", rating=" + rating +
                ", priceRange=" + priceRange +
                ", isActive=" + isActive +
                '}';
    }
}
