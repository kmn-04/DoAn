import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import TourCard from '../components/tours/TourCard';
import TourFilters from '../components/tours/TourFilters';
import { Pagination, SkeletonTourCard } from '../components/ui';
import { tourService } from '../services';
import { useDebounce, useThrottle } from '../hooks/usePerformance';
import type { TourResponse, TourSearchRequest } from '../services';

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

// Extended mock data
const mockTours: Tour[] = [
  {
    id: 1,
    name: "Hạ Long Bay - Kỳ Quan Thế Giới",
    slug: "ha-long-bay-ky-quan-the-gioi",
    description: "Khám phá vẻ đẹp huyền bí của Vịnh Hạ Long với hàng ngàn đảo đá vôi kỳ thú",
    price: 2500000,
    originalPrice: 3000000,
    duration: "2 ngày 1 đêm",
    location: "Quảng Ninh",
    rating: 4.8,
    reviewCount: 245,
    maxPeople: 20,
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
    badge: "Bán chạy",
    category: "beach"
  },
  {
    id: 2,
    name: "Sapa - Thiên Đường Mây Trắng",
    slug: "sapa-thien-duong-may-trang",
    description: "Chinh phục đỉnh Fansipan và khám phá văn hóa độc đáo của các dân tộc thiểu số",
    price: 1800000,
    duration: "3 ngày 2 đêm",
    location: "Lào Cai",
    rating: 4.9,
    reviewCount: 189,
    maxPeople: 15,
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
    badge: "Mới",
    category: "mountain"
  },
  {
    id: 3,
    name: "Phú Quốc - Đảo Ngọc Xanh",
    slug: "phu-quoc-dao-ngoc-xanh",
    description: "Thư giãn tại những bãi biển tuyệt đẹp và thưởng thức hải sản tươi ngon",
    price: 3200000,
    duration: "4 ngày 3 đêm",
    location: "Kiên Giang",
    rating: 4.7,
    reviewCount: 312,
    maxPeople: 25,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    category: "beach"
  },
  {
    id: 4,
    name: "Hội An - Phố Cổ Thơ Mộng",
    slug: "hoi-an-pho-co-tho-mong",
    description: "Dạo bước trong phố cổ Hội An với những ngôi nhà cổ kính và đèn lồng rực rỡ",
    price: 1500000,
    duration: "2 ngày 1 đêm",
    location: "Quảng Nam",
    rating: 4.6,
    reviewCount: 156,
    maxPeople: 18,
    image: "https://images.unsplash.com/photo-1555618254-74e3f7d4f9b8?w=800",
    category: "culture"
  },
  {
    id: 5,
    name: "Đà Lạt - Thành Phố Ngàn Hoa",
    slug: "da-lat-thanh-pho-ngan-hoa",
    description: "Khám phá thành phố mộng mơ với khí hậu mát mẻ và cảnh quan lãng mạn",
    price: 1200000,
    duration: "3 ngày 2 đêm",
    location: "Lâm Đồng",
    rating: 4.5,
    reviewCount: 203,
    maxPeople: 20,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    category: "city"
  },
  {
    id: 6,
    name: "Nha Trang - Biển Xanh Cát Trắng",
    slug: "nha-trang-bien-xanh-cat-trang",
    description: "Tận hưởng kỳ nghỉ tuyệt vời tại bãi biển đẹp nhất miền Trung",
    price: 2800000,
    originalPrice: 3200000,
    duration: "4 ngày 3 đêm",
    location: "Khánh Hòa",
    rating: 4.4,
    reviewCount: 178,
    maxPeople: 30,
    image: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800",
    category: "beach"
  },
  {
    id: 7,
    name: "Mù Cang Chải - Ruộng Bậc Thang",
    slug: "mu-cang-chai-ruong-bac-thang",
    description: "Chiêm ngưỡng vẻ đẹp hùng vĩ của ruộng bậc thang mùa lúa chín",
    price: 1600000,
    duration: "2 ngày 1 đêm",
    location: "Yên Bái",
    rating: 4.7,
    reviewCount: 134,
    maxPeople: 16,
    image: "https://images.unsplash.com/photo-1586083702768-190ae093d34d?w=800",
    category: "mountain"
  },
  {
    id: 8,
    name: "Huế - Cố Đô Ngàn Năm",
    slug: "hue-co-do-ngan-nam",
    description: "Khám phá di sản văn hóa thế giới với những cung đình và lăng tẩm cổ kính",
    price: 1400000,
    duration: "2 ngày 1 đêm",
    location: "Thừa Thiên Huế",
    rating: 4.3,
    reviewCount: 167,
    maxPeople: 25,
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
    category: "culture"
  },
  // INTERNATIONAL TOURS
  {
    id: 9,
    name: "Tokyo - Osaka Kinh Điển",
    slug: "tokyo-osaka-kinh-dien", 
    description: "Khám phá hai thành phố biểu tượng của Nhật Bản với văn hóa truyền thống và hiện đại",
    price: 25000000,
    originalPrice: 28000000,
    duration: "7 ngày 6 đêm",
    location: "Tokyo - Osaka",
    tourType: "international",
    country: {
      name: "Nhật Bản",
      code: "JP",
      flagUrl: "https://flagcdn.com/w80/jp.png",
      visaRequired: false
    },
    flightIncluded: true,
    visaInfo: "Miễn visa 15 ngày cho hộ chiếu phổ thông",
    rating: 4.9,
    reviewCount: 342,
    maxPeople: 16,
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
    badge: "Hot",
    category: "culture"
  },
  {
    id: 10,
    name: "Seoul - Jeju Mùa Hoa Anh Đào",
    slug: "seoul-jeju-mua-hoa-anh-dao",
    description: "Trải nghiệm mùa hoa anh đào tuyệt đẹp và khám phá văn hóa K-pop hiện đại",
    price: 22000000,
    duration: "6 ngày 5 đêm",
    location: "Seoul - Đảo Jeju",
    tourType: "international",
    country: {
      name: "Hàn Quốc", 
      code: "KR",
      flagUrl: "https://flagcdn.com/w80/kr.png",
      visaRequired: false
    },
    flightIncluded: true,
    visaInfo: "Miễn visa 15 ngày cho hộ chiếu phổ thông",
    rating: 4.8,
    reviewCount: 287,
    maxPeople: 20,
    image: "https://images.unsplash.com/photo-1549693578-d683be217e58?w=800",
    badge: "Mới",
    category: "culture"
  },
  {
    id: 11,
    name: "Bangkok - Pattaya Thái Lan",
    slug: "bangkok-pattaya-thai-lan",
    description: "Tận hưởng cuộc sống sôi động Bangkok và bãi biển tuyệt đẹp Pattaya",
    price: 12000000,
    originalPrice: 14000000,
    duration: "5 ngày 4 đêm",
    location: "Bangkok - Pattaya",
    tourType: "international",
    country: {
      name: "Thái Lan",
      code: "TH", 
      flagUrl: "https://flagcdn.com/w80/th.png",
      visaRequired: false
    },
    flightIncluded: true,
    visaInfo: "Miễn visa 30 ngày cho hộ chiếu phổ thông",
    rating: 4.6,
    reviewCount: 456,
    maxPeople: 25,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    badge: "Giá tốt",
    category: "city"
  },
  {
    id: 12,
    name: "Singapore - Malaysia Liên Tuyến",
    slug: "singapore-malaysia-lien-tuyen",
    description: "Khám phá hai quốc gia Đông Nam Á với ẩm thực đa dạng và kiến trúc hiện đại",
    price: 18000000,
    duration: "6 ngày 5 đêm",
    location: "Singapore - Kuala Lumpur",
    tourType: "international",
    country: {
      name: "Singapore",
      code: "SG",
      flagUrl: "https://flagcdn.com/w80/sg.png", 
      visaRequired: false
    },
    flightIncluded: true,
    visaInfo: "Miễn visa 30 ngày cho hộ chiếu phổ thông",
    rating: 4.7,
    reviewCount: 198,
    maxPeople: 18,
    image: "https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800",
    category: "city"
  },
  {
    id: 13,
    name: "Paris - London Châu Âu",
    slug: "paris-london-chau-au",
    description: "Trải nghiệm nền văn minh châu Âu qua hai thủ đô lãng mạn và lịch sử",
    price: 45000000,
    originalPrice: 50000000,
    duration: "10 ngày 9 đêm",
    location: "Paris - London",
    tourType: "international",
    country: {
      name: "Pháp",
      code: "FR",
      flagUrl: "https://flagcdn.com/w80/fr.png",
      visaRequired: true
    },
    flightIncluded: true,
    visaInfo: "Cần visa Schengen. Hỗ trợ làm visa miễn phí",
    rating: 4.9,
    reviewCount: 145,
    maxPeople: 12,
    image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800",
    badge: "Cao cấp",
    category: "culture"
  },
  {
    id: 14,
    name: "Sydney - Melbourne Úc",
    slug: "sydney-melbourne-uc", 
    description: "Khám phá thiên đường châu Úc với cảnh quan thiên nhiên tuyệt đẹp và văn hóa độc đáo",
    price: 38000000,
    duration: "8 ngày 7 đêm",
    location: "Sydney - Melbourne",
    tourType: "international",
    country: {
      name: "Úc",
      code: "AU",
      flagUrl: "https://flagcdn.com/w80/au.png",
      visaRequired: true
    },
    flightIncluded: true,
    visaInfo: "Cần visa du lịch Úc. Hỗ trợ làm visa",
    rating: 4.8,
    reviewCount: 167,
    maxPeople: 14,
    image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800",
    category: "city"
  }
];

// Helper function to convert TourResponse to local Tour interface
const convertTourResponse = (tourResponse: TourResponse): Tour => {
  return {
    id: tourResponse.id,
    name: tourResponse.name,
    slug: tourResponse.slug,
    description: tourResponse.description,
    price: tourResponse.price,
    originalPrice: tourResponse.discountPrice,
    duration: `${tourResponse.duration} ngày`,
    location: tourResponse.location,
    tourType: tourResponse.tourType === 'DOMESTIC' ? 'domestic' : 'international',
    country: tourResponse.country ? {
      name: tourResponse.country.name,
      code: tourResponse.country.code,
      flagUrl: tourResponse.country.flagUrl,
      visaRequired: tourResponse.country.visaRequired
    } : undefined,
    flightIncluded: tourResponse.flightIncluded,
    visaInfo: tourResponse.visaInfo,
    rating: tourResponse.averageRating || 4.5,
    reviewCount: tourResponse.totalReviews || 0,
    maxPeople: tourResponse.maxParticipants,
    image: tourResponse.images?.[0]?.imageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    badge: tourResponse.isFeatured ? 'Hot' : undefined,
    category: tourResponse.category.slug
  };
};

const ToursListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState<Tour[]>([]);
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  
  const toursPerPage = 6;

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
    visaRequired: searchParams.get('visaRequired') === 'true',
    flightIncluded: searchParams.get('flightIncluded') === 'true'
  });

  // Fetch tours from API
  const fetchTours = useCallback(async () => {
    try {
      console.log('🚀 fetchTours called with filters:', filters);
      setIsLoading(true);
      
      // Build search request from filters
      const searchRequest: TourSearchRequest = {
        page: currentPage - 1, // API uses 0-based indexing
        size: toursPerPage,
        sortBy: filters.sortBy === 'popular' ? 'createdAt' : 
                filters.sortBy === 'price-low' ? 'price' :
                filters.sortBy === 'price-high' ? 'price' :
                filters.sortBy === 'rating' ? 'averageRating' :
                filters.sortBy === 'duration' ? 'duration' : 'createdAt',
        sortDirection: filters.sortBy === 'price-high' || filters.sortBy === 'rating' ? 'desc' : 'asc'
      };

      // Add filters
      if (filters.search) searchRequest.keyword = filters.search;
      if (filters.tourType) searchRequest.tourType = filters.tourType === 'domestic' ? 'DOMESTIC' : 'INTERNATIONAL';
      if (filters.continent) searchRequest.continent = filters.continent;
      if (filters.priceMin) searchRequest.minPrice = parseInt(filters.priceMin);
      if (filters.priceMax) searchRequest.maxPrice = parseInt(filters.priceMax);
      if (filters.rating) searchRequest.minRating = parseFloat(filters.rating);
      if (filters.visaRequired !== undefined) searchRequest.visaRequired = filters.visaRequired;
      if (filters.flightIncluded !== undefined) searchRequest.flightIncluded = filters.flightIncluded;

      console.log('📡 Calling tourService.getAllTours with params:', {
        page: searchRequest.page,
        size: searchRequest.size,
        sortBy: searchRequest.sortBy,
        sortDirection: searchRequest.sortDirection
      });
      const response = await tourService.getAllTours({
        page: searchRequest.page,
        size: searchRequest.size,
        sortBy: searchRequest.sortBy,
        sortDirection: searchRequest.sortDirection
      });
      console.log('✅ API Response:', response);
      
      // Convert API response to local format
      const convertedTours = response.content.map(convertTourResponse);
      console.log('🔄 Converted tours:', convertedTours);
      setTours(convertedTours);
      setFilteredTours(convertedTours);
      setTotalPages(response.totalPages);
      setTotalTours(response.totalElements);
      console.log('✅ State updated - tours count:', convertedTours.length);
      
    } catch (error) {
      console.error('❌ Error fetching tours:', error);
      console.log('🔄 Falling back to mock data');
      // Fallback to mock data on error
      setTours(mockTours);
      setFilteredTours(mockTours);
      setTotalPages(Math.ceil(mockTours.length / toursPerPage));
      setTotalTours(mockTours.length);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters, toursPerPage]);

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

  // Load tours when component mounts or filters change
  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  // Filter and sort tours
  useEffect(() => {
    let result = [...tours];

    // Apply filters
    if (filters.search) {
      result = result.filter(tour => 
        tour.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tour.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        tour.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category) {
      result = result.filter(tour => tour.category === filters.category);
    }

    if (filters.priceMin) {
      result = result.filter(tour => tour.price >= parseInt(filters.priceMin));
    }

    if (filters.priceMax) {
      result = result.filter(tour => tour.price <= parseInt(filters.priceMax));
    }

    if (filters.duration) {
      // Simple duration filter logic
      result = result.filter(tour => {
        const tourDuration = tour.duration;
        switch (filters.duration) {
          case '1':
            return tourDuration.includes('1 ngày');
          case '2-3':
            return tourDuration.includes('2 ngày') || tourDuration.includes('3 ngày');
          case '4-7':
            return tourDuration.includes('4 ngày') || tourDuration.includes('5 ngày') || 
                   tourDuration.includes('6 ngày') || tourDuration.includes('7 ngày');
          default:
            return true;
        }
      });
    }

    if (filters.rating) {
      result = result.filter(tour => tour.rating >= parseFloat(filters.rating));
    }

    // International tour filters
    if (filters.tourType) {
      result = result.filter(tour => {
        if (filters.tourType === 'domestic') {
          return !tour.tourType || tour.tourType === 'domestic';
        }
        return tour.tourType === filters.tourType;
      });
    }

    if (filters.continent && filters.tourType === 'international') {
      result = result.filter(tour => {
        if (!tour.country) return false;
        // Map continent to countries (simplified)
        const continentCountries: Record<string, string[]> = {
          'Asia': ['Nhật Bản', 'Hàn Quốc', 'Thái Lan', 'Singapore', 'Malaysia', 'Indonesia', 'Trung Quốc'],
          'Europe': ['Pháp', 'Đức', 'Ý', 'Tây Ban Nha', 'Anh'],
          'America': ['Mỹ', 'Canada', 'Brazil'],
          'Oceania': ['Úc', 'New Zealand']
        };
        return continentCountries[filters.continent]?.includes(tour.country.name);
      });
    }

    if (filters.country) {
      result = result.filter(tour => tour.country?.name === filters.country);
    }

    if (filters.visaRequired !== undefined && filters.tourType === 'international') {
      result = result.filter(tour => tour.country?.visaRequired === filters.visaRequired);
    }

    if (filters.flightIncluded !== undefined && filters.tourType === 'international') {
      result = result.filter(tour => tour.flightIncluded === filters.flightIncluded);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'duration':
        result.sort((a, b) => a.duration.localeCompare(b.duration));
        break;
      default: // popular
        result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    setFilteredTours(result);
    setCurrentPage(1);
  }, [filters, tours]);

  // Fetch tours when filters or page change
  useEffect(() => {
    fetchTours();
  }, [filters, currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // For display, use filteredTours directly since API handles pagination
  const currentTours = filteredTours;

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
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto">
              Khám phá vẻ đẹp Việt Nam với hơn {filteredTours.length} tour đa dạng từ biển đảo đến miền núi
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">{mockTours.length}+</div>
                <div className="text-base text-blue-100">Tours available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {Math.round(mockTours.reduce((sum, tour) => sum + tour.rating, 0) / mockTours.length * 10) / 10}⭐
                </div>
                <div className="text-base text-blue-100">Đánh giá trung bình</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {mockTours.reduce((sum, tour) => sum + tour.reviewCount, 0).toLocaleString()}+
                </div>
                <div className="text-base text-blue-100">Lượt đánh giá</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {new Set(mockTours.map(tour => tour.location)).size}+
                </div>
                <div className="text-base text-blue-100">Điểm đến</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-4">
              <TourFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                totalResults={totalTours}
              />
            </div>
          </div>

          {/* Tours Content */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 9 }).map((_, index) => (
                  <SkeletonTourCard key={index} />
                ))}
              </div>
            ) : filteredTours.length === 0 ? (
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
    </div>
  );
};

export default ToursListingPage;
