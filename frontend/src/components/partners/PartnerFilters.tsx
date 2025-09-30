import React from 'react';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import type { PartnerFilters as PartnerFiltersType } from '../../types';

interface PartnerFiltersProps {
  filters: PartnerFiltersType;
  onFiltersChange: (filters: PartnerFiltersType) => void;
  onClearFilters: () => void;
  totalResults?: number;
}

const PARTNER_TYPES = [
  { value: '', label: 'Tất cả loại' },
  { value: 'Hotel', label: 'Khách sạn' },
  { value: 'Restaurant', label: 'Nhà hàng' }
];

const LOCATIONS = [
  { value: '', label: 'Tất cả khu vực' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'TP.HCM', label: 'TP. Hồ Chí Minh' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Phú Quốc', label: 'Phú Quốc' }
];

const RATINGS = [
  { value: '', label: 'Tất cả đánh giá' },
  { value: '4.5', label: '4.5⭐ trở lên' },
  { value: '4.0', label: '4⭐ trở lên' },
  { value: '3.5', label: '3.5⭐ trở lên' },
  { value: '3.0', label: '3⭐ trở lên' }
];

const SORT_OPTIONS = [
  { value: 'name-asc', label: 'Tên A-Z' },
  { value: 'name-desc', label: 'Tên Z-A' },
  { value: 'rating-desc', label: 'Đánh giá cao nhất' },
  { value: 'totalTours-desc', label: 'Nhiều tour nhất' },
  { value: 'establishedYear-asc', label: 'Lâu đời nhất' }
];

const PartnerFilters: React.FC<PartnerFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults = 0
}) => {
  const handleFilterChange = (key: keyof PartnerFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = () => {
    return filters.search || filters.type || filters.location || filters.rating;
  };

  // Parse sort value (e.g., "rating-desc" -> sortBy="rating", sortOrder="desc")
  const getCurrentSortValue = () => {
    const sortBy = filters.sortBy || 'name';
    const sortOrder = filters.sortOrder || 'asc';
    return `${sortBy}-${sortOrder}`;
  };

  const handleSortChange = (value: string) => {
    if (!value) {
      onFiltersChange({ ...filters, sortBy: 'name', sortOrder: 'asc' });
      return;
    }
    const [sortBy, sortOrder] = value.split('-');
    onFiltersChange({ 
      ...filters, 
      sortBy: sortBy as PartnerFiltersType['sortBy'],
      sortOrder: sortOrder as PartnerFiltersType['sortOrder']
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đối tác..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Filter Dropdowns - Compact layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {/* Partner Type */}
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {PARTNER_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Location */}
          <select
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {LOCATIONS.map(location => (
              <option key={location.value} value={location.value}>{location.label}</option>
            ))}
          </select>

          {/* Rating */}
          <select
            value={filters.rating?.toString() || ''}
            onChange={(e) => handleFilterChange('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {RATINGS.map(rating => (
              <option key={rating.value} value={rating.value}>{rating.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={getCurrentSortValue()}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Results and Clear Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{totalResults}</span> kết quả
            </span>
          </div>
          
          {hasActiveFilters() && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerFilters;
