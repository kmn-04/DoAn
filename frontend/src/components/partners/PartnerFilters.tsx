import React from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Card } from '../ui';
import type { PartnerFilters as PartnerFiltersType } from '../../types';

interface PartnerFiltersProps {
  filters: PartnerFiltersType;
  onFiltersChange: (filters: PartnerFiltersType) => void;
  onClearFilters: () => void;
}

const PartnerFilters: React.FC<PartnerFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const specialties = [
    'Du lịch biển',
    'Du lịch núi',
    'Du lịch văn hóa',
    'Du lịch sinh thái',
    'Du lịch phiêu lưu',
    'Du lịch gia đình',
    'Du lịch luxury',
    'Du lịch budget'
  ];

  const locations = [
    'Hà Nội',
    'TP. Hồ Chí Minh',
    'Đà Nẵng',
    'Nha Trang',
    'Phú Quốc',
    'Hạ Long',
    'Sapa',
    'Đà Lạt'
  ];

  const sortOptions = [
    { value: 'name', label: 'Tên A-Z' },
    { value: 'rating', label: 'Đánh giá cao nhất' },
    { value: 'totalTours', label: 'Nhiều tour nhất' },
    { value: 'establishedYear', label: 'Lâu đời nhất' }
  ];

  const hasActiveFilters = filters.search || filters.specialty || filters.rating || filters.location;

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FunnelIcon className="h-5 w-5 mr-2" />
          Bộ lọc tìm kiếm
        </h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tìm kiếm
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Tên đối tác..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Specialty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chuyên môn
          </label>
          <select
            value={filters.specialty || ''}
            onChange={(e) => onFiltersChange({ ...filters, specialty: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả chuyên môn</option>
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khu vực
          </label>
          <select
            value={filters.location || ''}
            onChange={(e) => onFiltersChange({ ...filters, location: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả khu vực</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sắp xếp theo
          </label>
          <select
            value={filters.sortBy || 'name'}
            onChange={(e) => onFiltersChange({ 
              ...filters, 
              sortBy: e.target.value as PartnerFiltersType['sortBy']
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Đánh giá tối thiểu
        </label>
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4, 5].map((rating) => (
            <label key={rating} className="flex items-center">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.rating === rating}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  rating: parseInt(e.target.value) 
                })}
                className="mr-1"
              />
              <span className="text-sm">
                {rating}+ ⭐
              </span>
            </label>
          ))}
          <label className="flex items-center">
            <input
              type="radio"
              name="rating"
              value=""
              checked={!filters.rating}
              onChange={() => onFiltersChange({ ...filters, rating: undefined })}
              className="mr-1"
            />
            <span className="text-sm">Tất cả</span>
          </label>
        </div>
      </div>
    </Card>
  );
};

export default PartnerFilters;
