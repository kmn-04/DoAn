import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon, 
  TrashIcon, 
  TicketIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { AxiosError } from 'axios';
import apiClient from '../../services/api';
import Pagination from '../../components/ui/Pagination';

interface Promotion {
  id: number;
  code: string;
  name: string;
  description: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  isValid: boolean;
  isExpired: boolean;
  remainingUses: number | null;
}

interface PromotionFormData {
  code: string;
  name: string;
  description: string;
  type: 'Percentage' | 'Fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount: number;
  usageLimit: number;
  startDate: string;
  endDate: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    upcoming: 0
  });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [viewingPromotion, setViewingPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<PromotionFormData>({
    code: '',
    name: '',
    description: '',
    type: 'Percentage',
    value: 0,
    usageLimit: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'ACTIVE'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filters change
    if (searchTerm || statusFilter !== 'all' || typeFilter !== 'all') {
      setCurrentPage(0);
    }
  }, [searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    fetchPromotions(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, statusFilter, typeFilter, sortBy, sortDirection]);

  const fetchGlobalStats = async () => {
    try {
      const [totalRes, activeRes] = await Promise.all([
        apiClient.get('/admin/promotions/count'),
        apiClient.get('/admin/promotions/count/active')
      ]);
      
      // Calculate expired and upcoming from filtered data
      const allPromosRes = await apiClient.get('/admin/promotions?page=0&size=1000');
      const allPromos = allPromosRes.data.data?.content || [];
      const now = new Date();
      
      // Count by status AND date logic
      const expired = allPromos.filter((p: Promotion) => 
        p.status === 'EXPIRED' || (p.status === 'ACTIVE' && new Date(p.endDate) < now)
      ).length;
      
      const upcoming = allPromos.filter((p: Promotion) => 
        p.status === 'ACTIVE' && new Date(p.startDate) > now
      ).length;
      
      setStats({
        total: totalRes.data.data || 0,
        active: activeRes.data.data || 0,
        expired,
        upcoming
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPromotions = async (page: number) => {
    try {
      setLoading(true);
      
      // Fetch ALL when filtering, otherwise use pagination
      const shouldFetchAll = searchTerm || statusFilter !== 'all' || typeFilter !== 'all';
      const pageSize = 10;
      const response = await apiClient.get(`/admin/promotions?page=${shouldFetchAll ? 0 : page}&size=${shouldFetchAll ? 1000 : pageSize}&sortBy=${sortBy}&sortDir=${sortDirection}`);
      
      let filteredData = response.data.data?.content || [];
      
      // Apply filters
      if (searchTerm) {
        filteredData = filteredData.filter((promo: Promotion) =>
          promo.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (promo.name && promo.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (promo.description && promo.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      if (statusFilter !== 'all') {
        const now = new Date();
        if (statusFilter === 'active') {
          filteredData = filteredData.filter((p: Promotion) => 
            p.status === 'ACTIVE' && new Date(p.startDate) <= now && new Date(p.endDate) >= now
          );
        } else if (statusFilter === 'expired') {
          filteredData = filteredData.filter((p: Promotion) => p.status === 'EXPIRED' || new Date(p.endDate) < now);
        } else if (statusFilter === 'upcoming') {
          filteredData = filteredData.filter((p: Promotion) => new Date(p.startDate) > now);
        } else if (statusFilter === 'inactive') {
          filteredData = filteredData.filter((p: Promotion) => p.status === 'INACTIVE');
        }
      }
      if (typeFilter !== 'all') {
        filteredData = filteredData.filter((p: Promotion) => p.type === typeFilter);
      }
      
      // Apply sorting
      filteredData.sort((a: Promotion, b: Promotion) => {
        let compareA: any = a[sortBy as keyof Promotion];
        let compareB: any = b[sortBy as keyof Promotion];
        
        if (typeof compareA === 'string') {
          compareA = compareA.toLowerCase();
          compareB = compareB.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
          return compareA > compareB ? 1 : -1;
        } else {
          return compareA < compareB ? 1 : -1;
        }
      });
      
      // Client-side pagination when filtering
      if (shouldFetchAll) {
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        setPromotions(paginatedData);
        setTotalPages(Math.ceil(filteredData.length / pageSize));
        setTotalElements(filteredData.length);
        setFilteredCount(filteredData.length);
      } else {
        setPromotions(filteredData);
        setTotalPages(response.data.data?.totalPages || 0);
        setTotalElements(response.data.data?.totalElements || 0);
        setFilteredCount(response.data.data?.totalElements || 0);
      }
      
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const openCreateModal = () => {
    setEditingPromotion(null);
    setFormData({
      code: generateCode(),
      name: '',
      description: '',
      type: 'Percentage',
      value: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 100,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      minOrderAmount: promotion.minOrderAmount || 0,
      maxDiscount: promotion.maxDiscount || 0,
      usageLimit: promotion.usageLimit,
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0],
      status: promotion.status
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openViewModal = (promotion: Promotion) => {
    setViewingPromotion(promotion);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setEditingPromotion(null);
    setViewingPromotion(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      errors.code = 'Mã khuyến mãi là bắt buộc';
    }
    if (!formData.name.trim()) {
      errors.name = 'Tên khuyến mãi là bắt buộc';
    }
    if (formData.value <= 0) {
      errors.value = 'Giá trị phải lớn hơn 0';
    }
    if (formData.type === 'PERCENTAGE' && formData.value > 100) {
      errors.value = 'Phần trăm không được vượt quá 100';
    }
    if (formData.usageLimit < 1) {
      errors.usageLimit = 'Giới hạn sử dụng phải ít nhất là 1';
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Convert date strings to LocalDateTime format (add time)
      const payload = {
        ...formData,
        startDate: `${formData.startDate}T00:00:00`,
        endDate: `${formData.endDate}T23:59:59`
      };
      
      if (editingPromotion) {
        await apiClient.put(`/admin/promotions/${editingPromotion.id}`, payload);
      } else {
        await apiClient.post('/admin/promotions', payload);
      }
      
      closeModal();
      await fetchPromotions(currentPage);
    } catch (error) {
      console.error('Error saving promotion:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa khuyến mãi "${promotion.name}" (${promotion.code})?\n\n⚠️ Hành động này không thể hoàn tác!`
    );
    
    if (!confirmed) return;
    
    try {
      setLoading(true);
      await apiClient.delete(`/admin/promotions/${promotion.id}`);
      await fetchPromotions(currentPage);
      await fetchGlobalStats();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể xóa khuyến mãi');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED') => {
    try {
      setLoading(true);
      const promotion = promotions.find(p => p.id === id);
      if (promotion && promotion.status !== newStatus) {
        const payload = {
          code: promotion.code,
          name: promotion.name,
          description: promotion.description,
          type: promotion.type,
          value: promotion.value,
          minOrderAmount: promotion.minOrderAmount,
          maxDiscount: promotion.maxDiscount,
          usageLimit: promotion.usageLimit,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          status: newStatus
        };
        await apiClient.put(`/admin/promotions/${id}`, payload);
        await fetchPromotions(currentPage);
        await fetchGlobalStats(); // Refresh statistics
      }
    } catch (error) {
      console.error('Error updating status:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể cập nhật');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClassName = (status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED') => {
    switch (status) {
      case 'ACTIVE':
        return 'admin-table-select-active';
      case 'INACTIVE':
        return 'admin-table-select-inactive';
      case 'EXPIRED':
        return 'admin-table-select-rejected';
      default:
        return '';
    }
  };

  const getPromotionStatus = (promotion: Promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);
    
    if (promotion.status === 'INACTIVE') return { label: 'Tắt', className: 'admin-badge-gray' };
    if (promotion.status === 'EXPIRED' || end < now) return { label: 'Hết hạn', className: 'admin-badge-red' };
    if (start > now) return { label: 'Sắp diễn ra', className: 'admin-badge-blue' };
    return { label: 'Đang hoạt động', className: 'admin-badge-green' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý khuyến mãi</h1>
          <button onClick={openCreateModal} className="admin-btn-primary">
            <PlusIcon className="h-5 w-5" />
            Thêm khuyến mãi
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Tổng khuyến mãi</p>
                <p className="admin-stat-value">{stats.total}</p>
              </div>
              <div className="admin-stat-icon bg-purple-100">
                <TicketIcon className="h-6 w-6 text-purple-600" />
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
                <p className="admin-stat-label">Hết hạn</p>
                <p className="admin-stat-value">{stats.expired}</p>
              </div>
              <div className="admin-stat-icon bg-red-100">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Sắp diễn ra</p>
                <p className="admin-stat-value">{stats.upcoming}</p>
              </div>
              <div className="admin-stat-icon bg-blue-100">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filter-container">
          {/* Filter Result Label */}
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                🔍 Tìm thấy <span className="font-bold">{filteredCount}</span> khuyến mãi
              </p>
            </div>
          )}
          
          <div className="admin-filter-grid">
            <div>
              <label className="admin-label">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm theo mã, tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Loại</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="PERCENTAGE">Phần trăm</option>
                <option value="FIXED_AMOUNT">Số tiền cố định</option>
              </select>
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
                <option value="upcoming">Sắp diễn ra</option>
                <option value="expired">Hết hạn</option>
                <option value="inactive">Tắt</option>
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
                <option value="startDate-desc">Ngày bắt đầu mới nhất</option>
                <option value="startDate-asc">Ngày bắt đầu cũ nhất</option>
                <option value="value-desc">Giá trị cao - thấp</option>
                <option value="value-asc">Giá trị thấp - cao</option>
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
                <th className="admin-table-th">Mã khuyến mãi</th>
                <th className="admin-table-th">Loại</th>
                <th className="admin-table-th">Giá trị</th>
                <th className="admin-table-th">Sử dụng</th>
                <th className="admin-table-th">Thời gian</th>
                <th className="admin-table-th">Trạng thái</th>
                <th className="admin-table-th">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="admin-loading">
                    <div className="admin-spinner">
                      <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : promotions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                promotions.map((promotion) => {
                  const status = getPromotionStatus(promotion);
                  return (
                    <tr key={promotion.id} className="admin-table-row">
                      <td className="admin-table-td font-semibold text-gray-900">{promotion.id}</td>
                      <td className="admin-table-td">
                        <span className="font-mono font-semibold text-purple-600">{promotion.code}</span>
                      </td>
                      <td className="admin-table-td">
                        <span className="admin-badge-blue">
                          {promotion.type === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền'}
                        </span>
                      </td>
                      <td className="admin-table-td font-semibold text-green-600">
                        {promotion.type === 'PERCENTAGE'
                          ? `${promotion.value}%` 
                          : formatPrice(promotion.value)
                        }
                      </td>
                      <td className="admin-table-td">
                        <span className="text-sm">
                          {promotion.usageCount} / {promotion.usageLimit}
                        </span>
                      </td>
                      <td className="admin-table-td text-sm">
                        <div>{formatDate(promotion.startDate)}</div>
                        <div className="text-gray-500">đến {formatDate(promotion.endDate)}</div>
                      </td>
                      <td className="admin-table-td">
                        {status.label === 'Sắp diễn ra' ? (
                          // Display badge for upcoming promotions (read-only)
                          <span className={`${status.className} px-3 py-1.5 rounded text-center inline-block`}>
                            {status.label}
                          </span>
                        ) : (
                          // Edit dropdown for other statuses
                          <select
                            value={promotion.status}
                            onChange={(e) => handleStatusChange(promotion.id, e.target.value as 'ACTIVE' | 'INACTIVE' | 'EXPIRED')}
                            className={`admin-table-select ${getStatusClassName(promotion.status)}`}
                            disabled={loading}
                          >
                            <option value="ACTIVE">Đang hoạt động</option>
                            <option value="INACTIVE">Tắt</option>
                            <option value="EXPIRED">Hết hạn</option>
                          </select>
                        )}
                      </td>
                      <td className="admin-table-td">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openViewModal(promotion)}
                            className="admin-icon-btn-view"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openEditModal(promotion)}
                            className="admin-icon-btn-edit"
                            title="Chỉnh sửa"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(promotion)}
                            className="admin-icon-btn-delete"
                            title="Xóa"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <div className="text-sm text-gray-600 text-center mb-2">
            Hiển thị {promotions.length} / {totalElements} khuyến mãi
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && viewingPromotion && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-container">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Chi tiết khuyến mãi</h3>
              </div>
              <div className="admin-modal-body">
                <div className="space-y-6">
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin cơ bản</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">Mã khuyến mãi</p>
                        <p className="admin-view-value">
                          <span className="font-mono font-semibold text-purple-600">{viewingPromotion.code}</span>
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Tên</p>
                        <p className="admin-view-value">{viewingPromotion.name}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Loại</p>
                        <p className="admin-view-value">
                          <span className="admin-badge-blue">
                            {viewingPromotion.type === 'PERCENTAGE' ? 'Phần trăm' : 'Số tiền cố định'}
                          </span>
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Trạng thái</p>
                        <p className="admin-view-value">
                          <span className={getPromotionStatus(viewingPromotion).className}>
                            {getPromotionStatus(viewingPromotion).label}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Giá trị & Điều kiện</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">Giá trị giảm</p>
                        <p className="admin-view-value font-semibold text-green-600">
                          {viewingPromotion.type === 'PERCENTAGE' 
                            ? `${viewingPromotion.value}%` 
                            : formatPrice(viewingPromotion.value)
                          }
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Đơn hàng tối thiểu</p>
                        <p className="admin-view-value">
                          {viewingPromotion.minOrderAmount > 0 
                            ? formatPrice(viewingPromotion.minOrderAmount) 
                            : 'Không yêu cầu'
                          }
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Giảm tối đa</p>
                        <p className="admin-view-value">
                          {viewingPromotion.maxDiscount > 0 
                            ? formatPrice(viewingPromotion.maxDiscount) 
                            : 'Không giới hạn'
                          }
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Giới hạn sử dụng</p>
                        <p className="admin-view-value">{viewingPromotion.usageLimit} lần</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Đã sử dụng</p>
                        <p className="admin-view-value">
                          {viewingPromotion.usageCount} / {viewingPromotion.usageLimit}
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Còn lại</p>
                        <p className="admin-view-value text-blue-600 font-semibold">
                          {viewingPromotion.remainingUses !== null 
                            ? `${viewingPromotion.remainingUses} lần` 
                            : 'Không giới hạn'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thời gian</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">Ngày bắt đầu</p>
                        <p className="admin-view-value">{formatDate(viewingPromotion.startDate)}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Ngày kết thúc</p>
                        <p className="admin-view-value">{formatDate(viewingPromotion.endDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Mô tả</h4>
                    <p className="text-sm text-gray-700">{viewingPromotion.description || 'Chưa có mô tả'}</p>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button onClick={closeModal} className="admin-btn-secondary">
                  Đóng
                </button>
                <button onClick={() => { closeModal(); openEditModal(viewingPromotion); }} className="admin-btn-primary">
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
                  {editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="admin-modal-body">
                  <div className="space-y-5">
                    {/* Code & Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="code" className="admin-label">
                          Mã khuyến mãi <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            id="code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            className={`admin-input font-mono ${formErrors.code ? 'admin-input-error' : ''}`}
                            placeholder="SUMMER2024"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, code: generateCode() })}
                            className="admin-btn-secondary whitespace-nowrap"
                          >
                            Tạo mã
                          </button>
                        </div>
                        {formErrors.code && <p className="admin-error-text">{formErrors.code}</p>}
                      </div>
                      <div>
                        <label htmlFor="name" className="admin-label">
                          Tên khuyến mãi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`admin-input ${formErrors.name ? 'admin-input-error' : ''}`}
                          placeholder="Giảm giá mùa hè"
                        />
                        {formErrors.name && <p className="admin-error-text">{formErrors.name}</p>}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="admin-label">Mô tả</label>
                      <textarea
                        id="description"
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="admin-textarea"
                        placeholder="Mô tả chi tiết về khuyến mãi"
                      />
                    </div>

                    {/* Type & Value */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="type" className="admin-label">
                          Loại giảm giá <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="type"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Percentage' | 'Fixed' })}
                          className="admin-select"
                        >
                          <option value="PERCENTAGE">Phần trăm (%)</option>
                          <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="value" className="admin-label">
                          Giá trị giảm {formData.type === 'PERCENTAGE' ? '(%)' : '(VNĐ)'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            id="value"
                            value={formData.value}
                            onChange={(e) => {
                              let value = parseFloat(e.target.value) || 0;
                              // Giới hạn percentage tối đa 100
                              if (formData.type === 'PERCENTAGE' && value > 100) {
                                value = 100;
                              }
                              setFormData({ ...formData, value });
                            }}
                            className={`admin-input ${formErrors.value ? 'admin-input-error' : ''}`}
                            min="0"
                            max={formData.type === 'PERCENTAGE' ? '100' : undefined}
                            step={formData.type === 'PERCENTAGE' ? '1' : '1000'}
                            placeholder={formData.type === 'PERCENTAGE' ? 'Ví dụ: 10' : 'Ví dụ: 50000'}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
                            {formData.type === 'PERCENTAGE' ? '%' : 'đ'}
                          </div>
                        </div>
                        {formErrors.value && <p className="admin-error-text">{formErrors.value}</p>}
                        {formData.type === 'PERCENTAGE' && formData.value > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            Giảm {formData.value}% cho đơn hàng
                          </p>
                        )}
                        {formData.type === 'FIXED_AMOUNT' && formData.value > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            Giảm {formData.value.toLocaleString('vi-VN')}đ cho đơn hàng
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Min Order & Max Discount */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="minOrderAmount" className="admin-label">
                          Đơn hàng tối thiểu (VNĐ)
                        </label>
                        <input
                          type="number"
                          id="minOrderAmount"
                          value={formData.minOrderAmount}
                          onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
                          className="admin-input"
                          min="0"
                          step="1000"
                        />
                      </div>
                      <div>
                        <label htmlFor="maxDiscount" className="admin-label">
                          Giảm tối đa (VNĐ)
                        </label>
                        <input
                          type="number"
                          id="maxDiscount"
                          value={formData.maxDiscount}
                          onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) || 0 })}
                          className="admin-input"
                          min="0"
                          step="1000"
                          placeholder="0 = Không giới hạn"
                        />
                      </div>
                    </div>

                    {/* Usage Limit */}
                    <div>
                      <label htmlFor="usageLimit" className="admin-label">
                        Giới hạn sử dụng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="usageLimit"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 1 })}
                        className={`admin-input ${formErrors.usageLimit ? 'admin-input-error' : ''}`}
                        min="1"
                      />
                      {formErrors.usageLimit && <p className="admin-error-text">{formErrors.usageLimit}</p>}
                    </div>

                    {/* Start & End Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startDate" className="admin-label">
                          Ngày bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="endDate" className="admin-label">
                          Ngày kết thúc <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                          className={`admin-input ${formErrors.endDate ? 'admin-input-error' : ''}`}
                        />
                        {formErrors.endDate && <p className="admin-error-text">{formErrors.endDate}</p>}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label htmlFor="status" className="admin-label">Trạng thái</label>
                      <select
                        id="status"
                        value={formData.status || 'ACTIVE'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'EXPIRED' })}
                        className="admin-input"
                      >
                        <option value="ACTIVE">Đang hoạt động</option>
                        <option value="INACTIVE">Tắt</option>
                        <option value="EXPIRED">Hết hạn</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" onClick={closeModal} className="admin-btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" disabled={loading} className="admin-btn-primary">
                    {loading ? 'Đang lưu...' : (editingPromotion ? 'Cập nhật' : 'Tạo mới')}
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

export default AdminPromotions;
