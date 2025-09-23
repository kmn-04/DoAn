import React, { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UsersIcon,
  CurrencyDollarIcon,
  StarIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  GlobeAltIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Card } from '../ui';

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
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'ai'>('basic');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Mock data
  const destinations = [
    'Hạ Long Bay', 'Sapa', 'Hội An', 'Đà Nẵng', 'Phú Quốc', 'Nha Trang',
    'Tokyo', 'Seoul', 'Bangkok', 'Singapore', 'Paris', 'London'
  ];

  const categories = [
    { id: 'beach', name: 'Tour biển đảo', icon: '🏖️' },
    { id: 'mountain', name: 'Tour núi rừng', icon: '🏔️' },
    { id: 'city', name: 'Tour thành phố', icon: '🏙️' },
    { id: 'culture', name: 'Tour văn hóa', icon: '🏛️' },
    { id: 'adventure', name: 'Tour phiêu lưu', icon: '🎯' },
    { id: 'food', name: 'Tour ẩm thực', icon: '🍜' }
  ];

  const amenities = [
    'WiFi miễn phí', 'Bữa ăn bao gồm', 'Hướng dẫn viên', 'Xe đưa đón',
    'Bảo hiểm du lịch', 'Nước uống', 'Thiết bị an toàn', 'Quà lưu niệm'
  ];

  const moods = [
    { id: 'relaxing', name: 'Thư giãn', emoji: '😌', color: 'bg-green-100 text-green-800' },
    { id: 'adventurous', name: 'Phiêu lưu', emoji: '🎯', color: 'bg-red-100 text-red-800' },
    { id: 'romantic', name: 'Lãng mạn', emoji: '💕', color: 'bg-pink-100 text-pink-800' },
    { id: 'cultural', name: 'Văn hóa', emoji: '🎭', color: 'bg-purple-100 text-purple-800' },
    { id: 'family', name: 'Gia đình', emoji: '👨‍👩‍👧‍👦', color: 'bg-blue-100 text-blue-800' },
    { id: 'solo', name: 'Du lịch một mình', emoji: '🚶', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const interests = [
    'Nhiếp ảnh', 'Lịch sử', 'Ẩm thực', 'Nghệ thuật', 'Thiên nhiên',
    'Thể thao', 'Shopping', 'Spa & Wellness', 'Kiến trúc', 'Âm nhạc'
  ];

  const travelStyles = [
    { id: 'luxury', name: 'Sang trọng', description: 'Khách sạn 5 sao, dịch vụ cao cấp' },
    { id: 'comfort', name: 'Thoải mái', description: 'Cân bằng giữa chất lượng và giá cả' },
    { id: 'budget', name: 'Tiết kiệm', description: 'Tối ưu chi phí, trải nghiệm cơ bản' },
    { id: 'backpacker', name: 'Phượt', description: 'Tự do, linh hoạt, gần gũi địa phương' }
  ];

  // Load AI suggestions based on current filters
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!filters.search && !filters.mood && filters.interests.length === 0) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      
      // Simulate AI API call
      setTimeout(() => {
        const mockSuggestions = [
          'Tour Hạ Long 2 ngày phù hợp cho gia đình',
          'Khám phá Sapa mùa lúa chín với nhiếp ảnh',
          'Tour ẩm thực Hội An cho người yêu văn hóa',
          'Phú Quốc thư giãn 3 ngày 2 đêm',
          'Tokyo - Osaka văn hóa truyền thống'
        ].filter(suggestion => 
          suggestion.toLowerCase().includes(filters.search.toLowerCase()) ||
          (filters.mood && suggestion.includes(moods.find(m => m.id === filters.mood)?.name || '')) ||
          filters.interests.some(interest => suggestion.includes(interest))
        );
        
        setSuggestions(mockSuggestions.slice(0, 5));
        setIsLoadingSuggestions(false);
      }, 1000);
    };

    loadSuggestions();
  }, [filters.search, filters.mood, filters.interests]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
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
              <h2 className="text-xl font-semibold text-gray-900">Tìm kiếm nâng cao</h2>
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
                placeholder="Tìm kiếm tour, điểm đến, hoạt động..."
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
                  <span className="text-sm font-medium text-purple-600">Gợi ý thông minh</span>
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
                { id: 'basic', name: 'Cơ bản', icon: AdjustmentsHorizontalIcon },
                { id: 'advanced', name: 'Nâng cao', icon: StarIcon },
                { id: 'ai', name: 'AI Thông minh', icon: SparklesIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
                amenities={amenities}
              />
            )}
            
            {activeTab === 'ai' && (
              <AIFilters 
                filters={filters}
                onChange={handleFilterChange}
                onArrayToggle={handleArrayFilterToggle}
                moods={moods}
                interests={interests}
                travelStyles={travelStyles}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleClear}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Xóa tất cả
            </button>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button onClick={handleSearch} className="px-8">
                Tìm kiếm
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
  onChange: (key: keyof SearchFilters, value: any) => void;
}> = ({ filters, onChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Destination */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <MapPinIcon className="inline h-4 w-4 mr-1" />
        Điểm đến
      </label>
      <select
        value={filters.destination}
        onChange={(e) => onChange('destination', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Tất cả điểm đến</option>
        <option value="domestic">Trong nước</option>
        <option value="international">Quốc tế</option>
      </select>
    </div>

    {/* Tour Type */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <GlobeAltIcon className="inline h-4 w-4 mr-1" />
        Loại tour
      </label>
      <select
        value={filters.tourType}
        onChange={(e) => onChange('tourType', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">Tất cả</option>
        <option value="domestic">Tour trong nước</option>
        <option value="international">Tour quốc tế</option>
      </select>
    </div>

    {/* Price Range */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <CurrencyDollarIcon className="inline h-4 w-4 mr-1" />
        Khoảng giá
      </label>
      <div className="flex space-x-2">
        <input
          type="number"
          placeholder="Từ"
          value={filters.priceMin}
          onChange={(e) => onChange('priceMin', e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <input
          type="number"
          placeholder="Đến"
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
        Thời gian
      </label>
      <select
        value={filters.duration}
        onChange={(e) => onChange('duration', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Tất cả</option>
        <option value="1-2">1-2 ngày</option>
        <option value="3-5">3-5 ngày</option>
        <option value="6-10">6-10 ngày</option>
        <option value="10+">Trên 10 ngày</option>
      </select>
    </div>

    {/* Rating */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <StarIcon className="inline h-4 w-4 mr-1" />
        Đánh giá
      </label>
      <select
        value={filters.rating}
        onChange={(e) => onChange('rating', e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">Tất cả</option>
        <option value="4.5+">4.5+ sao</option>
        <option value="4.0+">4.0+ sao</option>
        <option value="3.5+">3.5+ sao</option>
      </select>
    </div>

    {/* Participants */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <UsersIcon className="inline h-4 w-4 mr-1" />
        Số người
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
);

// Advanced Filters Component  
const AdvancedFilters: React.FC<{
  filters: SearchFilters;
  onChange: (key: keyof SearchFilters, value: any) => void;
  onArrayToggle: (key: keyof SearchFilters, value: string) => void;
  amenities: string[];
}> = ({ filters, onChange, onArrayToggle, amenities }) => (
  <div className="space-y-6">
    {/* Amenities */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Tiện ích bao gồm
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {amenities.map((amenity) => (
          <label
            key={amenity}
            className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={filters.amenities.includes(amenity)}
              onChange={() => onArrayToggle('amenities', amenity)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{amenity}</span>
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
        <span className="text-sm font-medium text-gray-700">Phù hợp người khuyết tật</span>
      </label>

      <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.instantBooking}
          onChange={(e) => onChange('instantBooking', e.target.checked)}
          className="text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">Đặt ngay lập tức</span>
      </label>

      <label className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.freeCancellation}
          onChange={(e) => onChange('freeCancellation', e.target.checked)}
          className="text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-medium text-gray-700">Hủy miễn phí</span>
      </label>
    </div>
  </div>
);

// AI Filters Component
const AIFilters: React.FC<{
  filters: SearchFilters;
  onChange: (key: keyof SearchFilters, value: any) => void;
  onArrayToggle: (key: keyof SearchFilters, value: string) => void;
  moods: any[];
  interests: string[];
  travelStyles: any[];
}> = ({ filters, onChange, onArrayToggle, moods, interests, travelStyles }) => (
  <div className="space-y-6">
    {/* Mood Selection */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        <SparklesIcon className="inline h-4 w-4 mr-1" />
        Tâm trạng du lịch
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
        Sở thích
      </label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {interests.map((interest) => (
          <button
            key={interest}
            onClick={() => onArrayToggle('interests', interest)}
            className={`p-2 rounded-lg text-sm font-medium transition-colors ${
              filters.interests.includes(interest)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
    </div>

    {/* Travel Style */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Phong cách du lịch
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

export default AdvancedSearchModal;
export type { SearchFilters };
