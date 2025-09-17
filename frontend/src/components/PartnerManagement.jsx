import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Utensils,
  Car,
  AlertTriangle,
  Eye
} from 'lucide-react';
import partnerService from '../services/partnerService';
import PartnerFormModal from './PartnerFormModal';
import '../styles/components/PartnerManagement.css';
import '../styles/shared/ManagementCommon.css';

// Component cho từng row trong bảng
const PartnerRow = ({ partner, onEdit, onDelete, onToggleStatus, onView }) => {

  const handleStatusChange = (e) => {
    const newStatus = e.target.value === 'true';
    if (newStatus !== partner.isActive) {
      onToggleStatus(partner);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const getTypeDisplayName = (type) => {
    const typeMap = {
      'HOTEL': 'Khách sạn',
      'RESTAURANT': 'Nhà hàng',
      'TRANSPORT': 'Vận chuyển'
    };
    return typeMap[type] || type;
  };

  const renderStars = (rating) => {
    return (
      <div className="rating-stars">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? 'star-filled' : 'star-empty'}
          />
        ))}
        <span className="rating-number">({rating})</span>
      </div>
    );
  };

  return (
    <tr className="partner-row">
      <td className="image-cell">
        <div className="partner-image">
          {partner.avatarUrl ? (
            <img src={partner.avatarUrl} alt={partner.name} />
          ) : (
            <div className="image-placeholder">
              {getTypeIcon(partner.type)}
            </div>
          )}
        </div>
      </td>
      <td className="name-cell">
        <div className="partner-name">
          <h4>{partner.name}</h4>
          {partner.website && (
            <a href={partner.website} target="_blank" rel="noopener noreferrer" className="website-link">
              <Globe size={12} />
            </a>
          )}
        </div>
      </td>
      <td className="type-cell">
        <div className="partner-type">
          {getTypeIcon(partner.type)}
          <span>{getTypeDisplayName(partner.type)}</span>
        </div>
      </td>
      <td className="address-cell">
        <div className="partner-address">
          <MapPin size={12} />
          <span>
            {partner.address && partner.address.length > 30
              ? `${partner.address.substring(0, 30)}...`
              : partner.address || 'Chưa cập nhật'}
          </span>
        </div>
      </td>
      <td className="rating-cell">
        {renderStars(partner.rating)}
      </td>
      <td className="status-cell">
        <select 
          value={partner.isActive}
          onChange={handleStatusChange}
          className="status-dropdown"
          data-status={partner.isActive}
        >
          <option value={true}>Hoạt động</option>
          <option value={false}>Không hoạt động</option>
        </select>
      </td>
      <td className="actions-cell">
        <div className="action-buttons">
          <button
            className="btn-action btn-view"
            onClick={() => onView(partner)}
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          <button
            className="btn-action btn-edit"
            onClick={() => onEdit(partner)}
            title="Chỉnh sửa"
          >
            <Edit size={16} />
          </button>
          <button
            className="btn-action btn-delete"
            onClick={() => onDelete(partner)}
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Component modal xác nhận xóa
const DeleteConfirmModal = ({ partner, onConfirm, onCancel }) => {
  if (!partner) return null;

  return (
    <div className="modal-overlay">
      <div className="delete-modal">
        <div className="modal-header">
          <AlertTriangle className="warning-icon" />
          <h3>Xác nhận xóa đối tác</h3>
        </div>
        <div className="modal-body">
          <p>
            Bạn có chắc chắn muốn xóa đối tác <strong>"{partner.name}"</strong> không? 
          </p>
          <p className="warning-text">
            Thao tác này có thể ảnh hưởng đến các tour đang liên kết với đối tác này.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Hủy bỏ
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// Component chính
const PartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPartner, setDeletingPartner] = useState(null);
  const [viewingPartner, setViewingPartner] = useState(null);
  
  // Stats
  const [stats, setStats] = useState(null);

  // Load partners
  const loadPartners = async () => {
    try {
      setLoading(true);
      setError('');
      
      const result = await partnerService.getAllPartnersForAdmin({
        page: currentPage,
        size: pageSize,
        sortBy: sortBy,
        sortDir: sortDir,
        type: selectedType || null,
        isActive: selectedStatus !== '' ? selectedStatus === 'true' : null,
        search: searchTerm
      });
      
      if (result.success) {
        setPartners(result.data.content || []);
        setTotalPages(result.data.totalPages || 0);
        setTotalElements(result.data.totalElements || 0);
      } else {
        setError(result.error || 'Lỗi khi tải danh sách đối tác');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
      console.error('Error loading partners:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const result = await partnerService.getPartnerStats();
      if (result.success) {
        setStats(result.data);
      } else {
        console.error('Error loading stats:', result.error);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Effects
  useEffect(() => {
    loadPartners();
  }, [currentPage, pageSize, sortBy, sortDir, selectedType, selectedStatus, searchTerm]);

  useEffect(() => {
    loadStats();
  }, []);

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reset về trang đầu khi search
  };

  const handleTypeFilter = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(0);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(0);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setCurrentPage(0);
  };

  const handleAddNew = () => {
    setEditingPartner(null);
    setShowFormModal(true);
  };

  const handleView = (partner) => {
    setViewingPartner(partner);
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setShowFormModal(true);
  };

  const handleDelete = (partner) => {
    setDeletingPartner(partner);
    setShowDeleteModal(true);
  };

  const handleToggleStatus = async (partner) => {
    try {
      const result = await partnerService.togglePartnerStatus(partner.id);
      if (result.success) {
        setSuccess('Thay đổi trạng thái đối tác thành công');
        loadPartners();
        loadStats();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Lỗi khi thay đổi trạng thái');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
  };

  const confirmDelete = async () => {
    if (!deletingPartner) return;
    
    try {
      const result = await partnerService.deletePartner(deletingPartner.id);
      if (result.success) {
        setSuccess('Xóa đối tác thành công');
        loadPartners();
        loadStats();
        setShowDeleteModal(false);
        setDeletingPartner(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Lỗi khi xóa đối tác');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    }
  };

  const handleFormSubmit = async (partnerData) => {
    try {
      let result;
      if (editingPartner) {
        result = await partnerService.updatePartner(editingPartner.id, partnerData);
      } else {
        result = await partnerService.createPartner(partnerData);
      }
      
      if (result.success) {
        setSuccess(editingPartner ? 'Cập nhật đối tác thành công' : 'Tạo đối tác thành công');
        setShowFormModal(false);
        setEditingPartner(null);
        loadPartners();
        loadStats();
        setTimeout(() => setSuccess(''), 3000);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: 'Lỗi kết nối server' };
    }
  };

  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i + 1}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(0)}
          disabled={currentPage === 0}
        >
          Đầu
        </button>
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          Trước
        </button>
        {pages}
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
        >
          Sau
        </button>
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
        >
          Cuối
        </button>
      </div>
    );
  };

  return (
    <div className="partner-management">
      {/* Simple Header */}
      <div className="simple-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Quản lý Đối tác</h1>
          </div>
          <button className="btn btn-primary add-partner-btn" onClick={handleAddNew}>
            <Plus size={20} />
            Thêm Đối tác mới
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-row">
          <div className="stat-card total">
            <div className="stat-icon">
              <Building2 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalPartners.toLocaleString()}</div>
              <div className="stat-label">Tổng đối tác</div>
            </div>
          </div>
          <div className="stat-card hotels">
            <div className="stat-icon">
              <Building2 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.hotelCount.toLocaleString()}</div>
              <div className="stat-label">Khách sạn</div>
            </div>
          </div>
          <div className="stat-card restaurants">
            <div className="stat-icon">
              <Utensils size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.restaurantCount.toLocaleString()}</div>
              <div className="stat-label">Nhà hàng</div>
            </div>
          </div>
          <div className="stat-card transport">
            <div className="stat-icon">
              <Car size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.transportCount.toLocaleString()}</div>
              <div className="stat-label">Vận chuyển</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Combined */}
      <div className="search-filter-section">
        <div className="search-filter-box">
          <div className="search-section">
            <Search size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên đối tác..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          
          <div className="filter-divider"></div>
          
          <div className="filter-section">
            <select
              value={selectedType}
              onChange={handleTypeFilter}
              className="filter-dropdown"
            >
              <option value="">Tất cả phân loại</option>
              <option value="HOTEL">Khách sạn</option>
              <option value="RESTAURANT">Nhà hàng</option>
              <option value="TRANSPORT">Vận chuyển</option>
            </select>
          </div>
          
          <div className="filter-divider"></div>
          
          <div className="filter-section">
            <select
              value={selectedStatus}
              onChange={handleStatusFilter}
              className="filter-dropdown"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            <table className="partners-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th 
                    className={`sortable ${sortBy === 'name' ? `sorted-${sortDir}` : ''}`}
                    onClick={() => handleSort('name')}
                  >
                    Tên đối tác
                  </th>
                  <th 
                    className={`sortable ${sortBy === 'type' ? `sorted-${sortDir}` : ''}`}
                    onClick={() => handleSort('type')}
                  >
                    Phân loại
                  </th>
                  <th>Địa chỉ</th>
                  <th 
                    className={`sortable ${sortBy === 'rating' ? `sorted-${sortDir}` : ''}`}
                    onClick={() => handleSort('rating')}
                  >
                    Rating
                  </th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {partners.length > 0 ? (
                  partners.map(partner => (
                    <PartnerRow
                      key={partner.id}
                      partner={partner}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      Không có dữ liệu đối tác
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination info */}
            <div className="table-info">
              <span>
                Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} 
                trong tổng số {totalElements} đối tác
              </span>
            </div>
            
            {renderPagination()}
          </>
        )}
      </div>

      {/* Modals */}
      {showFormModal && (
        <PartnerFormModal
          partner={editingPartner}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowFormModal(false);
            setEditingPartner(null);
          }}
        />
      )}

      {viewingPartner && (
        <div className="modal-overlay">
          <div className="view-modal">
            <div className="modal-header">
              <h3>Chi tiết đối tác</h3>
              <button
                className="close-button"
                onClick={() => setViewingPartner(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="view-content">
                <div className="view-section">
                  <div className="view-field">
                    <label>Tên đối tác:</label>
                    <span>{viewingPartner.name}</span>
                  </div>
                  
                  <div className="view-field">
                    <label>Phân loại:</label>
                    <div className="partner-type-display">
                      {(() => {
                        switch (viewingPartner.type) {
                          case 'HOTEL':
                            return <><Building2 size={16} /> Khách sạn</>;
                          case 'RESTAURANT':
                            return <><Utensils size={16} /> Nhà hàng</>;
                          case 'TRANSPORT':
                            return <><Car size={16} /> Vận chuyển</>;
                          default:
                            return viewingPartner.type;
                        }
                      })()}
                    </div>
                  </div>
                  
                  <div className="view-field">
                    <label>Trạng thái:</label>
                    <span className={`status-badge ${viewingPartner.isActive ? 'active' : 'inactive'}`}>
                      {viewingPartner.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                  
                  {viewingPartner.avatarUrl && (
                    <div className="view-field">
                      <label>Ảnh đại diện:</label>
                      <div className="view-image">
                        <img src={viewingPartner.avatarUrl} alt={viewingPartner.name} />
                      </div>
                    </div>
                  )}
                  
                  {viewingPartner.galleryImages && viewingPartner.galleryImages.length > 0 && (
                    <div className="view-field">
                      <label>Bộ sưu tập ảnh:</label>
                      <div className="gallery-images">
                        {viewingPartner.galleryImages.map((img, index) => (
                          <img key={index} src={img} alt={`Gallery ${index + 1}`} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="view-field">
                    <label>Mô tả:</label>
                    <div className="description-text">
                      {viewingPartner.description || 'Không có mô tả'}
                    </div>
                  </div>
                  
                  <div className="view-field">
                    <label>Địa chỉ:</label>
                    <div className="address-display">
                      <MapPin size={16} />
                      <span>{viewingPartner.address || 'Chưa cập nhật'}</span>
                    </div>
                  </div>
                  
                  {viewingPartner.phone && (
                    <div className="view-field">
                      <label>Số điện thoại:</label>
                      <div className="contact-display">
                        <Phone size={16} />
                        <span>{viewingPartner.phone}</span>
                      </div>
                    </div>
                  )}
                  
                  {viewingPartner.email && (
                    <div className="view-field">
                      <label>Email:</label>
                      <div className="contact-display">
                        <Mail size={16} />
                        <span>{viewingPartner.email}</span>
                      </div>
                    </div>
                  )}
                  
                  {viewingPartner.website && (
                    <div className="view-field">
                      <label>Website:</label>
                      <div className="contact-display">
                        <Globe size={16} />
                        <a href={viewingPartner.website} target="_blank" rel="noopener noreferrer">
                          {viewingPartner.website}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="view-field">
                    <label>Đánh giá:</label>
                    <div className="rating-display">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < viewingPartner.rating ? 'star-filled' : 'star-empty'}
                        />
                      ))}
                      <span>({viewingPartner.rating}/5)</span>
                    </div>
                  </div>
                  
                  {viewingPartner.priceRange && (
                    <div className="view-field">
                      <label>Khoảng giá:</label>
                      <span className="price-range">
                        {(() => {
                          switch (viewingPartner.priceRange) {
                            case 'BUDGET':
                              return 'Bình dân';
                            case 'MID_RANGE':
                              return 'Tầm trung';
                            case 'LUXURY':
                              return 'Cao cấp';
                            default:
                              return viewingPartner.priceRange;
                          }
                        })()}
                      </span>
                    </div>
                  )}
                  
                  {viewingPartner.amenities && viewingPartner.amenities.length > 0 && (
                    <div className="view-field">
                      <label>Tiện nghi:</label>
                      <div className="amenities-display">
                        {viewingPartner.amenities.map((amenity, index) => (
                          <span key={index} className="amenity-tag">{amenity}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="view-field">
                    <label>Ngày tạo:</label>
                    <span>{new Date(viewingPartner.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  
                  {viewingPartner.updatedAt && (
                    <div className="view-field">
                      <label>Cập nhật lần cuối:</label>
                      <span>{new Date(viewingPartner.updatedAt).toLocaleString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setViewingPartner(null)}
              >
                Đóng
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setViewingPartner(null);
                  handleEdit(viewingPartner);
                }}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          partner={deletingPartner}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeletingPartner(null);
          }}
        />
      )}
    </div>
  );
};

export default PartnerManagement;
