import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import categoryAdminService from '../../services/admin/categoryAdminService';
import type { CategoryResponse } from '../../services/admin/categoryAdminService';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('displayOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryAdminService.getAll(currentPage, 10, sortBy, sortDirection);
      
      // Apply client-side filters
      let filtered = data.content;
      
      if (searchTerm) {
        filtered = filtered.filter(cat => 
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (statusFilter !== 'all') {
        filtered = filtered.filter(cat => cat.status === statusFilter);
      }
      
      if (featuredFilter !== 'all') {
        const isFeatured = featuredFilter === 'featured';
        filtered = filtered.filter(cat => cat.isFeatured === isFeatured);
      }
      
      setCategories(filtered);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm, statusFilter, featuredFilter, sortBy, sortDirection]);

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h1>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Thêm danh mục
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Filters */}
        <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Tên danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
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
                <option value="Inactive">Tạm ngưng</option>
              </select>
            </div>

            {/* Featured Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nổi bật</label>
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tất cả</option>
                <option value="featured">Nổi bật</option>
                <option value="normal">Thường</option>
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
                <option value="displayOrder-asc">Thứ tự (A-Z)</option>
                <option value="displayOrder-desc">Thứ tự (Z-A)</option>
                <option value="name-asc">Tên (A-Z)</option>
                <option value="name-desc">Tên (Z-A)</option>
                <option value="createdAt-desc">Mới nhất</option>
                <option value="createdAt-asc">Cũ nhất</option>
              </select>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Tìm thấy <strong>{categories.length}</strong> danh mục</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setFeaturedFilter('all');
                setSortBy('displayOrder');
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
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
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
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  Chưa có danh mục nào
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {category.icon && <span className="mr-2 text-xl">{category.icon}</span>}
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      category.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.status === 'Active' ? 'Hoạt động' : 'Tạm ngưng'}
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

export default AdminCategories;

