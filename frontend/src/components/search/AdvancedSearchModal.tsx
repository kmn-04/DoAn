import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  MapPinIcon,
  UsersIcon,
  CurrencyDollarIcon,
  StarIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

const AMENITIES = [
  { value: 'WiFi miễn phí', key: 'freeWifi' },
  { value: 'Bữa ăn bao gồm', key: 'mealsIncluded' },
  { value: 'Hướng dẫn viên', key: 'tourGuide' },
  { value: 'Xe đưa đón', key: 'transfers' },
  { value: 'Bảo hiểm du lịch', key: 'travelInsurance' },
  { value: 'Nước uống', key: 'beverages' },
  { value: 'Thiết bị an toàn', key: 'safetyGear' },
  { value: 'Quà lưu niệm', key: 'souvenirs' }
];

const INTERESTS = [
  { value: 'Nhiếp ảnh', key: 'photography' },
  { value: 'Lịch sử', key: 'history' },
  { value: 'Ẩm thực', key: 'cuisine' },
  { value: 'Nghệ thuật', key: 'art' },
  { value: 'Thiên nhiên', key: 'nature' },
  { value: 'Thể thao', key: 'sports' },
  { value: 'Shopping', key: 'shopping' },
  { value: 'Spa & Wellness', key: 'spaWellness' },
  { value: 'Kiến trúc', key: 'architecture' },
  { value: 'Âm nhạc', key: 'music' }
];

const MOOD_PRESETS = [
  { id: 'relaxing', emoji: '😌', color: 'bg-green-100 text-green-800' },
  { id: 'adventurous', emoji: '🎯', color: 'bg-red-100 text-red-800' },
  { id: 'romantic', emoji: '💕', color: 'bg-pink-100 text-pink-800' },
  { id: 'cultural', emoji: '🎭', color: 'bg-purple-100 text-purple-800' },
  { id: 'family', emoji: '👨‍👩‍👧‍👦', color: 'bg-blue-100 text-blue-800' },
  { id: 'solo', emoji: '🚶', color: 'bg-yellow-100 text-yellow-800' }
];

const TRAVEL_STYLE_PRESETS = [
  { id: 'luxury' },
  { id: 'comfort' },
  { id: 'budget' },
  { id: 'backpacker' }
];

const SUGGESTION_KEYS = [
  'familyHalong',
  'sapaPhoto',
  'hoiAnFoodCulture',
  'phuQuocRelax',
  'tokyoCulture'
];

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export interface SearchFilters {
  search: string;
  destination: string;
  tourType: 'all' | 'domestic' | 'international';
  category: string;
  priceMin: string;
  priceMax: string;
  duration: string;
  rating: string;
  startDate: string;
  endDate: string;
  participants: string;
  sortBy: string;
  
  // Advanced filters
  amenities: string[];
  difficulty: string;
  accessibility: boolean;
  instantBooking: boolean;
  freeCancellation: boolean;
  
  // AI-powered
  mood: string;
  interests: string[];
  budget: string;
  travelStyle: string;
}

const AdvancedSearchModal: React.FC<AdvancedSearchProps> = ({
  isOpen,
  onClose,
  onSearch,
  initialFilters = {}
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    destination: '',
    tourType: 'all',
    category: '',
    priceMin: '',
    priceMax: '',
    duration: '',
    rating: '',
    startDate: '',
    endDate: '',
    participants: '2',
    sortBy: 'popular',
    amenities: [],
    difficulty: '',
    accessibility: false,
    instantBooking: false,
    freeCancellation: false,
    mood: '',
    interests: [],
    budget: '',
    travelStyle: '',
    ...initialFilters
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'ai'>('basic');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const moodOptions = useMemo(() => (
    MOOD_PRESETS.map((preset) => ({
      ...preset,
      name: t(`tours.advancedSearch.ai.moods.${preset.id}`)
    }))
  ), [t]);

  const travelStyleOptions = useMemo(() => (
    TRAVEL_STYLE_PRESETS.map((style) => ({
      ...style,
      name: t(`tours.advancedSearch.ai.travelStyles.${style.id}.name`),
      description: t(`tours.advancedSearch.ai.travelStyles.${style.id}.description`)
    }))
  ), [t]);

  const amenityLabels = useMemo(
    () =>
      AMENITIES.reduce<Record<string, string>>((acc, amenity) => {
        acc[amenity.value] = t(`tours.advancedSearch.advanced.amenities.${amenity.key}`);
        return acc;
      }, {}),
    [t]
  );

  const interestLabels = useMemo(
    () =>
      INTERESTS.reduce<Record<string, string>>((acc, interest) => {
        acc[interest.value] = t(`tours.advancedSearch.ai.interests.${interest.key}`);
        return acc;
      }, {}),
    [t]
  );

  const suggestionTexts = useMemo(
    () => SUGGESTION_KEYS.map((key) => t(`tours.advancedSearch.suggestions.${key}`)),
    [t]
  );

  // Load AI suggestions based on current filters
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!filters.search && !filters.mood && filters.interests.length === 0) {
        setSuggestions([]);
        return;
      }

      // Simulate AI API call
      setTimeout(() => {
        const mockSuggestions = suggestionTexts.filter((suggestion) =>
          filters.search
            ? suggestion.toLowerCase().includes(filters.search.toLowerCase())
            : true
        );

        setSuggestions(mockSuggestions.slice(0, 5));
      }, 1000);
    };

    loadSuggestions();
  }, [filters.search, filters.mood, filters.interests, suggestionTexts]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleFilterChange = (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayFilterToggle = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: (prev[key] as string[]).includes(value)
        ? (prev[key] as string[]).filter(item => item !== value)
        : [...(prev[key] as string[]), value]
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      search: '',
      destination: '',
      tourType: 'all',
      category: '',
      priceMin: '',
      priceMax: '',
      duration: '',
      rating: '',
      startDate: '',
      endDate: '',
      participants: '2',
      sortBy: 'popular',
      amenities: [],
      difficulty: '',
      accessibility: false,
      instantBooking: false,
      freeCancellation: false,
      mood: '',
      interests: [],
      budget: '',
      travelStyle: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">{t('tours.advancedSearch.title')}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t('tours.advancedSearch.searchPlaceholder')}
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <SparklesIcon className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium text-purple-600">{t('tours.advancedSearch.aiSuggestions')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleFilterChange('search', suggestion)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'basic', name: t('tours.advancedSearch.tabs.basic'), icon: AdjustmentsHorizontalIcon },
                { id: 'advanced', name: t('tours.advancedSearch.tabs.advanced'), icon: StarIcon },
                { id: 'ai', name: t('tours.advancedSearch.tabs.ai'), icon: SparklesIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'basic' | 'advanced' | 'ai')}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {activeTab === 'basic' && (
              <BasicFilters filters={filters} onChange={handleFilterChange} />
            )}
            
            {activeTab === 'advanced' && (
              <AdvancedFilters 
                filters={filters} 
                onChange={handleFilterChange}
                onArrayToggle={handleArrayFilterToggle}
                amenities={AMENITIES}
                amenityLabels={amenityLabels}
              />
            )}
            
            {activeTab === 'ai' && (
              <AIFilters 
                filters={filters}
                onChange={handleFilterChange}
                onArrayToggle={handleArrayFilterToggle}
                moods={moodOptions}
                interests={INTERESTS}
                interestLabels={interestLabels}
                travelStyles={travelStyleOptions}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClear}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              {t('tours.advancedSearch.buttons.clearAll')}
            </button>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                {t('tours.advancedSearch.buttons.cancel')}
              </Button>
              <Button onClick={handleSearch} className="px-8">
                {t('tours.advancedSearch.buttons.search')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Basic Filters Component
const BasicFilters: React.FC<{
  filters: SearchFilters;
  onChange: (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => void;
}> = ({ filters, onChange }) => {
  const { t } = useTranslation();
  return (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Destination */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <MapPinIcon className="inline h-4 w-4 mr-1" />
        {t('tours.advancedSearch.basic.destination.label')}
      </label>
      <select
        value={filters.destination}
        onChange={(e) => onChange('destination', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">{t('tours.advancedSearch.basic.destination.options.all')}</option>
        <option value="domestic">{t('tours.advancedSearch.basic.destination.options.domestic')}</option>
        <option value="international">{t('tours.advancedSearch.basic.destination.options.international')}</option>
      </select>
    </div>

    {/* Tour Type */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <GlobeAltIcon className="inline h-4 w-4 mr-1" />
        {t('tours.advancedSearch.basic.tourType.label')}
      </label>
      <select
        value={filters.tourType}
        onChange={(e) => onChange('tourType', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">{t('tours.advancedSearch.basic.tourType.options.all')}</option>
        <option value="domestic">{t('tours.advancedSearch.basic.tourType.options.domestic')}</option>
        <option value="international">{t('tours.advancedSearch.basic.tourType.options.international')}</option>
      </select>
    </div>

    {/* Price Range */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <CurrencyDollarIcon className="inline h-4 w-4 mr-1" />
        {t('tours.advancedSearch.basic.priceRange.label')}
      </label>
      <div className="flex space-x-2">
        <input
          type="number"
          placeholder={t('tours.advancedSearch.basic.priceRange.minPlaceholder')}
          value={filters.priceMin}
          onChange={(e) => onChange('priceMin', e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="number"
          placeholder={t('tours.advancedSearch.basic.priceRange.maxPlaceholder')}
          value={filters.priceMax}
          onChange={(e) => onChange('priceMax', e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>

    {/* Duration */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <ClockIcon className="inline h-4 w-4 mr-1" />
        {t('tours.advancedSearch.basic.duration.label')}
      </label>
      <select
        value={filters.duration}
        onChange={(e) => onChange('duration', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">{t('tours.advancedSearch.basic.duration.options.all')}</option>
        <option value="1-2">{t('tours.advancedSearch.basic.duration.options.oneTwo')}</option>
        <option value="3-5">{t('tours.advancedSearch.basic.duration.options.threeFive')}</option>
        <option value="6-10">{t('tours.advancedSearch.basic.duration.options.sixTen')}</option>
        <option value="10+">{t('tours.advancedSearch.basic.duration.options.tenPlus')}</option>
      </select>
    </div>

    {/* Rating */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <StarIcon className="inline h-4 w-4 mr-1" />
        {t('tours.advancedSearch.basic.rating.label')}
      </label>
      <select
        value={filters.rating}
        onChange={(e) => onChange('rating', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">{t('tours.advancedSearch.basic.rating.options.all')}</option>
        <option value="4.5+">{t('tours.advancedSearch.basic.rating.options.fourHalf')}</option>
        <option value="4.0+">{t('tours.advancedSearch.basic.rating.options.four')}</option>
        <option value="3.5+">{t('tours.advancedSearch.basic.rating.options.threeHalf')}</option>
      </select>
    </div>

    {/* Participants */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <UsersIcon className="inline h-4 w-4 mr-1" />
        {t('tours.advancedSearch.basic.participants.label')}
      </label>
      <input
        type="number"
        min="1"
        value={filters.participants}
        onChange={(e) => onChange('participants', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  </div>
)};

// Advanced Filters Component  
const AdvancedFilters: React.FC<{
  filters: SearchFilters;
  onChange: (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => void;
  onArrayToggle: (key: keyof SearchFilters, value: string) => void;
  amenities: typeof AMENITIES;
  amenityLabels: Record<string, string>;
}> = ({ filters, onChange, onArrayToggle, amenities, amenityLabels }) => {
  const { t } = useTranslation();
  return (
  <div className="space-y-6">
    {/* Amenities */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {t('tours.advancedSearch.advanced.amenitiesLabel')}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {amenities.map((amenity) => (
          <label
            key={amenity.value}
            className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={filters.amenities.includes(amenity.value)}
              onChange={() => onArrayToggle('amenities', amenity.value)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{amenityLabels[amenity.value] || amenity.value}</span>
          </label>
        ))}
      </div>
    </div>

    {/* Quick Filters */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.accessibility}
          onChange={(e) => onChange('accessibility', e.target.checked)}
          className="text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">{t('tours.advancedSearch.advanced.quickFilters.accessibility')}</span>
      </label>

      <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.instantBooking}
          onChange={(e) => onChange('instantBooking', e.target.checked)}
          className="text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">{t('tours.advancedSearch.advanced.quickFilters.instantBooking')}</span>
      </label>

      <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.freeCancellation}
          onChange={(e) => onChange('freeCancellation', e.target.checked)}
          className="text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">{t('tours.advancedSearch.advanced.quickFilters.freeCancellation')}</span>
      </label>
    </div>
  </div>
);
};

// AI Filters Component
const AIFilters: React.FC<{
  filters: SearchFilters;
  onChange: (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => void;
  onArrayToggle: (key: keyof SearchFilters, value: string) => void;
  moods: Array<{ id: string; emoji: string; color: string; name: string }>;
  interests: typeof INTERESTS;
  interestLabels: Record<string, string>;
  travelStyles: Array<{ id: string; name: string; description: string }>;
}> = ({ filters, onChange, onArrayToggle, moods, interests, interestLabels, travelStyles }) => {
  const { t } = useTranslation();
  return (
  <div className="space-y-6">
    {/* Mood Selection */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        <SparklesIcon className="inline h-4 w-4 mr-1" />
        {t('tours.advancedSearch.ai.moodLabel')}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onChange('mood', filters.mood === mood.id ? '' : mood.id)}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              filters.mood === mood.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{mood.emoji}</span>
              <span className="font-medium text-gray-900">{mood.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>

    {/* Interests */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {t('tours.advancedSearch.ai.interestsLabel')}
      </label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {interests.map((interest) => (
          <button
            key={interest.value}
            onClick={() => onArrayToggle('interests', interest.value)}
            className={`p-2 rounded-lg text-sm font-medium transition-colors ${
              filters.interests.includes(interest.value)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {interestLabels[interest.value] || interest.value}
          </button>
        ))}
      </div>
    </div>

    {/* Travel Style */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {t('tours.advancedSearch.ai.travelStyleLabel')}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {travelStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => onChange('travelStyle', filters.travelStyle === style.id ? '' : style.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              filters.travelStyle === style.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-gray-900 mb-1">{style.name}</div>
            <div className="text-sm text-gray-600">{style.description}</div>
          </button>
        ))}
      </div>
    </div>
  </div>
);
};

export default AdvancedSearchModal;
