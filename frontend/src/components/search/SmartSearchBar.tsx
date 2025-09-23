import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  MapPinIcon,
  ClockIcon,
  StarIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import AdvancedSearchModal from './AdvancedSearchModal';
import type { SearchFilters } from './AdvancedSearchModal';

interface SmartSearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string, filters?: SearchFilters) => void;
  showAdvanced?: boolean;
  initialValue?: string;
}

interface SearchSuggestion {
  id: string;
  type: 'destination' | 'tour' | 'category' | 'keyword';
  text: string;
  subtitle?: string;
  icon?: string;
  trending?: boolean;
}

const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  className = '',
  placeholder = 'Tìm kiếm tour, điểm đến...',
  onSearch,
  showAdvanced = true,
  initialValue = ''
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState<SearchSuggestion[]>([
    { id: '1', type: 'destination', text: 'Hạ Long Bay', subtitle: '245 tours', icon: '🏖️', trending: true },
    { id: '2', type: 'destination', text: 'Sapa', subtitle: '189 tours', icon: '🏔️', trending: true },
    { id: '3', type: 'destination', text: 'Hội An', subtitle: '156 tours', icon: '🏛️' },
    { id: '4', type: 'tour', text: 'Tour Phú Quốc 3 ngày 2 đêm', subtitle: 'Từ 2.500.000đ', icon: '🏝️' },
    { id: '5', type: 'category', text: 'Tour ẩm thực', subtitle: '89 tours', icon: '🍜' },
    { id: '6', type: 'destination', text: 'Tokyo', subtitle: '67 tours', icon: '🗾', trending: true },
    { id: '7', type: 'keyword', text: 'tour cuối tuần', subtitle: 'Gần Hà Nội', icon: '📅' },
    { id: '8', type: 'keyword', text: 'du lịch gia đình', subtitle: 'Phù hợp trẻ em', icon: '👨‍👩‍👧‍👦' }
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Auto-complete suggestions
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions(popularSearches);
      return;
    }

    const loadSuggestions = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const filtered = popularSearches.filter(item =>
          item.text.toLowerCase().includes(query.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
        );

        // Add AI-powered suggestions
        const aiSuggestions: SearchSuggestion[] = [
          { 
            id: 'ai-1', 
            type: 'keyword', 
            text: `${query} cho gia đình`, 
            subtitle: 'Gợi ý AI - Phù hợp trẻ em',
            icon: '🤖'
          },
          { 
            id: 'ai-2', 
            type: 'keyword', 
            text: `${query} giá tốt`, 
            subtitle: 'Gợi ý AI - Tiết kiệm',
            icon: '🤖'
          },
          { 
            id: 'ai-3', 
            type: 'keyword', 
            text: `${query} cuối tuần`, 
            subtitle: 'Gợi ý AI - 2-3 ngày',
            icon: '🤖'
          }
        ];

        setSuggestions([...filtered, ...aiSuggestions].slice(0, 8));
        setIsLoading(false);
      }, 300);
    };

    const debounceTimer = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, popularSearches]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch(query);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const searchText = suggestion.text;
    setQuery(searchText);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Save to recent searches
    saveToRecent(searchText);
    
    // Perform search
    handleSearch(searchText);
  };

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    saveToRecent(searchQuery);

    // Call parent handler if provided
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      // Navigate to tours page with search
      navigate(`/tours?search=${encodeURIComponent(searchQuery)}`);
    }

    setShowSuggestions(false);
  };

  const handleAdvancedSearch = (filters: SearchFilters) => {
    // Build query string from filters
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== 'all' && 
          !(Array.isArray(value) && value.length === 0) &&
          !(typeof value === 'boolean' && value === false)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value.toString());
        }
      }
    });

    // Navigate with filters
    navigate(`/tours?${params.toString()}`);
  };

  const saveToRecent = (searchText: string) => {
    const updated = [searchText, ...recentSearches.filter(item => item !== searchText)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    if (suggestion.icon) return suggestion.icon;
    
    switch (suggestion.type) {
      case 'destination':
        return <MapPinIcon className="h-4 w-4 text-gray-400" />;
      case 'tour':
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
      case 'category':
        return <StarIcon className="h-4 w-4 text-gray-400" />;
      default:
        return <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-10 flex items-center pr-2"
          >
            <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}

        {/* Advanced Search Button */}
        {showAdvanced && (
          <button
            onClick={() => setIsAdvancedOpen(true)}
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            title="Tìm kiếm nâng cao"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 hover:text-blue-600 transition-colors" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Đang tìm kiếm...</p>
            </div>
          ) : (
            <div>
              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tìm kiếm gần đây
                    </h4>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Xóa
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick({ 
                        id: `recent-${index}`, 
                        type: 'keyword', 
                        text: search 
                      })}
                      className="flex items-center w-full p-2 text-left hover:bg-gray-50 rounded-md"
                    >
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-700">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 ? (
                <div className="py-2">
                  {!query && (
                    <h4 className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Tìm kiếm phổ biến
                    </h4>
                  )}
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                        selectedIndex === index ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex-shrink-0 mr-3">
                        {typeof suggestion.icon === 'string' ? (
                          <span className="text-lg">{suggestion.icon}</span>
                        ) : (
                          getSuggestionIcon(suggestion)
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium truncate">
                            {suggestion.text}
                          </span>
                          {suggestion.trending && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <SparklesIcon className="h-3 w-3 mr-0.5" />
                              Hot
                            </span>
                          )}
                        </div>
                        {suggestion.subtitle && (
                          <p className="text-xs text-gray-500 truncate">
                            {suggestion.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center">
                  <MagnifyingGlassIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Không tìm thấy kết quả</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={isAdvancedOpen}
        onClose={() => setIsAdvancedOpen(false)}
        onSearch={handleAdvancedSearch}
        initialFilters={{ search: query }}
      />
    </div>
  );
};

export default SmartSearchBar;
