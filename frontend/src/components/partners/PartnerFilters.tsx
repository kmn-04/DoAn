import React, { useMemo } from 'react';
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import type { PartnerFilters as PartnerFiltersType } from '../../types';
import { useTranslation } from 'react-i18next';

interface PartnerFiltersProps {
  filters: PartnerFiltersType;
  onFiltersChange: (filters: PartnerFiltersType) => void;
  onClearFilters: () => void;
  totalResults?: number;
}

const PARTNER_TYPES = ['','Hotel','Restaurant'];
const LOCATION_VALUES = ['','hanoi','hochiminh','danang','phuquoc'];
const RATINGS = ['','4.5','4.0','3.5','3.0'];
const SORT_OPTIONS = [
  'name-asc',
  'name-desc',
  'rating-desc',
  'totalTours-desc',
  'establishedYear-asc'
];

const PartnerFilters: React.FC<PartnerFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  totalResults = 0
}) => {
  const { t } = useTranslation();
  const partnerTypes = useMemo(() => PARTNER_TYPES.map((value: string) => ({
    value,
    label: value ? t(`partners.filters.type.${value.toLowerCase()}`) : t('partners.filters.type.all')
  })), [t]);
  const locations = useMemo(() => LOCATION_VALUES.map((value: string) => ({
    value,
    label: value ? t(`partners.filters.location.${value}`) : t('partners.filters.location.all')
  })), [t]);
  const ratings = useMemo(() => RATINGS.map((value: string) => ({
    value,
    label: value ? t(`partners.filters.rating.${value.replace('.', '_')}`) : t('partners.filters.rating.all')
  })), [t]);
  const sortOptions = useMemo(() => SORT_OPTIONS.map(value => ({
    value,
    label: t(`partners.filters.sort.${value}`)
  })), [t]);
  const handleFilterChange = (key: keyof PartnerFiltersType, value: string | number | undefined) => {
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
              placeholder={t('partners.filters.searchPlaceholder')}
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
            {partnerTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Location */}
          <select
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {locations.map(location => (
              <option key={location.value} value={location.value}>{location.label}</option>
            ))}
          </select>

          {/* Rating */}
          <select
            value={filters.rating?.toString() || ''}
            onChange={(e) => handleFilterChange('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {ratings.map(rating => (
              <option key={rating.value} value={rating.value}>{rating.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={getCurrentSortValue()}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Results and Clear Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{totalResults}</span> {t('partners.filters.results')}
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
              {t('partners.filters.clear')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerFilters;
