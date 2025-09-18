import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import categoryService from '../services/categoryService';
import Icons from './Icons';
import '../styles/components/CategoryDetail.css';

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load category detail
  useEffect(() => {
    const loadCategory = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategoryById(id);
        setCategory(response);
        setError(null);
      } catch (err) {
        console.error('Error loading category:', err);
        setError('Không thể tải thông tin danh mục');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadCategory();
    }
  }, [id]);

  // Handle navigation
  const handleBack = () => {
    navigate('/categories');
  };

  const handleEdit = () => {
    navigate(`/categories/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="category-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin danh mục...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-detail-page">
        <div className="error-container">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="category-detail-page">
        <div className="error-container">
          <p>Không tìm thấy danh mục</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-detail-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-title">
              <h1>Chi tiết danh mục</h1>
            </div>
          </div>
          <div className="header-right">
            <button className="btn btn-edit mr-2" onClick={handleEdit}>
              {Icons.Edit && Icons.Edit()}
              Chỉnh sửa
            </button>
            <button className="back-btn" onClick={handleBack} type="button">
              {Icons.ArrowLeft && Icons.ArrowLeft()}
              Quay lại
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="page-content">
        <div className="detail-container">
          <div className="detail-content">
            {/* Basic Information */}
            <div className="detail-section">
              <h3 className="section-title">Thông tin cơ bản</h3>
              <div className="detail-grid">
                <div className="detail-field">
                  <label>Tên danh mục</label>
                  <span>{category.name}</span>
                </div>

                <div className="detail-field">
                  <label>Slug</label>
                  <span className="slug-text">{category.slug || 'Không có'}</span>
                </div>

                <div className="detail-field">
                  <label>Trạng thái</label>
                  <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                    {category.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                  </span>
                </div>

                <div className="detail-field">
                  <label>Số lượng tour</label>
                  <span className="tour-count">{category.tourCount || 0} tour</span>
                </div>

                <div className="detail-field full-width">
                  <label>Mô tả</label>
                  <div className="description-content">
                    {category.description || 'Không có mô tả'}
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="detail-section">
              <h3 className="section-title">Thông tin thời gian</h3>
              <div className="detail-grid">
                <div className="detail-field">
                  <label>Ngày tạo</label>
                  <span>{new Date(category.createdAt).toLocaleString('vi-VN')}</span>
                </div>

                {category.updatedAt && (
                  <div className="detail-field">
                    <label>Cập nhật lần cuối</label>
                    <span>{new Date(category.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="image-section">
            {/* Main Image */}
            {category.imageUrl && (
              <div className="detail-section">
                <h3 className="section-title">Ảnh đại diện</h3>
                <div className="main-image">
                  <img src={category.imageUrl} alt={category.name} />
                </div>
              </div>
            )}

            {/* Gallery */}
            {category.galleryImages && category.galleryImages.length > 0 && (
              <div className="detail-section">
                <h3 className="section-title">Bộ sưu tập ảnh</h3>
                <div className="gallery-grid">
                  {category.galleryImages.map((image, index) => (
                    <div key={index} className="gallery-item">
                      <img src={image} alt={`Gallery ${index + 1}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;
