import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon, 
  TrashIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { AxiosError } from 'axios';
import Pagination from '../../components/ui/Pagination';
import ImageUpload from '../../components/admin/ImageUpload';
import { bannerService } from '../../services';
import type { Banner, BannerFormData } from '../../services';
import '../../styles/admin.css';

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    scheduled: 0
  });

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('displayOrder');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [viewingBanner, setViewingBanner] = useState<Banner | null>(null);

  // Form
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: '',
    displayOrder: 0,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch banners
  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await bannerService.getAllBanners();
      setBanners(data);
      applyFilters(data);
      calculateStats(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Calculate stats
  const calculateStats = (data: Banner[]) => {
    const now = new Date();
    const total = data.length;
    
    // Scheduled (upcoming): isActive = true AND startDate > now
    const scheduled = data.filter(b => 
      b.isActive && b.startDate && new Date(b.startDate) > now
    ).length;
    
    // Active: isActive = true AND (no startDate OR startDate <= now) AND (no endDate OR endDate >= now)
    const active = data.filter(b => 
      b.isActive && 
      (!b.startDate || new Date(b.startDate) <= now) &&
      (!b.endDate || new Date(b.endDate) >= now)
    ).length;
    
    // Inactive: isActive = false OR endDate < now
    const inactive = data.filter(b => 
      !b.isActive || (b.endDate && new Date(b.endDate) < now)
    ).length;

    setStats({ total, active, inactive, scheduled });
  };

  // Apply filters
  const applyFilters = (data: Banner[]) => {
    let filtered = [...data];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(banner =>
        banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (banner.subtitle && banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    const now = new Date();
    if (statusFilter === 'active') {
      filtered = filtered.filter(b => 
        b.isActive && 
        (!b.startDate || new Date(b.startDate) <= now) &&
        (!b.endDate || new Date(b.endDate) >= now)
      );
    } else if (statusFilter === 'scheduled') {
      filtered = filtered.filter(b => b.isActive && b.startDate && new Date(b.startDate) > now);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(b => !b.isActive || (b.endDate && new Date(b.endDate) < now));
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'displayOrder') return (a.displayOrder || 0) - (b.displayOrder || 0);
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });

    setFilteredBanners(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
  };

  useEffect(() => {
    applyFilters(banners);
    setCurrentPage(0);
  }, [searchTerm, statusFilter, sortBy, banners]);

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredBanners.slice(startIndex, endIndex);
  };

  // Modal handlers
  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      linkUrl: '',
      buttonText: 'Khám phá ngay',
      displayOrder: banners.length + 1,
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      buttonText: banner.buttonText || 'Khám phá ngay',
      displayOrder: banner.displayOrder || 0,
      isActive: banner.isActive,
      startDate: banner.startDate ? banner.startDate.slice(0, 16) : '',
      endDate: banner.endDate ? banner.endDate.slice(0, 16) : ''
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openViewModal = (banner: Banner) => {
    setViewingBanner(banner);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setErrors({});
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingBanner(null);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) newErrors.title = 'Tiêu đề không được để trống';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'Hình ảnh không được để trống';
    if (formData.displayOrder < 0) newErrors.displayOrder = 'Thứ tự hiển thị phải >= 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // CRUD operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingBanner) {
        await bannerService.updateBanner(editingBanner.id, formData);
      } else {
        await bannerService.createBanner(formData);
      }
      await fetchBanners();
      closeModal();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setErrors({ submit: axiosError.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  const handleDelete = async (id: number) => {
    const banner = banners.find(b => b.id === id);
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa banner "${banner?.title || id}"?\n\n` +
      `⚠️ Lưu ý: Banner sẽ bị xóa vĩnh viễn và không thể khôi phục!`
    );
    
    if (!confirmed) return;

    try {
      await bannerService.deleteBanner(id);
      await fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Có lỗi xảy ra khi xóa banner');
    }
  };

  // Status badge (for view modal only)
  const getStatusBadge = (banner: Banner) => {
    const now = new Date();
    
    if (!banner.isActive) {
      return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Tắt</span>;
    }
    
    if (banner.endDate && new Date(banner.endDate) < now) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Hết hạn</span>;
    }
    
    if (banner.startDate && new Date(banner.startDate) > now) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Sắp diễn ra</span>;
    }
    
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Đang hoạt động</span>;
  };

  // Handle status change
  const handleStatusChange = async (bannerId: number, newStatus: boolean) => {
    try {
      const banner = banners.find(b => b.id === bannerId);
      if (!banner) return;

      await bannerService.updateBanner(bannerId, {
        ...banner,
        isActive: newStatus
      });
      
      await fetchBanners();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Banner</h1>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 flex-shrink-0"
            >
              <PlusIcon className="h-5 w-5" />
              Tạo Banner
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="admin-stat-label">Tổng số Banner</p>
              <p className="admin-stat-value">{stats.total}</p>
            </div>
            <div className="admin-stat-icon bg-blue-100">
              <PhotoIcon className="h-6 w-6 text-blue-600" />
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
              <p className="admin-stat-label">Sắp diễn ra</p>
              <p className="admin-stat-value">{stats.scheduled}</p>
            </div>
            <div className="admin-stat-icon bg-yellow-100">
              <CheckCircleIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="admin-stat-label">Không hoạt động</p>
              <p className="admin-stat-value">{stats.inactive}</p>
            </div>
            <div className="admin-stat-icon bg-gray-100">
              <XCircleIcon className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
        </div>

        {/* Filters */}
        <div className="admin-filter-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="admin-label">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Tìm theo tiêu đề..."
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
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="scheduled">Sắp diễn ra</option>
            </select>
          </div>

          <div>
            <label className="admin-label">Sắp xếp</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="admin-select"
            >
              <option value="displayOrder">Thứ tự hiển thị</option>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>
        </div>

        {/* Table */}
        <div className="admin-table-container">
        <table className="admin-table">
          <thead className="admin-table-header">
            <tr>
              <th className="admin-table-th">Hình ảnh</th>
              <th className="admin-table-th">Tiêu đề</th>
              <th className="admin-table-th">Liên kết</th>
              <th className="admin-table-th">Thứ tự</th>
              <th className="admin-table-th">Trạng thái</th>
              <th className="admin-table-th">Thao tác</th>
            </tr>
          </thead>
          <tbody className="admin-table-body">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="admin-table-td text-center py-12">
                  Đang tải...
                </td>
              </tr>
            ) : getCurrentPageData().length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-table-td text-center py-12">
                  Không có banner nào
                </td>
              </tr>
            ) : (
              getCurrentPageData().map((banner) => (
                <tr key={banner.id} className="admin-table-row">
                  <td className="admin-table-td">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-16 w-28 object-cover rounded"
                    />
                  </td>
                  <td className="admin-table-td">
                    <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                  </td>
                  <td className="admin-table-td">
                    <div className="text-sm text-blue-600 hover:underline max-w-xs truncate">
                      {banner.linkUrl || '-'}
                    </div>
                  </td>
                  <td className="admin-table-td">
                    <div className="text-sm text-gray-900">{banner.displayOrder}</div>
                  </td>
                  <td className="admin-table-td">
                    {(() => {
                      const now = new Date();
                      const isUpcoming = banner.isActive && banner.startDate && new Date(banner.startDate) > now;
                      const isInactive = !banner.isActive || (banner.endDate && new Date(banner.endDate) < now);
                      
                      // Show badge for upcoming banners
                      if (isUpcoming) {
                        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Sắp diễn ra</span>;
                      }
                      
                      // Show dropdown for active/inactive banners
                      return (
                        <select
                          value={isInactive ? 'inactive' : 'active'}
                          onChange={(e) => handleStatusChange(banner.id, e.target.value === 'active')}
                          className={`admin-table-select ${
                            isInactive
                              ? 'admin-table-select-inactive' 
                              : 'admin-table-select-active'
                          }`}
                        >
                          <option value="active">Đang hoạt động</option>
                          <option value="inactive">Không hoạt động</option>
                        </select>
                      );
                    })()}
                  </td>
                  <td className="admin-table-td">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(banner)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openEditModal(banner)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Sửa"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
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
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-container">
            <div className="admin-modal max-w-2xl">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">
                  {editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="admin-modal-body">
                  <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Khám Phá Thế Giới Cùng Chúng Tôi"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phụ đề</label>
                <textarea
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Những chuyến đi đáng nhớ đang chờ đón bạn..."
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh <span className="text-red-500">*</span>
                </label>
                <ImageUpload
                  value={formData.imageUrl}
                  onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                  onError={(error) => setErrors({ ...errors, imageUrl: error })}
                />
                {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl}</p>}
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL liên kết</label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="/tours"
                />
              </div>

              {/* Button Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Văn bản nút</label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Khám phá ngay"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thứ tự hiển thị <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
                {errors.displayOrder && <p className="text-red-500 text-sm mt-1">{errors.displayOrder}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Is Active */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Kích hoạt banner
                </label>
              </div>

                    {errors.submit && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                        {errors.submit}
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-modal-footer">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="admin-btn-secondary"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="admin-btn-primary"
                  >
                    {editingBanner ? 'Cập nhật' : 'Tạo Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingBanner && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeViewModal} />
          <div className="admin-modal-container">
            <div className="admin-modal max-w-2xl">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Chi tiết Banner</h3>
              </div>
              
              <div className="admin-modal-body">
                <div className="space-y-4">
                  <div>
                    <img
                      src={viewingBanner.imageUrl}
                      alt={viewingBanner.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="admin-view-label">Tiêu đề</label>
                      <p className="admin-view-value">{viewingBanner.title}</p>
                    </div>
                    <div>
                      <label className="admin-view-label">Trạng thái</label>
                      <div className="mt-1">{getStatusBadge(viewingBanner)}</div>
                    </div>
                  </div>

                  {viewingBanner.subtitle && (
                    <div>
                      <label className="admin-view-label">Phụ đề</label>
                      <p className="admin-view-value">{viewingBanner.subtitle}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="admin-view-label">Liên kết</label>
                      <p className="text-sm text-blue-600">{viewingBanner.linkUrl || '-'}</p>
                    </div>
                    <div>
                      <label className="admin-view-label">Văn bản nút</label>
                      <p className="admin-view-value">{viewingBanner.buttonText || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="admin-view-label">Thứ tự hiển thị</label>
                      <p className="admin-view-value">{viewingBanner.displayOrder}</p>
                    </div>
                    <div>
                      <label className="admin-view-label">Kích hoạt</label>
                      <p className="admin-view-value">{viewingBanner.isActive ? 'Có' : 'Không'}</p>
                    </div>
                  </div>

                  {(viewingBanner.startDate || viewingBanner.endDate) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="admin-view-label">Ngày bắt đầu</label>
                        <p className="admin-view-value">
                          {viewingBanner.startDate 
                            ? new Date(viewingBanner.startDate).toLocaleString('vi-VN')
                            : '-'}
                        </p>
                      </div>
                      <div>
                        <label className="admin-view-label">Ngày kết thúc</label>
                        <p className="admin-view-value">
                          {viewingBanner.endDate 
                            ? new Date(viewingBanner.endDate).toLocaleString('vi-VN')
                            : '-'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <label className="admin-view-label">Ngày tạo</label>
                      <p className="admin-view-value">
                        {new Date(viewingBanner.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <label className="admin-view-label">Ngày cập nhật</label>
                      <p className="admin-view-value">
                        {new Date(viewingBanner.updatedAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="admin-btn-secondary"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeViewModal();
                    openEditModal(viewingBanner);
                  }}
                  className="admin-btn-primary"
                >
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;

