import React, { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { categoryService, tourService } from '../../services';
import type { CategoryResponse } from '../../services';
import { useTranslation } from 'react-i18next';

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

const TourFilters: React.FC<TourFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults
}) => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  const tourTypeOptions = useMemo(
    () => [
      { value: '', label: t('tours.filters.tourTypes.all') },
      { value: 'domestic', label: t('tours.filters.tourTypes.domestic') },
      { value: 'international', label: t('tours.filters.tourTypes.international') }
    ],
    [t]
  );

  const priceRanges = useMemo(
    () => [
      { value: '', label: t('tours.filters.priceRanges.all'), min: '', max: '' },
      { value: '0-2000000', label: t('tours.filters.priceRanges.under2m'), min: '0', max: '2000000' },
      { value: '2000000-5000000', label: t('tours.filters.priceRanges.twoToFive'), min: '2000000', max: '5000000' },
      { value: '5000000-10000000', label: t('tours.filters.priceRanges.fiveToTen'), min: '5000000', max: '10000000' },
      {
        value: '10000000-20000000',
        label: t('tours.filters.priceRanges.tenToTwenty'),
        min: '10000000',
        max: '20000000'
      },
      { value: '20000000-', label: t('tours.filters.priceRanges.overTwenty'), min: '20000000', max: '' }
    ],
    [t]
  );

  const durationOptions = useMemo(
    () => [
      { value: '', label: t('tours.filters.durations.all') },
      { value: '1', label: t('tours.filters.durations.one') },
      { value: '2-3', label: t('tours.filters.durations.twoToThree') },
      { value: '4-7', label: t('tours.filters.durations.fourToSeven') },
      { value: '8-14', label: t('tours.filters.durations.eightToFourteen') },
      { value: '15+', label: t('tours.filters.durations.fifteenPlus') }
    ],
    [t]
  );

  const ratingOptions = useMemo(
    () => [
      { value: '', label: t('tours.filters.ratings.all') },
      { value: '4.5', label: t('tours.filters.ratings.atLeast', { rating: '4.5' }) },
      { value: '4.0', label: t('tours.filters.ratings.atLeast', { rating: '4.0' }) },
      { value: '3.5', label: t('tours.filters.ratings.atLeast', { rating: '3.5' }) },
      { value: '3.0', label: t('tours.filters.ratings.atLeast', { rating: '3.0' }) }
    ],
    [t]
  );

  const sortOptions = useMemo(
    () => [
      { value: 'popular', label: t('tours.filters.sort.popular') },
      { value: 'newest', label: t('tours.filters.sort.newest') },
      { value: 'price-low', label: t('tours.filters.sort.priceLow') },
      { value: 'price-high', label: t('tours.filters.sort.priceHigh') }
    ],
    [t]
  );

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
    const defaultOption = { value: '', label: t('tours.filters.categories.all') };

    if (!categories.length) return [defaultOption];

    const categoryOptions = categories.map((cat) => ({
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
    const defaultOption = { value: '', label: t('tours.filters.locations.all') };
    const mapToOption = (locs: string[]) => locs.map((loc) => ({ value: loc, label: loc }));
    
    if (tourType === 'domestic') {
      // Filter to show only Vietnamese locations
      const filtered = locations.filter(loc => {
        const lowerValue = loc.toLowerCase();
        // Include if contains any domestic keyword OR doesn't contain international keywords
        return domesticKeywords.some(kw => lowerValue.includes(kw)) || 
               !internationalKeywords.some(kw => lowerValue.includes(kw));
      });
      return [defaultOption, ...mapToOption(filtered)];
    } else if (tourType === 'international') {
      // Filter to show only international countries
      const filtered = locations.filter(loc => {
        const lowerValue = loc.toLowerCase();
        // Include if contains any international keyword
        return internationalKeywords.some(kw => lowerValue.includes(kw));
      });
      return [defaultOption, ...mapToOption(filtered)];
    }
    
    // Show all locations if no tour type selected
    return [defaultOption, ...mapToOption(locations)];
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
    const range = priceRanges.find(r => r.value === value);
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
    
    const range = priceRanges.find(r => r.min === priceMin && r.max === priceMax);
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
        setLocations(locationsData);
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
              placeholder={t('tours.filters.searchPlaceholder')}
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
              {tourTypeOptions.map(type => (
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
              {priceRanges.map(range => (
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
              {durationOptions.map(duration => (
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
              {ratingOptions.map(rating => (
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
              {sortOptions.map(option => (
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
                <span className="text-sm text-slate-700 whitespace-nowrap font-normal">✈️ {t('tours.filters.flightIncluded')}</span>
              </label>
            </div>
          )}
        </div>

        {/* Results and Clear */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
            <span className="text-sm text-gray-600 font-normal">
              {t('tours.filters.results', { count: totalResults })}
            </span>
          </div>
          
          {hasActiveFilters() && (
            <button
              onClick={onClearFilters}
              className="flex items-center px-4 py-2 text-slate-700 border border-stone-300 rounded-none hover:bg-stone-50 transition-all text-xs font-medium tracking-wider uppercase"
            >
              <XMarkIcon className="h-4 w-4 mr-1.5" />
              {t('tours.filters.clear')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourFilters;
