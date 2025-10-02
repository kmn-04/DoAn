import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import partnerAdminService from '../../services/admin/partnerAdminService';
import type { PartnerResponse } from '../../services/admin/partnerAdminService';

const AdminPartners: React.FC = () => {
  const [partners, setPartners] = useState<PartnerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await partnerAdminService.getAll(currentPage, 10, sortBy, sortDirection);
      
      // Apply filters
      let filtered = data.content;
      
      if (searchTerm) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.address?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (typeFilter !== 'all') {
        filtered = filtered.filter(p => p.type === typeFilter);
      }
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === statusFilter);
      }
      
      setPartners(filtered);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [currentPage, searchTerm, typeFilter, statusFilter, sortBy, sortDirection]);

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đối tác</h1>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Thêm đối tác
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tên, email, địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại đối tác</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="Hotel">Khách sạn</option>
                <option value="Restaurant">Nhà hàng</option>
                <option value="Transport">Vận chuyển</option>
                <option value="TourOperator">Điều hành tour</option>
                <option value="Insurance">Bảo hiểm</option>
                <option value="Other">Khác</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Tạm dừng</option>
                <option value="Suspended">Ngưng</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
              <select
                value={`${sortBy}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortBy(field);
                  setSortDirection(direction as 'asc' | 'desc');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name-asc">Tên (A-Z)</option>
                <option value="name-desc">Tên (Z-A)</option>
                <option value="createdAt-desc">Mới nhất</option>
                <option value="createdAt-asc">Cũ nhất</option>
              </select>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Tìm thấy <strong>{partners.length}</strong> đối tác</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
                setSortBy('name');
                setSortDirection('asc');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên đối tác
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Điện thoại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Địa chỉ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : partners.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  <div className="flex flex-col items-center py-8">
                    <BuildingOffice2Icon className="h-12 w-12 text-gray-400 mb-3" />
                    <p>Chưa có đối tác nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              partners.map((partner) => (
                <tr key={partner.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                    <div className="text-sm text-gray-500">{partner.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner.phone || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {partner.address || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        partner.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : partner.status === 'Suspended'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {partner.status === 'Active' ? 'Hoạt động' : partner.status === 'Suspended' ? 'Tạm dừng' : 'Ngừng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPartners;

