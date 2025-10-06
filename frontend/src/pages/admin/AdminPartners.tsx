import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  EyeIcon,
  PencilIcon, 
  TrashIcon, 
  BuildingOffice2Icon, 
  CheckCircleIcon, 
  XCircleIcon,
  PauseCircleIcon
} from '@heroicons/react/24/outline';
import { AxiosError } from 'axios';
import apiClient from '../../services/api';
import partnerAdminService from '../../services/admin/partnerAdminService';
import type { PartnerResponse } from '../../services/admin/partnerAdminService';
import Pagination from '../../components/ui/Pagination';
import ImageUpload from '../../components/admin/ImageUpload';

interface PartnerFormData {
  name: string;
  type: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  description: string;
  specialties: string;
  logo?: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

const AdminPartners: React.FC = () => {
  const [partners, setPartners] = useState<PartnerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    suspended: 0,
    inactive: 0
  });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerResponse | null>(null);
  const [viewingPartner, setViewingPartner] = useState<PartnerResponse | null>(null);
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    type: 'HOTEL',
    email: '',
    phone: '',
    address: '',
    website: '',
    description: '',
    specialties: '',
    logo: '',
    status: 'Active'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
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
    fetchPartners(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, statusFilter, typeFilter, sortBy, sortDirection]);

  const fetchGlobalStats = async () => {
    try {
      const [totalRes, activeRes, inactiveRes, suspendedRes] = await Promise.all([
        apiClient.get('/admin/partners/count'),
        apiClient.get('/admin/partners/count/active'),
        apiClient.get('/admin/partners/count/inactive'),
        apiClient.get('/admin/partners/count/suspended')
      ]);
      
      setStats({
        total: totalRes.data.data || 0,
        active: activeRes.data.data || 0,
        inactive: inactiveRes.data.data || 0,
        suspended: suspendedRes.data.data || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPartners = async (page: number) => {
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
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await apiClient.get(`/admin/partners?${params.toString()}`);
      
      setPartners(response.data.data?.content || []);
      setTotalPages(response.data.data?.totalPages || 0);
      setTotalElements(response.data.data?.totalElements || 0);
      
      // Backend already filtered, so totalElements is the accurate filtered count
      setFilteredCount(response.data.data?.totalElements || 0);
      
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPartner(null);
    setFormData({
      name: '',
      type: 'HOTEL',
      email: '',
      phone: '',
      address: '',
      website: '',
      description: '',
      specialties: '',
      logo: '',
      status: 'Active'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (partner: PartnerResponse) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      type: partner.type,
      email: partner.email || '',
      phone: partner.phone || '',
      address: partner.address || '',
      website: partner.website || '',
      description: partner.description || '',
      specialties: partner.specialties || '',
      logo: partner.logo || '',
      status: partner.status
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openViewModal = (partner: PartnerResponse) => {
    setViewingPartner(partner);
    setIsViewModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setEditingPartner(null);
    setViewingPartner(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên đối tác là bắt buộc';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Số điện thoại phải có 10-11 chữ số';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (editingPartner) {
        await partnerAdminService.updatePartner(editingPartner.id, formData);
      } else {
        await partnerAdminService.createPartner(formData);
      }
      
      closeModal();
      await fetchPartners(currentPage);
    } catch (error) {
      console.error('Error saving partner:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (deleteConfirmId === id) {
      try {
        setLoading(true);
        await partnerAdminService.deletePartner(id);
        setDeleteConfirmId(null);
        await fetchPartners(currentPage);
      } catch (error) {
        console.error('Error deleting partner:', error);
        const axiosError = error as AxiosError<{ message?: string }>;
        alert(axiosError.response?.data?.message || 'Không thể xóa đối tác');
      } finally {
        setLoading(false);
      }
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'Active' | 'Inactive' | 'Suspended') => {
    try {
      setLoading(true);
      await apiClient.patch(`/admin/partners/${id}/status?status=${newStatus}`);
      await fetchPartners(currentPage);
    } catch (error) {
      console.error('Error updating status:', error);
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClassName = (status: string) => {
    switch (status) {
      case 'Active':
        return 'admin-table-select-active';
      case 'Suspended':
        return 'admin-table-select-suspended';
      case 'Inactive':
        return 'admin-table-select-inactive';
      default:
        return 'admin-table-select-inactive';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Quản lý đối tác</h1>
          <button onClick={openCreateModal} className="admin-btn-primary">
            <PlusIcon className="h-5 w-5" />
            Thêm đối tác
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="admin-stat-label">Tổng đối tác</p>
                <p className="admin-stat-value">{stats.total}</p>
              </div>
              <div className="admin-stat-icon bg-blue-100">
                <BuildingOffice2Icon className="h-6 w-6 text-blue-600" />
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
                <p className="admin-stat-label">Tạm ngừng</p>
                <p className="admin-stat-value">{stats.suspended}</p>
              </div>
              <div className="admin-stat-icon bg-yellow-100">
                <PauseCircleIcon className="h-6 w-6 text-yellow-600" />
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
        </div>

        {/* Filters */}
        <div className="admin-filter-container">
          {/* Filter Result Label */}
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
            <div className="mb-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                🔍 Tìm thấy <span className="font-bold">{filteredCount}</span> đối tác
              </p>
            </div>
          )}
          
          <div className="admin-filter-grid">
            <div>
              <label className="admin-label">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tìm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="admin-label">Loại đối tác</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="admin-select"
              >
                <option value="all">Tất cả</option>
                <option value="HOTEL">Khách sạn</option>
                <option value="RESTAURANT">Nhà hàng</option>
                <option value="TRANSPORT">Vận chuyển</option>
                <option value="TOUR_OPERATOR">Điều hành tour</option>
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
                <option value="Active">Hoạt động</option>
                <option value="Suspended">Tạm ngừng</option>
                <option value="Inactive">Ngừng hoạt động</option>
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
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
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
                <th className="admin-table-th">Tên đối tác</th>
                <th className="admin-table-th">Loại</th>
                <th className="admin-table-th">Email</th>
                <th className="admin-table-th">Điện thoại</th>
                <th className="admin-table-th">Trạng thái</th>
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
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner.id} className="admin-table-row">
                    <td className="admin-table-td">{partner.id}</td>
                    <td className="admin-table-td font-medium">{partner.name}</td>
                    <td className="admin-table-td">
                      <span className="admin-badge-blue">
                        {(partner.type === 'HOTEL' || partner.type === 'Hotel') && 'Khách sạn'}
                        {(partner.type === 'RESTAURANT' || partner.type === 'Restaurant') && 'Nhà hàng'}
                        {(partner.type === 'TRANSPORT' || partner.type === 'Transport') && 'Vận chuyển'}
                        {(partner.type === 'TOUR_OPERATOR' || partner.type === 'TourOperator') && 'Điều hành tour'}
                        {(partner.type === 'INSURANCE' || partner.type === 'Insurance') && 'Bảo hiểm'}
                        {(partner.type === 'OTHER' || partner.type === 'Other') && 'Khác'}
                      </span>
                    </td>
                    <td className="admin-table-td text-sm">{partner.email}</td>
                    <td className="admin-table-td text-sm">{partner.phone}</td>
                    <td className="admin-table-td">
                      <select
                        value={partner.status}
                        onChange={(e) => handleStatusChange(partner.id, e.target.value as 'Active' | 'Inactive' | 'Suspended')}
                        className={getStatusClassName(partner.status)}
                        disabled={loading}
                      >
                        <option value="Active">Hoạt động</option>
                        <option value="Suspended">Tạm ngừng</option>
                        <option value="Inactive">Ngừng hoạt động</option>
                      </select>
                    </td>
                    <td className="admin-table-td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openViewModal(partner)}
                          className="admin-icon-btn-view"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(partner)}
                          className="admin-icon-btn-edit"
                          title="Chỉnh sửa"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className={
                            deleteConfirmId === partner.id
                              ? 'admin-icon-btn-delete-confirm'
                              : 'admin-icon-btn-delete'
                          }
                          title={deleteConfirmId === partner.id ? 'Click lại để xác nhận' : 'Xóa'}
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
            Hiển thị {partners.length} / {totalElements} đối tác
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* View Modal */}
      {isViewModalOpen && viewingPartner && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-backdrop" onClick={closeModal} />
          <div className="admin-modal-container">
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">Chi tiết đối tác</h3>
              </div>
              <div className="admin-modal-body">
                <div className="space-y-6">
                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin cơ bản</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">ID</p>
                        <p className="admin-view-value">{viewingPartner.id}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Tên đối tác</p>
                        <p className="admin-view-value">{viewingPartner.name}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Loại</p>
                        <p className="admin-view-value">
                          <span className="admin-badge-blue">
                            {viewingPartner.type === 'HOTEL' && 'Khách sạn'}
                            {viewingPartner.type === 'RESTAURANT' && 'Nhà hàng'}
                            {viewingPartner.type === 'TRANSPORT' && 'Vận chuyển'}
                            {viewingPartner.type === 'TOUR_OPERATOR' && 'Điều hành tour'}
                          </span>
                        </p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Trạng thái</p>
                        <p className="admin-view-value">
                          <span className={
                            viewingPartner.status === 'Active' ? 'admin-badge-green' :
                            viewingPartner.status === 'Suspended' ? 'admin-badge-yellow' :
                            'admin-badge-gray'
                          }>
                            {viewingPartner.status === 'Active' ? 'Hoạt động' :
                             viewingPartner.status === 'Suspended' ? 'Tạm ngừng' :
                             'Ngừng hoạt động'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Thông tin liên hệ</h4>
                    <div className="admin-view-grid">
                      <div className="admin-view-item">
                        <p className="admin-view-label">Email</p>
                        <p className="admin-view-value">{viewingPartner.email}</p>
                      </div>
                      <div className="admin-view-item">
                        <p className="admin-view-label">Điện thoại</p>
                        <p className="admin-view-value">{viewingPartner.phone}</p>
                      </div>
                      <div className="admin-view-item col-span-2">
                        <p className="admin-view-label">Địa chỉ</p>
                        <p className="admin-view-value">{viewingPartner.address || 'Chưa cập nhật'}</p>
                      </div>
                      <div className="admin-view-item col-span-2">
                        <p className="admin-view-label">Website</p>
                        <p className="admin-view-value">
                          {viewingPartner.website ? (
                            <a href={viewingPartner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {viewingPartner.website}
                            </a>
                          ) : 'Chưa cập nhật'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-view-section">
                    <h4 className="admin-view-section-title">Mô tả & Chuyên môn</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="admin-view-label">Mô tả</p>
                        <p className="admin-view-value">{viewingPartner.description || 'Chưa có mô tả'}</p>
                      </div>
                      <div>
                        <p className="admin-view-label">Chuyên môn</p>
                        <p className="admin-view-value">{viewingPartner.specialties || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button onClick={closeModal} className="admin-btn-secondary">
                  Đóng
                </button>
                <button onClick={() => { closeModal(); openEditModal(viewingPartner); }} className="admin-btn-primary">
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
                  {editingPartner ? 'Chỉnh sửa đối tác' : 'Thêm đối tác mới'}
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="admin-modal-body">
                  <div className="space-y-5">
                    {/* Name & Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="admin-label">
                          Tên đối tác <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`admin-input ${formErrors.name ? 'admin-input-error' : ''}`}
                          placeholder="Nhập tên đối tác"
                        />
                        {formErrors.name && <p className="admin-error-text">{formErrors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="type" className="admin-label">
                          Loại đối tác <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="type"
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="admin-select"
                        >
                          <option value="HOTEL">Khách sạn</option>
                          <option value="RESTAURANT">Nhà hàng</option>
                          <option value="TRANSPORT">Vận chuyển</option>
                          <option value="TOUR_OPERATOR">Điều hành tour</option>
                        </select>
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="admin-label">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`admin-input ${formErrors.email ? 'admin-input-error' : ''}`}
                          placeholder="partner@example.com"
                        />
                        {formErrors.email && <p className="admin-error-text">{formErrors.email}</p>}
                      </div>
                      <div>
                        <label htmlFor="phone" className="admin-label">
                          Điện thoại <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`admin-input ${formErrors.phone ? 'admin-input-error' : ''}`}
                          placeholder="0123456789"
                        />
                        {formErrors.phone && <p className="admin-error-text">{formErrors.phone}</p>}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label htmlFor="address" className="admin-label">Địa chỉ</label>
                      <input
                        type="text"
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="admin-input"
                        placeholder="Nhập địa chỉ"
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <label htmlFor="website" className="admin-label">Website</label>
                      <input
                        type="url"
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="admin-input"
                        placeholder="https://example.com"
                      />
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
                        placeholder="Mô tả về đối tác"
                      />
                    </div>

                    {/* Specialties */}
                    <div>
                      <label htmlFor="specialties" className="admin-label">Chuyên môn</label>
                      <textarea
                        id="specialties"
                        rows={2}
                        value={formData.specialties}
                        onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                        className="admin-textarea"
                        placeholder="Ví dụ: Resort 5 sao, Nhà hàng hải sản..."
                      />
                    </div>

                    {/* Logo Upload */}
                    <div className="border-t pt-4">
                      <ImageUpload
                        label="🏢 Logo đối tác"
                        value={formData.logo}
                        onChange={(url) => setFormData({ ...formData, logo: url as string })}
                        multiple={false}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label htmlFor="status" className="admin-label">Trạng thái</label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' | 'Suspended' })}
                        className="admin-select"
                      >
                        <option value="Active">Hoạt động</option>
                        <option value="Suspended">Tạm ngừng</option>
                        <option value="Inactive">Ngừng hoạt động</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="admin-modal-footer">
                  <button type="button" onClick={closeModal} className="admin-btn-secondary">
                    Hủy
                  </button>
                  <button type="submit" disabled={loading} className="admin-btn-primary">
                    {loading ? 'Đang lưu...' : (editingPartner ? 'Cập nhật' : 'Tạo mới')}
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

export default AdminPartners;
