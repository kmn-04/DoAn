import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  AlertCircle,
  Check
} from 'lucide-react';
import categoryService from '../services/categoryService';
import '../styles/components/CategoryFormModal.css';

const CategoryFormModal = ({ category, onClose, onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    galleryImages: [],
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const isEditing = !!category;

  // Initialize form data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        imageUrl: category.imageUrl || '',
        galleryImages: category.galleryImages || [],
        isActive: category.isActive !== undefined ? category.isActive : true
      });
      setImagePreview(category.imageUrl || null);
      setGalleryPreviews(category.galleryImages || []);
    }
  }, [category]);

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

  // Removed auto generate slug logic

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

  // Removed slug change handler

  // Handle image upload (main image)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clean up previous blob URL if it exists
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      // In a real app, you would upload to a file server
      // For now, we'll use URL.createObjectURL for preview
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, imageUrl }));
      setImagePreview(imageUrl);
    }
  };

  // Handle gallery images upload
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // In a real app, you would upload to a file server
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

  // Remove main image
  const removeMainImage = () => {
    // Clean up blob URL if it exists
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setImagePreview(null);
  };

  // Validate form
  const validateForm = () => {
    const validation = categoryService.validateCategoryData(formData);
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
      const submitData = {
        ...formData
      };

      let result;
      if (isEditing) {
        result = await categoryService.updateCategory(category.id, submitData);
      } else {
        result = await categoryService.createCategory(submitData);
      }

      if (result.success) {
        onComplete();
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

  return (
    <div className="modal-overlay">
      <div className="category-form-modal">
        <div className="modal-header">
          <h2>
            {isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="modal-body">
            {/* General Error */}
            {errors.general && (
              <div className="error-alert">
                <AlertCircle size={16} />
                {errors.general}
              </div>
            )}

            {/* Basic Information */}
            <div className="form-section">
              <h3>Thông tin cơ bản</h3>

              {/* Name */}
              <div className="form-group">
                <label htmlFor="name" className="required">Tên danh mục</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Nhập tên danh mục"
                  required
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              {/* Removed slug field */}

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Mô tả ngắn</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Mô tả về danh mục này..."
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>


              {/* Status */}
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-custom"></span>
                  Kích hoạt danh mục
                </label>
                <small className="help-text">
                  Chỉ các danh mục được kích hoạt mới hiển thị trên trang web.
                </small>
              </div>
            </div>

            {/* Images */}
            <div className="form-section">
              <h3>Hình ảnh</h3>

              {/* Main Image */}
              <div className="form-group">
                <label>Ảnh đại diện <span className="required">*</span></label>
                <div className="image-upload-area">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={removeMainImage}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="upload-placeholder">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        hidden
                      />
                      <Upload size={32} />
                      <span>Nhấn để tải ảnh lên</span>
                      <small>PNG, JPG, GIF tối đa 5MB</small>
                    </label>
                  )}
                </div>
                {errors.imageUrl && <span className="error-text">{errors.imageUrl}</span>}
              </div>

              {/* Gallery Images */}
              <div className="form-group">
                <label>Bộ sưu tập ảnh</label>
                <div className="gallery-upload">
                  <div className="gallery-grid">
                    {galleryPreviews.map((image, index) => (
                      <div key={index} className="gallery-item">
                        <img src={image} alt={`Gallery ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-gallery-btn"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <label className="gallery-add-btn">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryUpload}
                        hidden
                      />
                      <Plus size={24} />
                      <span>Thêm ảnh</span>
                    </label>
                  </div>
                </div>
                <small className="help-text">
                  Có thể thêm nhiều ảnh để minh họa cho danh mục.
                </small>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-spinner small"></div>
                  {isEditing ? 'Đang cập nhật...' : 'Đang tạo...'}
                </>
              ) : (
                <>
                  <Check size={16} />
                  {isEditing ? 'Cập nhật' : 'Tạo danh mục'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryFormModal;
