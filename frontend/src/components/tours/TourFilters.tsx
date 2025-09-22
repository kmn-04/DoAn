import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

interface FilterState {
  search: string;
  category: string;
  priceMin: string;
  priceMax: string;
  duration: string;
  rating: string;
  sortBy: string;
  location: string;
  tourType: string;
  continent: string;
  country: string;
  visaRequired: boolean;
  flightIncluded: boolean;
}

interface TourFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  totalResults: number;
}

const categories = [
  { value: '', label: 'Tất cả danh mục' },
  { value: 'beach', label: 'Tour Biển' },
  { value: 'mountain', label: 'Tour Núi' },
  { value: 'city', label: 'Tour Thành Phố' },
  { value: 'culture', label: 'Tour Văn Hóa' },
  { value: 'adventure', label: 'Tour Mạo Hiểm' },
  { value: 'food', label: 'Tour Ẩm Thực' }
];

const continents = [
  { value: '', label: 'Tất cả châu lục' },
  { value: 'Asia', label: 'Châu Á' },
  { value: 'Europe', label: 'Châu Âu' },
  { value: 'America', label: 'Châu Mỹ' },
  { value: 'Africa', label: 'Châu Phi' },
  { value: 'Oceania', label: 'Châu Đại Dương' }
];

const countries = [
  // Asia
  { value: 'japan', label: 'Nhật Bản', continent: 'Asia' },
  { value: 'south-korea', label: 'Hàn Quốc', continent: 'Asia' },
  { value: 'thailand', label: 'Thái Lan', continent: 'Asia' },
  { value: 'singapore', label: 'Singapore', continent: 'Asia' },
  { value: 'malaysia', label: 'Malaysia', continent: 'Asia' },
  { value: 'indonesia', label: 'Indonesia', continent: 'Asia' },
  { value: 'china', label: 'Trung Quốc', continent: 'Asia' },
  // Europe
  { value: 'france', label: 'Pháp', continent: 'Europe' },
  { value: 'germany', label: 'Đức', continent: 'Europe' },
  { value: 'italy', label: 'Ý', continent: 'Europe' },
  { value: 'spain', label: 'Tây Ban Nha', continent: 'Europe' },
  { value: 'uk', label: 'Anh', continent: 'Europe' },
  // America
  { value: 'usa', label: 'Mỹ', continent: 'America' },
  { value: 'canada', label: 'Canada', continent: 'America' },
  { value: 'brazil', label: 'Brazil', continent: 'America' },
  // Oceania
  { value: 'australia', label: 'Úc', continent: 'Oceania' },
  { value: 'new-zealand', label: 'New Zealand', continent: 'Oceania' }
];

const durations = [
  { value: '', label: 'Tất cả thời gian' },
  { value: '1', label: '1 ngày' },
  { value: '2-3', label: '2-3 ngày' },
  { value: '4-7', label: '4-7 ngày' },
  { value: '8-14', label: '8-14 ngày' },
  { value: '15+', label: '15+ ngày' }
];

const locations = [
  { value: '', label: 'Tất cả địa điểm' },
  { value: 'ha-noi', label: 'Hà Nội' },
  { value: 'ho-chi-minh', label: 'TP. Hồ Chí Minh' },
  { value: 'da-nang', label: 'Đà Nẵng' },
  { value: 'quang-ninh', label: 'Quảng Ninh' },
  { value: 'lao-cai', label: 'Lào Cai' },
  { value: 'kien-giang', label: 'Kiên Giang' },
  { value: 'quang-nam', label: 'Quảng Nam' },
  { value: 'lam-dong', label: 'Lâm Đồng' }
];

const sortOptions = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'price-low', label: 'Giá thấp đến cao' },
  { value: 'price-high', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'duration', label: 'Thời gian ngắn nhất' }
];

const TourFilters: React.FC<TourFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    tourType: true,
    continent: true,
    country: true,
    price: true,
    duration: true,
    location: true,
    rating: true,
    services: true
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'sortBy' && value !== ''
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Bộ lọc tìm kiếm
            </h3>
            <span className="text-sm text-gray-500">
              {totalResults} kết quả
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
              Bộ lọc
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tour du lịch..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Sắp xếp theo:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters Content */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4 space-y-6">
          {/* Category Filter */}
          <div>
            <button
              onClick={() => toggleSection('category')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-medium text-gray-900">Danh mục</h4>
              <ChevronDownIcon 
                className={`h-4 w-4 transition-transform ${
                  expandedSections.category ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {expandedSections.category && (
              <div className="mt-3 space-y-2">
                {categories.map(category => (
                  <label key={category.value} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={filters.category === category.value}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Tour Type Filter */}
          <div>
            <button
              onClick={() => toggleSection('tourType')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-medium text-gray-900">Loại Tour</h4>
              <ChevronDownIcon 
                className={`h-4 w-4 transition-transform ${
                  expandedSections.tourType ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {expandedSections.tourType && (
              <div className="mt-3 space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tourType"
                    value=""
                    checked={filters.tourType === ''}
                    onChange={(e) => handleFilterChange('tourType', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tất cả</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tourType"
                    value="domestic"
                    checked={filters.tourType === 'domestic'}
                    onChange={(e) => handleFilterChange('tourType', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tour Trong Nước</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="tourType"
                    value="international"
                    checked={filters.tourType === 'international'}
                    onChange={(e) => handleFilterChange('tourType', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tour Quốc Tế</span>
                </label>
              </div>
            )}
          </div>

          {/* Continent Filter - only show for international tours */}
          {filters.tourType === 'international' && (
            <div>
              <button
                onClick={() => toggleSection('continent')}
                className="flex items-center justify-between w-full text-left"
              >
                <h4 className="font-medium text-gray-900">Châu Lục</h4>
                <ChevronDownIcon 
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.continent ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {expandedSections.continent && (
                <div className="mt-3">
                  <select
                    value={filters.continent}
                    onChange={(e) => handleFilterChange('continent', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {continents.map(continent => (
                      <option key={continent.value} value={continent.value}>
                        {continent.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Country Filter - only show for international tours */}
          {filters.tourType === 'international' && (
            <div>
              <button
                onClick={() => toggleSection('country')}
                className="flex items-center justify-between w-full text-left"
              >
                <h4 className="font-medium text-gray-900">Quốc Gia</h4>
                <ChevronDownIcon 
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.country ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {expandedSections.country && (
                <div className="mt-3">
                  <select
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả quốc gia</option>
                    {countries
                      .filter(country => !filters.continent || country.continent === filters.continent)
                      .map(country => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Price Range Filter */}
          <div>
            <button
              onClick={() => toggleSection('price')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-medium text-gray-900">Khoảng giá</h4>
              <ChevronDownIcon 
                className={`h-4 w-4 transition-transform ${
                  expandedSections.price ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {expandedSections.price && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Giá từ"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Giá đến"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Duration Filter */}
          <div>
            <button
              onClick={() => toggleSection('duration')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-medium text-gray-900">Thời gian</h4>
              <ChevronDownIcon 
                className={`h-4 w-4 transition-transform ${
                  expandedSections.duration ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {expandedSections.duration && (
              <div className="mt-3 space-y-2">
                {durations.map(duration => (
                  <label key={duration.value} className="flex items-center">
                    <input
                      type="radio"
                      name="duration"
                      value={duration.value}
                      checked={filters.duration === duration.value}
                      onChange={(e) => handleFilterChange('duration', e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{duration.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Location Filter */}
          <div>
            <button
              onClick={() => toggleSection('location')}
              className="flex items-center justify-between w-full text-left"
            >
              <h4 className="font-medium text-gray-900">Địa điểm</h4>
              <ChevronDownIcon 
                className={`h-4 w-4 transition-transform ${
                  expandedSections.location ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {expandedSections.location && (
              <div className="mt-3 space-y-2">
                {locations.map(location => (
                  <label key={location.value} className="flex items-center">
                    <input
                      type="radio"
                      name="location"
                      value={location.value}
                      checked={filters.location === location.value}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{location.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Rating Filter */}
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
                ].map(rating => (
                  <label key={rating.value} className="flex items-center">
                    <input
                      type="radio"
                      name="rating"
                      value={rating.value}
                      checked={filters.rating === rating.value}
                      onChange={(e) => handleFilterChange('rating', e.target.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{rating.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Services Filter - only show for international tours */}
          {filters.tourType === 'international' && (
            <div>
              <button
                onClick={() => toggleSection('services')}
                className="flex items-center justify-between w-full text-left"
              >
                <h4 className="font-medium text-gray-900">Dịch Vụ Bổ Sung</h4>
                <ChevronDownIcon 
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.services ? 'rotate-180' : ''
                  }`} 
                />
              </button>
              
              {expandedSections.services && (
                <div className="mt-3 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.flightIncluded}
                      onChange={(e) => onFiltersChange({ ...filters, flightIncluded: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Bao gồm vé máy bay</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.visaRequired === false}
                      onChange={(e) => onFiltersChange({ ...filters, visaRequired: e.target.checked ? false : undefined })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Không cần visa</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.visaRequired === true}
                      onChange={(e) => onFiltersChange({ ...filters, visaRequired: e.target.checked ? true : undefined })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Hỗ trợ làm visa</span>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourFilters;
