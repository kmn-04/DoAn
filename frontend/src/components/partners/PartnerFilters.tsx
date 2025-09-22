import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  TagIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  StarIcon,
  ChevronDownIcon
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
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    specialty: true,
    location: true,
    sort: true,
    rating: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
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
    { value: 'rating-desc', label: 'Đánh giá cao đến thấp' },
    { value: 'totalTours', label: 'Nhiều tour nhất' },
    { value: 'establishedYear', label: 'Lâu đời nhất' }
  ];

  const hasActiveFilters = filters.search || 
    (filters.specialties && filters.specialties.length > 0) || 
    (filters.locations && filters.locations.length > 0) || 
    filters.rating;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Bộ lọc tìm kiếm
        </h3>
        {hasActiveFilters && (
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

      <div className="space-y-6">
        {/* Search */}
        <div>
          <button
            onClick={() => toggleSection('search')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Tìm kiếm</h4>
            <ChevronDownIcon 
              className={`h-4 w-4 transition-transform ${
                expandedSections.search ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.search && (
            <div className="mt-3">
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
          )}
        </div>

        {/* Specialty */}
        <div>
          <button
            onClick={() => toggleSection('specialty')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Chuyên môn</h4>
            <ChevronDownIcon 
              className={`h-4 w-4 transition-transform ${
                expandedSections.specialty ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.specialty && (
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
              {specialties.map((specialty) => (
                <label key={specialty} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.specialties?.includes(specialty) || false}
                    onChange={(e) => {
                      const currentSpecialties = filters.specialties || [];
                      if (e.target.checked) {
                        onFiltersChange({ 
                          ...filters, 
                          specialties: [...currentSpecialties, specialty] 
                        });
                      } else {
                        onFiltersChange({ 
                          ...filters, 
                          specialties: currentSpecialties.filter(s => s !== specialty) 
                        });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <button
            onClick={() => toggleSection('location')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Khu vực</h4>
            <ChevronDownIcon 
              className={`h-4 w-4 transition-transform ${
                expandedSections.location ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.location && (
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
              {locations.map((location) => (
                <label key={location} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.locations?.includes(location) || false}
                    onChange={(e) => {
                      const currentLocations = filters.locations || [];
                      if (e.target.checked) {
                        onFiltersChange({ 
                          ...filters, 
                          locations: [...currentLocations, location] 
                        });
                      } else {
                        onFiltersChange({ 
                          ...filters, 
                          locations: currentLocations.filter(l => l !== location) 
                        });
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{location}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sort */}
        <div>
          <button
            onClick={() => toggleSection('sort')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Sắp xếp theo</h4>
            <ChevronDownIcon 
              className={`h-4 w-4 transition-transform ${
                expandedSections.sort ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.sort && (
            <div className="mt-3">
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
          )}
        </div>

        {/* Rating */}
        <div>
          <button
            onClick={() => toggleSection('rating')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">Đánh giá</h4>
            <ChevronDownIcon 
              className={`h-4 w-4 transition-transform ${
                expandedSections.rating ? 'rotate-180' : ''
              }`} 
            />
          </button>
          
          {expandedSections.rating && (
            <div className="mt-3 space-y-2">
              {[
                { value: '4.5', label: '4.5+ sao' },
                { value: '4.0', label: '4.0+ sao' },
                { value: '3.5', label: '3.5+ sao' },
                { value: '3.0', label: '3.0+ sao' },
                { value: '', label: 'Tất cả đánh giá' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="rating"
                    value={option.value}
                    checked={filters.rating?.toString() === option.value}
                    onChange={(e) => onFiltersChange({ 
                      ...filters, 
                      rating: e.target.value ? parseFloat(e.target.value) : undefined 
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PartnerFilters;
