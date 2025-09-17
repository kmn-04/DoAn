import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  AlertCircle,
  Check,
  Star,
  Building2,
  Utensils,
  Car,
  Tag
} from 'lucide-react';
import partnerService from '../services/partnerService';
import '../styles/components/PartnerFormModal.css';

const PartnerFormModal = ({ partner, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    avatarUrl: '',
    galleryImages: [],
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    amenities: [],
    rating: 1,
    priceRange: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [amenityInput, setAmenityInput] = useState('');

  const isEditing = !!partner;

  // Initialize form data
  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        type: partner.type || '',
        avatarUrl: partner.avatarUrl || '',
        galleryImages: partner.galleryImages || [],
        description: partner.description || '',
        address: partner.address || '',
        phone: partner.phone || '',
        email: partner.email || '',
        website: partner.website || '',
        amenities: partner.amenities || [],
        rating: partner.rating || 1,
        priceRange: partner.priceRange || '',
        isActive: partner.isActive !== undefined ? partner.isActive : true
      });
      setImagePreview(partner.avatarUrl || null);
      setGalleryPreviews(partner.galleryImages || []);
    }
  }, [partner]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Store current values in closure to avoid stale closures
      const currentImagePreview = imagePreview;
      const currentGalleryPreviews = galleryPreviews;
      
      if (currentImagePreview && currentImagePreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(currentImagePreview);
        } catch (e) {
          console.warn('Failed to revoke blob URL:', e);
        }
      }
      currentGalleryPreviews.forEach(url => {
        if (url && url.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            console.warn('Failed to revoke blob URL:', e);
          }
        }
      });
    };
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous blob URL if it exists
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      // In a real app, you would upload to a file server
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, avatarUrl: imageUrl }));
      setImagePreview(imageUrl);
    }
  };

  // Handle gallery images upload
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...newImages]
      }));
      setGalleryPreviews(prev => [...prev, ...newImages]);
    }
  };

  // Remove image from gallery
  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove avatar
  const removeAvatar = () => {
    // Clean up blob URL if it exists
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setFormData(prev => ({ ...prev, avatarUrl: '' }));
    setImagePreview(null);
  };

  // Handle amenity input
  const handleAmenityKeyPress = (e) => {
    if (e.key === 'Enter' && amenityInput.trim()) {
      e.preventDefault();
      if (!formData.amenities.includes(amenityInput.trim())) {
        setFormData(prev => ({
          ...prev,
          amenities: [...prev.amenities, amenityInput.trim()]
        }));
      }
      setAmenityInput('');
    }
  };

  // Add amenity
  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()]
      }));
      setAmenityInput('');
    }
  };

  // Remove amenity
  const removeAmenity = (index) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  // Handle rating change
  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  // Validate form
  const validateForm = () => {
    const validation = partnerService.validatePartnerData(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmit(formData);
      if (result.success) {
        onClose();
      } else {
        if (result.details && typeof result.details === 'object') {
          setErrors(result.details);
        } else {
          setErrors({ general: result.error });
        }
      }
    } catch (err) {
      setErrors({ general: 'Đã xảy ra lỗi không mong muốn' });
      console.error('Form submit error:', err);
    }
    setLoading(false);
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch (type) {
      case 'HOTEL':
        return <Building2 size={16} />;
      case 'RESTAURANT':
        return <Utensils size={16} />;
      case 'TRANSPORT':
        return <Car size={16} />;
      default:
        return <Building2 size={16} />;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="partner-form-modal">
        <div className="modal-header">
          <h2>
            {isEditing ? 'Chỉnh sửa thông tin đối tác' : 'Thêm đối tác mới'}
          </h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {/* General Error */}
            {errors.general && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                {errors.general}
              </div>
            )}

            {/* Khu vực 1: Thông tin cơ bản */}
            <div className="form-section">
              <h3>Thông tin cơ bản</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">
                    Tên đối tác <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Nhập tên đối tác"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="type">
                    Phân loại đối tác <span className="required">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={errors.type ? 'error' : ''}
                  >
                    <option value="">Chọn phân loại</option>
                    <option value="HOTEL">
                      Khách sạn
                    </option>
                    <option value="RESTAURANT">
                      Nhà hàng
                    </option>
                    <option value="TRANSPORT">
                      Vận chuyển
                    </option>
                  </select>
                  {errors.type && <span className="error-message">{errors.type}</span>}
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="form-group">
                <label>Ảnh đại diện</label>
                <div className="image-upload-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="btn-remove-image"
                        onClick={removeAvatar}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <ImageIcon size={48} />
                      <p>Chọn ảnh đại diện</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="file-input"
                  />
                </div>
              </div>

              {/* Gallery Upload */}
              <div className="form-group">
                <label>Bộ sưu tập ảnh</label>
                <div className="gallery-container">
                  <div className="gallery-images">
                    {galleryPreviews.map((image, index) => (
                      <div key={index} className="gallery-item">
                        <img src={image} alt={`Gallery ${index + 1}`} />
                        <button
                          type="button"
                          className="btn-remove-gallery"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="gallery-upload">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        className="file-input"
                      />
                      <div className="upload-placeholder">
                        <Plus size={24} />
                        <span>Thêm ảnh</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả ngắn</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Nhập mô tả về đối tác"
                />
              </div>
            </div>

            {/* Khu vực 2: Thông tin liên hệ */}
            <div className="form-section">
              <h3>Thông tin liên hệ</h3>
              
              <div className="form-group">
                <label htmlFor="address">Địa chỉ</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Số điện thoại</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Nhập email"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Nhập website (http://...)"
                />
              </div>
            </div>

            {/* Khu vực 3: Chi tiết dịch vụ */}
            <div className="form-section">
              <h3>Chi tiết dịch vụ</h3>
              
              {/* Amenities */}
              <div className="form-group">
                <label>Tiện nghi</label>
                <div className="amenities-container">
                  <div className="amenity-input">
                    <input
                      type="text"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyPress={handleAmenityKeyPress}
                      placeholder="Nhập tiện nghi và nhấn Enter"
                    />
                    <button
                      type="button"
                      onClick={addAmenity}
                      className="btn-add-amenity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="amenities-tags">
                    {formData.amenities.map((amenity, index) => (
                      <div key={index} className="amenity-tag">
                        <Tag size={12} />
                        <span>{amenity}</span>
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          className="btn-remove-tag"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="form-group">
                <label>Đánh giá chất lượng</label>
                <div className="rating-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= formData.rating ? 'active' : ''}`}
                      onClick={() => handleRatingChange(star)}
                    >
                      <Star size={24} />
                    </button>
                  ))}
                  <span className="rating-text">({formData.rating}/5)</span>
                </div>
              </div>

              {/* Price Range */}
              <div className="form-group">
                <label htmlFor="priceRange">Khoảng giá</label>
                <select
                  id="priceRange"
                  name="priceRange"
                  value={formData.priceRange}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn khoảng giá</option>
                  <option value="BUDGET">Bình dân</option>
                  <option value="MID_RANGE">Tầm trung</option>
                  <option value="LUXURY">Cao cấp</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">Đối tác đang hoạt động</span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  {isEditing ? 'Đang cập nhật...' : 'Đang tạo...'}
                </>
              ) : (
                <>
                  <Check size={20} />
                  {isEditing ? 'Lưu thay đổi' : 'Tạo đối tác'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartnerFormModal;
