import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon, 
  TrashIcon, 
  RectangleStackIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  StarIcon as StarOutline
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import apiClient from '../../services/api';
import categoryAdminService from '../../services/admin/categoryAdminService';
import type { CategoryResponse } from '../../services/admin/categoryAdminService';
import Pagination from '../../components/ui/Pagination';
import ImageUpload from '../../components/admin/ImageUpload';

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  status: 'Active' | 'Inactive';
  isFeatured: boolean;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    featured: 0
  });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [viewingCategory, setViewingCategory] = useState<CategoryResponse | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: '',
    displayOrder: 0,
    status: 'Active',
    isFeatured: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  useEffect(() => {
    fetchCategories(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, statusFilter, featuredFilter, sortBy, sortDirection]);

  const fetchGlobalStats = async () => {
    try {
      const [totalRes, activeRes, inactiveRes, featuredRes] = await Promise.all([
        apiClient.get('/admin/categories/count'),
        apiClient.get('/admin/categories/count/active'),
        apiClient.get('/admin/categories/count/inactive'),
        apiClient.get('/admin/categories/count/featured')
      ]);
      
      setStats({
        total: totalRes.data.data || 0,
        active: activeRes.data.data || 0,
        inactive: inactiveRes.data.data || 0,
        featured: featuredRes.data.data || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchCategories = async (page: number) => {
    try {
      setLoading(true);
      
      // Build query params with filters
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
        sortBy: sortBy,
        direction: sortDirection
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (featuredFilter !== 'all') {
        params.append('featured', featuredFilter === 'featured' ? 'true' : 'false');
      }
      
      const response = await apiClient.get(`/admin/categories?${params.toString()}`);
      
      setCategories(response.data.data?.content || []);
      setTotalPages(response.data.data?.totalPages || 0);
      setTotalElements(response.data.data?.totalElements || 0);
      
      // Backend already filtered, so totalElements is the accurate filtered count
      setFilteredCount(response.data.data?.totalElements || 0);
      
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      displayOrder: 0,
      status: 'Active',
      isFeatured: false
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (category: CategoryResponse) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      displayOrder: category.displayOrder || 0,
      status: category.status,
      isFeatured: category.isFeatured || false
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openViewModal = (category: CategoryResponse) => {
    setViewingCategory(category);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setEditingCategory(null);
    setViewingCategory(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên danh mục là bắt buộc';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (editingCategory) {
        await categoryAdminService.updateCategory(editingCategory.id, formData);
      } else {
        await categoryAdminService.createCategory(formData);
      }
      
      closeModal();
      await fetchCategories(currentPage);
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirmId === id) {
      try {
        setLoading(true);
        await categoryAdminService.deleteCategory(id);
        setDeleteConfirmId(null);
        await fetchCategories(currentPage);
      } catch (error: any) {
        console.error('Error deleting category:', error);
        alert(error.response?.data?.message || 'Không thể xóa danh mục');
      } finally {
        setLoading(false);
      }
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'Active' | 'Inactive') => {
    try {
      setLoading(true);
      await apiClient.patch(`/admin/categories/${id}/status?status=${newStatus}`);
      await Promise.all([
        fetchCategories(currentPage),
        fetchGlobalStats()
      ]);
    } catch (error: any) {
      console.error('Error updating status:', error);
      alert(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id: number, currentFeatured: boolean) => {
    try {
      setLoading(true);
      console.log(`Toggling featured for category ${id}: ${currentFeatured} -> ${!currentFeatured}`);
      const response = await apiClient.patch(`/admin/categories/${id}/featured?featured=${!currentFeatured}`);
      console.log('Toggle response:', response.data);
      await Promise.all([
        fetchCategories(currentPage),
        fetchGlobalStats()
      ]);
    } catch (error: any) {
      console.error('Error toggling featured:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || error.response?.data?.error || 'Không thể cập nhật nổi bật');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý danh mục</h1>
          <button onClick={openCreateModal} className="admin-btn-primary">
            <PlusIcon className="h-5 w-5" />
            Thêm danh mục
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Tổng danh mục</p>
                <p className="admin-stat-value">{stats.total}</p>
              </div>
              <div className="admin-stat-icon bg-blue-100">
                <RectangleStackIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Đang hoạt động</p>
                <p className="admin-stat-value">{stats.active}</p>
              </div>
              <div className="admin-stat-icon bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Ngừng hoạt động</p>
                <p className="admin-stat-value">{stats.inactive}</p>
              </div>
              <div className="admin-stat-icon bg-gray-100">
                <XCircleIcon className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Nổi bật</p>
                <p className="admin-stat-value">{stats.featured}</p>
              </div>
              <div className="admin-stat-icon bg-yellow-100">
                <StarSolid className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filter-container">
          {/* Filter Result Label */}
          {(searchTerm || statusFilter !== 'all' || featuredFilter !== 'all') && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                🔍 Tìm thấy <span className="font-bold">{filteredCount}</span> danh mục
              </p>
            </div>
          )}
          
          <div className="admin-filter-grid">
            <div>
              <label className="admin-label">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Ngừng hoạt động</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Nổi bật</label>
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="featured">Nổi bật</option>
                <option value="normal">Thường</option>
              </select>
            </div>

            <div>
              <label className="admin-label">Sắp xếp</label>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('-');
                  setSortBy(field);
                  setSortDirection(dir as 'asc' | 'desc');
                }}
                className="admin-select"
              >
                <option value="id-asc">Mặc định</option>
                <option value="name-asc">Từ A-Z</option>
                <option value="name-desc">Từ Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="admin-table-container">
          <table className="admin-table">
            <thead className="admin-table-header">
              <tr>
                <th className="admin-table-th">ID</th>
                <th className="admin-table-th">Tên danh mục</th>
                <th className="admin-table-th">Hình ảnh</th>
                <th className="admin-table-th">Số tour</th>
                <th className="admin-table-th">Trạng thái</th>
                <th className="admin-table-th">Nổi bật</th>
                <th className="admin-table-th">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="admin-loading">
                    <div className="admin-spinner">
                      <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="admin-table-row">
                    <td className="admin-table-td">{category.id}</td>
                    <td className="admin-table-td font-medium">{category.name}</td>
                    <td className="admin-table-td">
                      {category.imageUrl ? (
                        <img src={category.imageUrl} alt={category.name} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                          No img
                        </div>
                      )}
                    </td>
                    <td className="admin-table-td">{category.tourCount || 0}</td>
                    <td className="admin-table-td">
                      <select
                        value={category.status}
                        onChange={(e) => handleStatusChange(category.id, e.target.value as 'Active' | 'Inactive')}
                        className={
                          category.status === 'Active'
                            ? 'admin-table-select-active'
                            : 'admin-table-select-inactive'
                        }
                        disabled={loading}
                      >
                        <option value="Active">Hoạt động</option>
                        <option value="Inactive">Ngừng hoạt động</option>
                      </select>
                    </td>
                    <td className="admin-table-td">
                      <button
                        onClick={() => {
                          console.log('⭐ STAR CLICKED!', category.id, category.isFeatured);
                          handleToggleFeatured(category.id, category.isFeatured);
                        }}
                        className="hover:scale-110 transition-transform disabled:opacity-50"
                        disabled={loading}
                        title={category.isFeatured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
                      >
                        {category.isFeatured ? (
                          <StarSolid className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <StarOutline className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
                        )}
                      </button>
                    </td>
                    <td className="admin-table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(category)}
                          className="admin-icon-btn-view"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(category)}
                          className="admin-icon-btn-edit"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className={
                            deleteConfirmId === category.id
                              ? 'admin-icon-btn-delete-confirm'
                              : 'admin-icon-btn-delete'
                          }
                          title={deleteConfirmId === category.id ? 'Click lại để xác nhận' : 'Xóa'}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <div className="text-sm text-gray-600 text-center mb-2">
            Hiển thị {categories.length} / {totalElements} danh mục
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && viewingCategory && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-container">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Chi tiết danh mục</h3>
              </div>
              <div className="admin-modal-body">
                <div className="admin-view-grid">
                  <div className="admin-view-item">
                    <p className="admin-view-label">ID</p>
                    <p className="admin-view-value">{viewingCategory.id}</p>
                  </div>
                  <div className="admin-view-item">
                    <p className="admin-view-label">Tên danh mục</p>
                    <p className="admin-view-value">{viewingCategory.name}</p>
                  </div>
                  <div className="admin-view-item">
                    <p className="admin-view-label">Slug</p>
                    <p className="admin-view-value text-gray-600">{viewingCategory.slug || '-'}</p>
                  </div>
                  <div className="admin-view-item">
                    <p className="admin-view-label">Icon</p>
                    <p className="admin-view-value text-2xl">{viewingCategory.icon || '📁'}</p>
                  </div>
                  <div className="admin-view-item">
                    <p className="admin-view-label">Thứ tự hiển thị</p>
                    <p className="admin-view-value">{viewingCategory.displayOrder || 0}</p>
                  </div>
                  <div className="admin-view-item">
                    <p className="admin-view-label">Số lượng tour</p>
                    <p className="admin-view-value font-semibold text-blue-600">{viewingCategory.tourCount || 0}</p>
                  </div>
                  <div className="admin-view-item">
                    <p className="admin-view-label">Trạng thái</p>
                    <p className="admin-view-value">
                      <span className={viewingCategory.status === 'Active' ? 'admin-badge-green' : 'admin-badge-gray'}>
                        {viewingCategory.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </p>
                  </div>
                  <div className="admin-view-item">
                    <p className="admin-view-label">Nổi bật</p>
                    <p className="admin-view-value">
                      {viewingCategory.isFeatured ? (
                        <span className="admin-badge-yellow">Có</span>
                      ) : (
                        <span className="admin-badge-gray">Không</span>
                      )}
                    </p>
                  </div>
                  {viewingCategory.parentId && (
                    <div className="admin-view-item">
                      <p className="admin-view-label">Danh mục cha</p>
                      <p className="admin-view-value">ID: {viewingCategory.parentId}</p>
                    </div>
                  )}
                  {viewingCategory.imageUrl && (
                    <div className="admin-view-item col-span-2">
                      <p className="admin-view-label">Hình ảnh</p>
                      <img 
                        src={viewingCategory.imageUrl} 
                        alt={viewingCategory.name}
                        className="mt-2 w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>
                  )}
                  <div className="admin-view-item col-span-2">
                    <p className="admin-view-label">Mô tả</p>
                    <p className="admin-view-value whitespace-pre-line">{viewingCategory.description || 'Chưa có mô tả'}</p>
                  </div>
                  <div className="admin-view-item">
                    <p className="admin-view-label">Ngày tạo</p>
                    <p className="admin-view-value text-sm text-gray-600">
                      {viewingCategory.createdAt ? new Date(viewingCategory.createdAt).toLocaleString('vi-VN') : '-'}
                    </p>
                  </div>
                  <div className="admin-view-item">
                    <p className="admin-view-label">Cập nhật lần cuối</p>
                    <p className="admin-view-value text-sm text-gray-600">
                      {viewingCategory.updatedAt ? new Date(viewingCategory.updatedAt).toLocaleString('vi-VN') : '-'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button onClick={closeModal} className="admin-btn-secondary">
                  Đóng
                </button>
                <button onClick={() => { closeModal(); openEditModal(viewingCategory); }} className="admin-btn-primary">
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-container">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">
                  {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="admin-modal-body">
                  <div className="space-y-5">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="admin-label">
                        Tên danh mục <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`admin-input ${formErrors.name ? 'admin-input-error' : ''}`}
                        placeholder="Nhập tên danh mục"
                      />
                      {formErrors.name && <p className="admin-error-text">{formErrors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="admin-label">Mô tả</label>
                      <textarea
                        id="description"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="admin-textarea"
                        placeholder="Nhập mô tả danh mục"
                      />
                    </div>

                    {/* Image Upload */}
                    <div className="border-t pt-4">
                      <ImageUpload
                        label="🖼️ Hình ảnh danh mục"
                        value={formData.imageUrl}
                        onChange={(url) => setFormData({ ...formData, imageUrl: url as string })}
                        multiple={false}
                        required={false}
                      />
                    </div>

                    {/* Status & Featured */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="status" className="admin-label">Trạng thái</label>
                        <select
                          id="status"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                          className="admin-select"
                        >
                          <option value="Active">Hoạt động</option>
                          <option value="Inactive">Ngừng hoạt động</option>
                        </select>
                      </div>
                      <div>
                        <label className="admin-label">Nổi bật</label>
                        <label className="flex items-center space-x-3 mt-2">
                          <input
                            type="checkbox"
                            checked={formData.isFeatured}
                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            className="admin-checkbox"
                          />
                          <span className="text-sm text-gray-700">Hiển thị nổi bật</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" onClick={closeModal} className="admin-btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" disabled={loading} className="admin-btn-primary">
                    {loading ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Tạo mới')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
