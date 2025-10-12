import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import TourCard from '../components/tours/TourCard';
import TourFilters from '../components/tours/TourFilters';
import { Pagination, SkeletonTourCard } from '../components/ui';
import { tourService, categoryService, wishlistService } from '../services';
import type { TourResponse, TourSearchRequest, CategoryResponse } from '../services';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

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
    price: tourResponse.salePrice || tourResponse.price, // Giá hiệu quả (đã sale hoặc gốc)
    originalPrice: (tourResponse.salePrice && tourResponse.salePrice < tourResponse.price) ? tourResponse.price : undefined, // Giá gốc chỉ khi có sale
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
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState<Tour[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(0); // 0-based indexing to match Pagination component
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  
  const toursPerPage = 12;
  
  // Ref to scroll to tours section when page changes
  const toursGridRef = useRef<HTMLDivElement>(null);

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

  // Load wishlist from server
  useEffect(() => {
    const loadWishlist = async () => {
      if (!user?.id) {
        setWishlist([]);
        return;
      }
      
      try {
        const wishlistItems = await wishlistService.getUserWishlist(user.id);
        const wishlistIds = wishlistItems.map(item => item.id);
        setWishlist(wishlistIds);
      } catch (error) {
        console.error('Error loading wishlist:', error);
      }
    };
    
    loadWishlist();
  }, [user?.id]);

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
  const fetchTours = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Build search request from filters
      const searchRequest: TourSearchRequest = {
        page: currentPage, // Already 0-based indexing
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
  }, [currentPage, filters, toursPerPage, getCategoryId]); // Removed 'categories' from deps

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

  // Reset to page 0 when filters change (except initial mount)
  useEffect(() => {
    setCurrentPage(0);
  }, [filters]);

  // Fetch tours when component mounts, filters change, or page changes
  useEffect(() => {
    fetchTours();
  }, [fetchTours]);
  
  // Scroll to tours grid when page changes
  useEffect(() => {
    if (toursGridRef.current) {
      // Get the position of the tours grid
      const yOffset = -100; // Offset to show some space above (adjust as needed)
      const element = toursGridRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      // Smooth scroll to the tours grid
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [currentPage]);

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

  const handleToggleWishlist = async (tourId: number) => {
    // Check if user is logged in
    if (!user?.id) {
      toast.error('Vui lòng đăng nhập để lưu tour yêu thích');
      return;
    }

    const isCurrentlyWishlisted = wishlist.includes(tourId);
    
    // Optimistic update
    setWishlist(prev => 
      isCurrentlyWishlisted
        ? prev.filter(id => id !== tourId)
        : [...prev, tourId]
    );

    try {
      if (isCurrentlyWishlisted) {
        // Remove from wishlist
        await wishlistService.removeFromWishlist(user.id, tourId);
        toast.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        // Add to wishlist
        await wishlistService.addToWishlist(user.id, tourId);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Revert optimistic update on error
      setWishlist(prev => 
        isCurrentlyWishlisted
          ? [...prev, tourId]
          : prev.filter(id => id !== tourId)
      );
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  // Display tours directly from API (already filtered and paginated by backend)
  const currentTours = tours;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section - Navy & Gold Theme */}
      <div className="relative h-96 lg:h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&h=800&fit=crop"
            alt="Du lịch Việt Nam"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90"></div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}></div>
        
        {/* Content Overlay */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center">
          <div className="text-white text-center animate-fade-in-up opacity-0">
            {/* Label */}
            <div className="inline-block px-6 py-2 border rounded-none mb-6" style={{ borderColor: '#D4AF37' }}>
              <span className="text-xs font-medium tracking-[0.3em] uppercase" style={{ color: '#D4AF37' }}>Khám Phá Việt Nam</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-normal mb-6 tracking-tight">Tours Du Lịch</h1>
            
            {/* Divider */}
            <div className="w-20 h-px mx-auto mb-6" style={{ background: 'linear-gradient(to right, transparent, #D4AF37, transparent)' }}></div>
            
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-normal leading-relaxed">
              Khám phá vẻ đẹp Việt Nam với hơn <span className="font-medium" style={{ color: '#D4AF37' }}>{totalTours}</span> tour đa dạng từ biển đảo đến miền núi
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
        <div className="w-full relative" ref={toursGridRef}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 12 }).map((_, index) => (
                  <SkeletonTourCard key={index} />
                ))}
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-16 animate-fade-in bg-white rounded-none border border-stone-200 shadow-lg">
                <div className="text-6xl mb-6 animate-bounce">🔍</div>
                <h3 className="text-2xl font-normal text-slate-900 mb-3 tracking-tight">
                  Không tìm thấy tour nào
                </h3>
                <p className="text-gray-600 mb-8 font-normal">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-none font-medium text-xs tracking-[0.2em] uppercase transition-all duration-300 border border-slate-900 shadow-lg hover:shadow-xl"
                  style={{ '--hover-border': '#D4AF37' } as React.CSSProperties}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D4AF37'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#0f172a'}
                >
                  Xóa tất cả bộ lọc
                </button>
              </div>
            ) : (
              <>
                {/* Tours Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 items-stretch">
                  {currentTours.map((tour, index) => (
                    <div key={tour.id} className="stagger-animation opacity-0">
                      <TourCard
                        tour={tour}
                        isWishlisted={wishlist.includes(tour.id)}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    </div>
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
