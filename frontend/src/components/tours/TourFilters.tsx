import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { countryService, categoryService, tourService } from '../../services';
import type { CategoryResponse } from '../../services';

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

// Categories will be fetched from API

const TOUR_TYPES = [
  { value: '', label: 'Tất cả loại tour' },
  { value: 'domestic', label: 'Trong nước' },
  { value: 'international', label: 'Quốc tế' }
];

const PRICE_RANGES = [
  { value: '', label: 'Tất cả mức giá', min: '', max: '' },
  { value: '0-2000000', label: 'Dưới 2 triệu', min: '0', max: '2000000' },
  { value: '2000000-5000000', label: '2-5 triệu', min: '2000000', max: '5000000' },
  { value: '5000000-10000000', label: '5-10 triệu', min: '5000000', max: '10000000' },
  { value: '10000000-20000000', label: '10-20 triệu', min: '10000000', max: '20000000' },
  { value: '20000000-', label: 'Trên 20 triệu', min: '20000000', max: '' }
];

const DURATIONS = [
  { value: '', label: 'Tất cả thời gian' },
  { value: '1', label: '1 ngày' },
  { value: '2-3', label: '2-3 ngày' },
  { value: '4-7', label: '4-7 ngày' },
  { value: '8-14', label: '8-14 ngày' },
  { value: '15+', label: '15+ ngày' }
];

const RATINGS = [
  { value: '', label: 'Tất cả đánh giá' },
  { value: '4.5', label: '4.5⭐ trở lên' },
  { value: '4.0', label: '4⭐ trở lên' },
  { value: '3.5', label: '3.5⭐ trở lên' },
  { value: '3.0', label: '3⭐ trở lên' }
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-low', label: 'Giá thấp nhất' },
  { value: 'price-high', label: 'Giá cao nhất' }
];

const TourFilters: React.FC<TourFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults
}) => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [locations, setLocations] = useState<{ value: string; label: string }[]>([
    { value: '', label: 'Tất cả địa điểm' }
  ]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoryService.getAllCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Get categories based on tour type
  const getCategoriesForTourType = (tourType: string) => {
    const defaultOption = { value: '', label: 'Tất cả danh mục' };
    
    if (!categories.length) return [defaultOption];
    
    // Filter categories based on tour type if needed
    // For now, return all categories
    const categoryOptions = categories.map(cat => ({
      value: cat.slug,
      label: cat.name
    }));
    
    return [defaultOption, ...categoryOptions];
  };
  
  // Get locations based on tour type
  const getLocationsForTourType = (tourType: string) => {
    // Define domestic and international keywords for filtering
    const domesticKeywords = ['việt', 'hà nội', 'sài gòn', 'hồ chí minh', 'đà nẵng', 'quảng', 'lào cai', 'kiên giang', 'lâm đồng', 'khánh hòa', 'bình', 'phú quốc', 'sapa', 'hạ long', 'hội an', 'đà lạt', 'nha trang', 'vũng tàu', 'huế', 'cần thơ', 'miền', 'nam', 'bắc', 'trung'];
    const internationalKeywords = ['nhật', 'hàn', 'thái', 'singapore', 'malaysia', 'ấn độ', 'trung quốc', 'pháp', 'ý', 'tây ban nha', 'anh', 'mỹ', 'úc', 'dubai', 'hàn quốc', 'nhật bản'];
    
    if (tourType === 'domestic') {
      // Filter to show only Vietnamese locations
      const filtered = locations.filter(loc => {
        if (loc.value === '') return true;
        const lowerValue = loc.value.toLowerCase();
        // Include if contains any domestic keyword OR doesn't contain international keywords
        return domesticKeywords.some(kw => lowerValue.includes(kw)) || 
               !internationalKeywords.some(kw => lowerValue.includes(kw));
      });
      return filtered.length > 1 ? filtered : [{ value: '', label: 'Tất cả địa điểm' }];
    } else if (tourType === 'international') {
      // Filter to show only international countries
      const filtered = locations.filter(loc => {
        if (loc.value === '') return true;
        const lowerValue = loc.value.toLowerCase();
        // Include if contains any international keyword
        return internationalKeywords.some(kw => lowerValue.includes(kw));
      });
      return filtered.length > 1 ? filtered : [{ value: '', label: 'Tất cả địa điểm' }];
    }
    
    // Show all locations if no tour type selected
    return locations;
  };

  // Handle filter change with smart logic
  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    
    // Reset category and location if tour type changes
    if (key === 'tourType') {
      const validCategories = getCategoriesForTourType(value as string);
      const currentCategoryValid = validCategories.some(cat => cat.value === filters.category);
      if (!currentCategoryValid && filters.category) {
        newFilters.category = '';
      }
      
      // Reset location if it's not valid for new tour type
      const validLocations = getLocationsForTourType(value as string);
      const currentLocationValid = validLocations.some(loc => loc.value === filters.location);
      if (!currentLocationValid && filters.location) {
        newFilters.location = '';
      }
    }
    
    onFiltersChange(newFilters);
  };

  // Handle price range change
  const handlePriceRangeChange = (value: string) => {
    const range = PRICE_RANGES.find(r => r.value === value);
    if (range) {
      onFiltersChange({
        ...filters,
        priceMin: range.min,
        priceMax: range.max
      });
    }
  };

  // Get current price range
  const getCurrentPriceRange = () => {
    const { priceMin, priceMax } = filters;
    if (!priceMin && !priceMax) return '';
    
    const range = PRICE_RANGES.find(r => r.min === priceMin && r.max === priceMax);
    return range ? range.value : '';
  };

  // Check if has active filters
  const hasActiveFilters = () => {
    return filters.search || filters.category || filters.tourType || filters.priceMin || 
           filters.priceMax || filters.duration || filters.location || filters.rating ||
           filters.flightIncluded;
  };

  // Fetch locations from tours in CSDL
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Get unique locations from tours table
        const locationsData = await tourService.getUniqueLocations();
        const locationOptions = locationsData.map(loc => ({
          value: loc,
          label: loc
        }));
        
        setLocations([
          { value: '', label: 'Tất cả địa điểm' },
          ...locationOptions
        ]);
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);


  return (
    <div className="bg-white rounded-none shadow-lg border border-stone-200">
      {/* Filters Bar */}
      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm tour..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-stone-300 rounded-none focus:ring-1 focus:border-slate-700 text-sm font-normal tracking-wide transition-all"
              style={{ '--focus-ring-color': '#D4AF37' } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Filter Dropdowns - Horizontal layout with scroll */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-stone-100">
          {/* Tour Type */}
          <div className="flex-shrink-0 min-w-[160px]">
            <select
              value={filters.tourType}
              onChange={(e) => handleFilterChange('tourType', e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-none text-sm focus:ring-1 focus:border-slate-700 bg-white font-normal tracking-wide transition-all"
            >
              {TOUR_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Category - Dynamic */}
          <div className="flex-shrink-0 min-w-[180px]">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-none text-sm focus:ring-1 focus:border-slate-700 bg-white font-normal tracking-wide transition-all"
            >
              {getCategoriesForTourType(filters.tourType).map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex-shrink-0 min-w-[160px]">
            <select
              value={getCurrentPriceRange()}
              onChange={(e) => handlePriceRangeChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-none text-sm focus:ring-1 focus:border-slate-700 bg-white font-normal tracking-wide transition-all"
            >
              {PRICE_RANGES.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="flex-shrink-0 min-w-[150px]">
            <select
              value={filters.duration}
              onChange={(e) => handleFilterChange('duration', e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-none text-sm focus:ring-1 focus:border-slate-700 bg-white font-normal tracking-wide transition-all"
            >
              {DURATIONS.map(duration => (
                <option key={duration.value} value={duration.value}>{duration.label}</option>
              ))}
            </select>
          </div>

          {/* Location - Dynamic based on tour type */}
          <div className="flex-shrink-0 min-w-[160px]">
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-none text-sm focus:ring-1 focus:border-slate-700 bg-white font-normal tracking-wide transition-all"
            >
              {getLocationsForTourType(filters.tourType).map(location => (
                <option key={location.value} value={location.value}>{location.label}</option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div className="flex-shrink-0 min-w-[140px]">
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-none text-sm focus:ring-1 focus:border-slate-700 bg-white font-normal tracking-wide transition-all"
            >
              {RATINGS.map(rating => (
                <option key={rating.value} value={rating.value}>{rating.label}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex-shrink-0 min-w-[160px]">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-none text-sm focus:ring-1 focus:border-slate-700 bg-white font-normal tracking-wide transition-all"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Flight Included - for international */}
          {filters.tourType === 'international' && (
            <div className="flex-shrink-0 min-w-[140px]">
              <label className="flex items-center px-4 py-2.5 border border-stone-300 rounded-none bg-white cursor-pointer hover:bg-stone-50 h-full transition-colors">
                <input
                  type="checkbox"
                  checked={filters.flightIncluded}
                  onChange={(e) => handleFilterChange('flightIncluded', e.target.checked)}
                  className="h-4 w-4 text-slate-900 focus:ring-1 border-stone-300 rounded-none mr-2"
                  style={{ accentColor: '#D4AF37' }}
                />
                <span className="text-sm text-slate-700 whitespace-nowrap font-normal">✈️ Vé máy bay</span>
              </label>
            </div>
          )}
        </div>

        {/* Results and Clear */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
            <span className="text-sm text-gray-600 font-normal">
              <span className="font-medium text-slate-900">{totalResults}</span> kết quả
            </span>
          </div>
          
          {hasActiveFilters() && (
            <button
              onClick={onClearFilters}
              className="flex items-center px-4 py-2 text-slate-700 border border-stone-300 rounded-none hover:bg-stone-50 transition-all text-xs font-medium tracking-wider uppercase"
            >
              <XMarkIcon className="h-4 w-4 mr-1.5" />
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourFilters;
