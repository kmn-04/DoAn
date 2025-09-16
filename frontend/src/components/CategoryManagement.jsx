import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  AlertTriangle
} from 'lucide-react';
import categoryService from '../services/categoryService';
import authService from '../services/authService';
import CategoryFormModal from './CategoryFormModal';
import Icons from './Icons';
import '../styles/components/CategoryManagement.css';

// Component cho từng row trong bảng
const CategoryRow = ({ category, onEdit, onDelete, onToggleStatus }) => {

  const handleStatusChange = (e) => {
    const newStatus = e.target.value === 'true';
    if (newStatus !== category.isActive) {
      onToggleStatus(category);
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

  return (
    <tr className="category-row">
      <td className="order-cell">
        <span className="display-order">{category.displayOrder}</span>
      </td>
      <td className="image-cell">
        <div className="category-image">
          {category.imageUrl ? (
            <img src={category.imageUrl} alt={category.name} />
          ) : (
            <div className="image-placeholder">
              <ImageIcon size={24} />
            </div>
          )}
        </div>
      </td>
      <td className="name-cell">
        <div className="category-name">
          <h4>{category.name}</h4>
        </div>
      </td>
      <td className="description-cell">
        <div className="category-description">
          {category.description && category.description.length > 100
            ? `${category.description.substring(0, 100)}...`
            : category.description || 'Không có mô tả'}
        </div>
      </td>
      <td className="status-cell">
        <select 
          value={category.isActive}
          onChange={handleStatusChange}
          className="status-dropdown"
          data-status={category.isActive}
        >
          <option value={true}>Hoạt động</option>
          <option value={false}>Không hoạt động</option>
        </select>
      </td>
      <td className="date-cell">
        <small>{formatDate(category.createdAt)}</small>
      </td>
      <td className="actions-cell">
        <div className="action-buttons">
          <button
            className="btn-action btn-edit"
            onClick={() => onEdit(category)}
            title="Chỉnh sửa"
          >
            <Edit size={16} />
          </button>
          <button
            className="btn-action btn-delete"
            onClick={() => onDelete(category)}
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Component chính CategoryManagement
const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [stats, setStats] = useState(null);

  // Removed drag and drop sensors

  // Load categories khi component mount
  useEffect(() => {
    // Debug auth info
    console.log('=== DEBUG AUTH INFO ===');
    console.log('Token:', authService.getToken());
    console.log('User:', authService.getCurrentUser());
    console.log('Is Authenticated:', authService.isAuthenticated());
    console.log('Has ADMIN role:', authService.hasRole('ADMIN'));
    
    loadCategories();
    loadStats();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = await categoryService.getAllCategoriesOrderByDisplay();
      if (result.success) {
        setCategories(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách danh mục');
      console.error('Error loading categories:', err);
    }
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const result = await categoryService.getCategoryStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = async (term) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      loadCategories();
      return;
    }

    try {
      const result = await categoryService.searchCategories(term);
      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Error searching categories:', err);
    }
  };

  // Xử lý filter theo trạng thái
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  // Filter categories based on search and status
  const filteredCategories = categories.filter(category => {
    const matchesSearch = searchTerm === '' || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && category.isActive) ||
      (statusFilter === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Removed drag and drop handler

  // Xử lý thêm mới
  const handleAdd = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  // Xử lý chỉnh sửa
  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  // Xử lý xóa
  const handleDelete = (category) => {
    setDeleteConfirm(category);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const result = await categoryService.deleteCategory(deleteConfirm.id);
      if (result.success) {
        loadCategories();
        loadStats();
        setDeleteConfirm(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Lỗi khi xóa danh mục');
    }
  };

  // Xử lý toggle trạng thái
  const handleToggleStatus = async (category) => {
    try {
      const result = await categoryService.toggleCategoryStatus(category.id);
      if (result.success) {
        loadCategories();
        loadStats();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Lỗi khi thay đổi trạng thái danh mục');
    }
  };

  // Xử lý khi form modal hoàn thành
  const handleFormComplete = () => {
    setShowModal(false);
    setEditingCategory(null);
    loadCategories();
    loadStats();
  };

  if (loading) {
    return (
      <div className="category-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách danh mục...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-management">
      {/* Simple Header */}
      <div className="simple-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">Quản lý Danh mục Tour</h1>
          </div>
          <button className="btn btn-primary add-category-btn" onClick={handleAdd}>
            {Icons.Plus && Icons.Plus()} Thêm danh mục mới
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-row">
          <div className="stat-card total">
            <div className="stat-icon">
              {Icons.TotalCategories && Icons.TotalCategories()}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalCategories.toLocaleString()}</div>
              <div className="stat-label">Tổng danh mục</div>
            </div>
          </div>
          <div className="stat-card active">
            <div className="stat-icon">
              {Icons.ActiveCategories && Icons.ActiveCategories()}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.activeCategories.toLocaleString()}</div>
              <div className="stat-label">Đang hoạt động</div>
            </div>
          </div>
          <div className="stat-card inactive">
            <div className="stat-icon">
              {Icons.InactiveCategories && Icons.InactiveCategories()}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.inactiveCategories.toLocaleString()}</div>
              <div className="stat-label">Không hoạt động</div>
            </div>
          </div>
          <div className="stat-card showing">
            <div className="stat-icon">
              {Icons.ShowingItems && Icons.ShowingItems()}
            </div>
            <div className="stat-content">
              <div className="stat-value">{filteredCategories.length.toLocaleString()}</div>
              <div className="stat-label">Hiển thị</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Combined */}
      <div className="search-filter-combined">
        <div className="combined-box">
          <div className="search-section">
            <Search size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm danh mục theo tên..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="divider"></div>
          
          <div className="filter-section">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="filter-dropdown"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Dừng hoạt động</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Categories Table */}
      <div className="table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th className="order-header">Thứ tự</th>
              <th className="image-header">Ảnh</th>
              <th className="name-header">Tên danh mục</th>
              <th className="description-header">Mô tả</th>
              <th className="status-header">Trạng thái</th>
              <th className="date-header">Ngày tạo</th>
              <th className="actions-header">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">
                  {searchTerm || statusFilter !== 'all' ? 'Không tìm thấy danh mục nào phù hợp' : 'Chưa có danh mục nào'}
                </td>
              </tr>
            ) : (
              filteredCategories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Category Form Modal */}
      {showModal && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setShowModal(false)}
          onComplete={handleFormComplete}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <div className="dialog-header">
              <h3>Xác nhận xóa danh mục</h3>
            </div>
            <div className="dialog-body">
              <p>
                Bạn có chắc chắn muốn xóa danh mục "<strong>{deleteConfirm.name}</strong>" không?
              </p>
              <p className="warning-text">
                Các tour thuộc danh mục này sẽ không bị xóa nhưng sẽ không còn được phân loại.
              </p>
            </div>
            <div className="dialog-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Hủy bỏ
              </button>
              <button
                className="btn-danger"
                onClick={confirmDelete}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
