import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import TourCard from '../components/tours/TourCard';
import TourFilters from '../components/tours/TourFilters';
import { Pagination, SkeletonTourCard } from '../components/ui';
import { tourService, categoryService } from '../services';
import type { TourResponse, TourSearchRequest, CategoryResponse } from '../services';

interface Tour {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  location: string;
  tourType?: 'domestic' | 'international';
  country?: {
    name: string;
    code: string;
    flagUrl?: string;
    visaRequired: boolean;
  };
  flightIncluded?: boolean;
  visaInfo?: string;
  rating: number;
  reviewCount: number;
  maxPeople: number;
  image: string;
  badge?: string;
  category: string;
}

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

// No mock data - fetching from API only

// Helper function to convert TourResponse to local Tour interface
const convertTourResponse = (tourResponse: TourResponse): Tour => {
  return {
    id: tourResponse.id,
    name: tourResponse.name,
    slug: tourResponse.slug,
    description: tourResponse.description || tourResponse.shortDescription || '',
    price: tourResponse.price,
    originalPrice: tourResponse.salePrice, // Use salePrice instead of discountPrice
    duration: `${tourResponse.duration} ngày`,
    location: tourResponse.destination || tourResponse.departureLocation || 'Việt Nam', // Use new fields
    tourType: tourResponse.tourType === 'DOMESTIC' ? 'domestic' : 'international',
    country: tourResponse.country ? {
      name: tourResponse.country.name,
      code: tourResponse.country.code,
      flagUrl: tourResponse.country.flagUrl,
      visaRequired: tourResponse.country.visaRequired || false
    } : undefined,
    flightIncluded: tourResponse.flightIncluded || false,
    visaInfo: tourResponse.visaInfo,
    rating: tourResponse.averageRating || 4.5,
    reviewCount: tourResponse.totalReviews || 0,
    maxPeople: tourResponse.maxPeople,
    image: tourResponse.images?.[0]?.imageUrl || tourResponse.mainImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    badge: tourResponse.isFeatured ? 'Hot' : undefined,
    category: tourResponse.category?.name || 'Du lịch'  // Handle null category
  };
};

const ToursListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState<Tour[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  
  const toursPerPage = 12;

  // Initialize filters from URL params
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    duration: searchParams.get('duration') || '',
    rating: searchParams.get('rating') || '',
    sortBy: searchParams.get('sortBy') || 'popular',
    location: searchParams.get('location') || '',
    tourType: searchParams.get('tourType') || '',
    continent: searchParams.get('continent') || '',
    country: searchParams.get('country') || '',
    visaRequired: false,
    flightIncluded: false
  });

  // Fetch categories on mount
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

  // Helper to find category ID from slug or name
  const getCategoryId = useCallback((categorySlug: string): number | undefined => {
    if (!categorySlug) return undefined;
    const category = categories.find(cat => 
      cat.slug === categorySlug || 
      cat.name.toLowerCase() === categorySlug.toLowerCase()
    );
    return category?.id;
  }, [categories]);

  // Fetch tours from API
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchTours = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Build search request from filters
      const searchRequest: TourSearchRequest = {
        page: currentPage - 1, // API uses 0-based indexing
        size: toursPerPage,
        sortBy: filters.sortBy === 'popular' ? 'viewCount' :  // Sort by view count for popular
                filters.sortBy === 'newest' ? 'createdAt' :
                filters.sortBy === 'price-low' ? 'price' :
                filters.sortBy === 'price-high' ? 'price' :
                filters.sortBy === 'rating' ? 'averageRating' :
                filters.sortBy === 'duration' ? 'duration' : 'viewCount',
        sortDirection: filters.sortBy === 'popular' || filters.sortBy === 'newest' || filters.sortBy === 'price-high' || filters.sortBy === 'rating' ? 'desc' : 'asc'
      };

       // Add filters
      if (filters.search) searchRequest.keyword = filters.search;
      
      // Convert category slug to ID
      if (filters.category) {
        const categoryId = getCategoryId(filters.category);
        if (categoryId) {
          searchRequest.categoryId = categoryId;
        }
      }
      
      if (filters.tourType) searchRequest.tourType = filters.tourType === 'domestic' ? 'DOMESTIC' : 'INTERNATIONAL';
      if (filters.continent) searchRequest.continent = filters.continent;
      if (filters.priceMin) searchRequest.minPrice = parseInt(filters.priceMin);
      if (filters.priceMax) searchRequest.maxPrice = parseInt(filters.priceMax);
      
      // Location filter - send to backend
      if (filters.location) {
        searchRequest.location = filters.location;
      }
      
      // Duration filter - parse range properly
      if (filters.duration) {
        if (filters.duration === '1') {
          searchRequest.minDuration = 1;
          searchRequest.maxDuration = 1;
        } else if (filters.duration.includes('-')) {
          const [min, max] = filters.duration.split('-');
          searchRequest.minDuration = parseInt(min);
          if (max) {
            searchRequest.maxDuration = parseInt(max);
          }
        } else if (filters.duration.endsWith('+')) {
          // e.g., "15+"
          const min = parseInt(filters.duration);
          if (!isNaN(min)) {
            searchRequest.minDuration = min;
          }
        }
      }
      
      if (filters.rating) searchRequest.minRating = parseFloat(filters.rating);
      if (filters.visaRequired) searchRequest.visaRequired = filters.visaRequired;
      if (filters.flightIncluded) searchRequest.flightIncluded = filters.flightIncluded;

      const response = await tourService.searchTours(searchRequest);
      
      // Convert API response to local format
      const convertedTours = response.content.map(convertTourResponse);
      setTours(convertedTours);
      setTotalPages(response.totalPages);
      setTotalTours(response.totalElements);
      
    } catch (error) {
      console.error('❌ Error fetching tours:', error);
      // Show empty state on error
      setTours([]);
      setTotalPages(0);
      setTotalTours(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, toursPerPage, categories, getCategoryId]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      // Skip empty values, default sortBy, and false boolean values
      if (value && 
          value !== '' && 
          !(key === 'sortBy' && value === 'popular') &&
          !(typeof value === 'boolean' && value === false)) {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Fetch tours when component mounts, filters change, or page changes
  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priceMin: '',
      priceMax: '',
      duration: '',
      rating: '',
      sortBy: 'popular',
      location: '',
      tourType: '',
      continent: '',
      country: '',
      visaRequired: false,
      flightIncluded: false
    });
  };

  const handleToggleWishlist = (tourId: number) => {
    setWishlist(prev => 
      prev.includes(tourId) 
        ? prev.filter(id => id !== tourId)
        : [...prev, tourId]
    );
  };

  // Display tours directly from API (already filtered and paginated by backend)
  const currentTours = tours;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 lg:h-[500px] bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=800&fit=crop"
            alt="Du lịch Việt Nam"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-blue-900/60"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Tours Du Lịch</h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Khám phá vẻ đẹp Việt Nam với hơn {totalTours} tour đa dạng từ biển đảo đến miền núi
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section - Horizontal at top */}
        <div className="mb-8">
          <TourFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            totalResults={totalTours}
          />
        </div>

        {/* Tours Content */}
        <div className="w-full">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 12 }).map((_, index) => (
                  <SkeletonTourCard key={index} />
                ))}
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy tour nào
                </h3>
                <p className="text-gray-600 mb-4">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <>
                {/* Tours Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 items-stretch">
                  {currentTours.map((tour) => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      isWishlisted={wishlist.includes(tour.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ToursListingPage;
