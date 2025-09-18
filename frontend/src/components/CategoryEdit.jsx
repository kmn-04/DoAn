import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import categoryService from '../services/categoryService';
import Icons from './Icons';
import '../styles/components/CategoryEdit.css';

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const imageInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    galleryImages: [],
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load category data
  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategoryById(id);
        
        setFormData({
          name: response.name || '',
          slug: response.slug || '',
          description: response.description || '',
          imageUrl: response.imageUrl || '',
          galleryImages: response.galleryImages || [],
          isActive: response.isActive !== undefined ? response.isActive : true
        });

        setImagePreview(response.imageUrl || '');
        setGalleryPreviews(response.galleryImages || []);
        
      } catch (error) {
        console.error('Error loading category:', error);
        alert('Không thể tải thông tin danh mục: ' + error.message);
        navigate('/categories');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCategory();
    }
  }, [id, navigate]);

  // Tạo slug từ tên danh mục
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
      .replace(/[^a-z0-9\s-]/g, '') // Chỉ giữ chữ, số, space và gạch ngang
      .replace(/\s+/g, '-') // Thay space bằng gạch ngang
      .replace(/-+/g, '-') // Loại bỏ gạch ngang liên tiếp
      .trim();
  };

  // Handle thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Nếu thay đổi tên, tự động cập nhật slug
    if (name === 'name') {
      const newSlug = generateSlug(value);
      setFormData(prev => ({
        ...prev,
        name: value,
        slug: newSlug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle chọn ảnh đại diện
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          imageUrl: 'Vui lòng chọn file ảnh hợp lệ'
        }));
        return;
      }

      // Kiểm tra file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          imageUrl: 'Kích thước file không được vượt quá 5MB'
        }));
        return;
      }

      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setFormData(prev => ({
          ...prev,
          imageUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);

      // Xóa lỗi
      if (errors.imageUrl) {
        setErrors(prev => ({
          ...prev,
          imageUrl: ''
        }));
      }
    }
  };

  // Handle chọn gallery images
  const handleGallerySelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const validFiles = [];
      const newPreviews = [];

      files.forEach(file => {
        if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
          validFiles.push(file);
          
          const reader = new FileReader();
          reader.onload = (e) => {
            newPreviews.push(e.target.result);
            if (newPreviews.length === validFiles.length) {
              setGalleryPreviews(prev => [...prev, ...newPreviews]);
              setFormData(prev => ({
                ...prev,
                galleryImages: [...prev.galleryImages, ...newPreviews]
              }));
            }
          };
          reader.readAsDataURL(file);
        }
      });

      if (validFiles.length !== files.length) {
        setErrors(prev => ({
          ...prev,
          galleryImages: 'Một số file không hợp lệ đã bị bỏ qua'
        }));
      }
    }
  };

  // Xóa ảnh từ gallery
  const removeGalleryImage = (index) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  // Handle click vào vùng upload
  const handleImageClick = () => {
    imageInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên danh mục là bắt buộc';
    }

    if (!formData.imageUrl) {
      newErrors.imageUrl = 'Ảnh đại diện là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform form data for API
      const apiData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl,
        galleryImages: formData.galleryImages,
        isActive: formData.isActive
      };
      
      await categoryService.updateCategory(id, apiData);
      alert('Cập nhật danh mục thành công!');
      navigate('/categories');
      
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle hủy bỏ
  const handleCancel = () => {
    navigate('/categories');
  };

  if (loading) {
    return (
      <div className="category-edit-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin danh mục...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-edit-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-title">
              <h1>Chỉnh sửa danh mục</h1>
            </div>
          </div>
          <div className="header-right">
            <button className="back-btn" onClick={handleCancel} type="button">
              {Icons.ArrowLeft && Icons.ArrowLeft()}
              Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="page-content">
        <form className="category-form" onSubmit={handleSubmit}>
          <div className="form-container">
            {/* Basic Information */}
            <div className="form-fields">
              {/* Tên danh mục */}
              <div className="form-group">
                <label className="form-label required">Tên danh mục</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Du lịch biển, Du lịch mạo hiểm, Tour văn hóa"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                />
                {errors.name && (
                  <div className="error-message">{errors.name}</div>
                )}
              </div>

              {/* Slug */}
              <div className="form-group">
                <label className="form-label">Slug (URL thân thiện)</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="URL không chứa dấu và cách nhau bằng gạch ngang"
                  className="form-input"
                />
                <div className="input-hint">
                  Để trống sẽ tự động tạo theo tên. URL không chứa dấu và cách nhau bằng gạch ngang.
                </div>
              </div>

              {/* Mô tả */}
              <div className="form-group">
                <label className="form-label">Mô tả ngắn</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả ngắn gọn về loại hình tour trong danh mục này"
                  className="form-textarea"
                  rows="4"
                />
              </div>

              {/* Trạng thái */}
              <div className="form-group">
                <label className="form-label">Trạng thái</label>
                <div className="toggle-wrapper">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        isActive: e.target.checked
                      }))}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className={`status-text ${formData.isActive ? 'active' : 'inactive'}`}>
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="image-section">
              {/* Ảnh đại diện */}
              <div className="form-group">
                <label className="form-label required">Ảnh đại diện</label>
                <div 
                  className={`image-upload-area ${errors.imageUrl ? 'error' : ''}`}
                  onClick={handleImageClick}
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="image-preview"
                    />
                  ) : (
                    <div className="upload-placeholder">
                      {Icons.Camera && Icons.Camera()}
                      <span>Chọn ảnh đại diện</span>
                    </div>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="file-input"
                />
                {errors.imageUrl && (
                  <div className="error-message">{errors.imageUrl}</div>
                )}
                <div className="upload-hint">
                  Kích thước đề xuất: 800x600px. Tối đa 5MB.
                </div>
              </div>

              {/* Bộ sưu tập ảnh */}
              <div className="form-group">
                <label className="form-label">Bộ sưu tập ảnh (Gallery)</label>
                <div 
                  className="gallery-upload-area"
                  onClick={handleGalleryClick}
                >
                  <div className="upload-placeholder">
                    {Icons.Camera && Icons.Camera()}
                    <span>Tải lên các hình ảnh khác</span>
                  </div>
                </div>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGallerySelect}
                  className="file-input"
                />
                {errors.galleryImages && (
                  <div className="error-message">{errors.galleryImages}</div>
                )}
                <div className="upload-hint">
                  Tải lên các hình ảnh khác để minh họa cho danh mục.
                </div>

                {/* Gallery Previews */}
                {galleryPreviews.length > 0 && (
                  <div className="gallery-previews">
                    {galleryPreviews.map((image, index) => (
                      <div key={index} className="gallery-item">
                        <img src={image} alt={`Gallery ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeGalleryImage(index)}
                        >
                          {Icons.Close && Icons.Close()}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="loading-spinner"></div>
                Đang cập nhật...
              </>
            ) : (
              <>
                {Icons.Save && Icons.Save()}
                Cập nhật
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryEdit;
