import React, { useEffect, useState } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  TagIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiClient } from '../../services/api';

interface Promotion {
  id: number;
  code: string;
  name: string;
  description: string;
  type: string;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchPromotions = async (page = 0) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/promotions?page=${page}&size=10&sortBy=${sortBy}&sortDir=${sortDir}`);
      
      let filtered = response.data.data.content;
      
      // Apply filters
      if (searchTerm) {
        filtered = filtered.filter((p: Promotion) => 
          p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (typeFilter !== 'all') {
        filtered = filtered.filter((p: Promotion) => p.type === typeFilter);
      }
      
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          filtered = filtered.filter((p: Promotion) => p.active);
        } else {
          filtered = filtered.filter((p: Promotion) => !p.active);
        }
      }
      
      if (dateFilter !== 'all') {
        const now = new Date();
        filtered = filtered.filter((p: Promotion) => {
          const endDate = new Date(p.endDate);
          if (dateFilter === 'active') {
            return endDate >= now;
          } else if (dateFilter === 'expired') {
            return endDate < now;
          }
          return true;
        });
      }
      
      setPromotions(filtered);
      setTotalPages(response.data.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions(0);
  }, [searchTerm, typeFilter, statusFilter, dateFilter, sortBy, sortDir]);

  const handleToggleActive = async (promotionId: number) => {
    try {
      await apiClient.put(`/admin/promotions/${promotionId}/toggle`);
      fetchPromotions(currentPage);
    } catch (error) {
      console.error('Error toggling promotion status:', error);
      alert('Failed to update promotion status');
    }
  };

  const handleDelete = async (promotionId: number) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    try {
      await apiClient.delete(`/admin/promotions/${promotionId}`);
      fetchPromotions(currentPage);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert('Failed to delete promotion');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDiscount = (type: string, value: number) => {
    if (type === 'PERCENTAGE') {
      return `${value}%`;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Khuyến mãi</h1>
          <Button className="flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Thêm Khuyến mãi
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Mã, tên khuyến mãi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="Percentage">Phần trăm</option>
              <option value="Fixed">Cố định</option>
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
              <option value="active">Hoạt động</option>
              <option value="inactive">Tạm dừng</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Còn hạn</option>
              <option value="expired">Hết hạn</option>
            </select>
          </div>
        </div>

        {/* Sort row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field);
                setSortDir(direction as 'asc' | 'desc');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="id-desc">Mới nhất</option>
              <option value="id-asc">Cũ nhất</option>
              <option value="code-asc">Mã (A-Z)</option>
              <option value="code-desc">Mã (Z-A)</option>
              <option value="value-desc">Giá trị cao</option>
              <option value="value-asc">Giá trị thấp</option>
              <option value="endDate-asc">Sắp hết hạn</option>
              <option value="endDate-desc">Còn hạn lâu</option>
            </select>
          </div>

          {/* Reset */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
                setDateFilter('all');
                setSortBy('id');
                setSortDir('desc');
              }}
              className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-500 rounded-md"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 text-sm text-gray-500">
          <span>Tìm thấy <strong>{promotions.length}</strong> khuyến mãi</span>
        </div>
      </Card>

      {/* Promotions table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : promotions.length > 0 ? (
                promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TagIcon className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{promo.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{promo.name}</div>
                      <div className="text-sm text-gray-500">{promo.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDiscount(promo.type, promo.value)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {promo.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promo.usedCount} / {promo.usageLimit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <div>
                          <div>{formatDate(promo.startDate)}</div>
                          <div>to {formatDate(promo.endDate)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(promo.id)}
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          promo.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {promo.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                    No promotions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPromotions(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPromotions(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
};

export default AdminPromotions;

