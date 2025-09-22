import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TourCard from '../components/tours/TourCard';
import TourFilters from '../components/tours/TourFilters';
import { Pagination } from '../components/ui';

interface Tour {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  location: string;
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
  }
];

const ToursListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tours, setTours] = useState<Tour[]>(mockTours);
  const [filteredTours, setFilteredTours] = useState<Tour[]>(mockTours);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
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
    location: searchParams.get('location') || ''
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

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
      location: ''
    });
  };

  const handleToggleWishlist = (tourId: number) => {
    setWishlist(prev => 
      prev.includes(tourId) 
        ? prev.filter(id => id !== tourId)
        : [...prev, tourId]
    );
  };

  // Pagination
  const totalPages = Math.ceil(filteredTours.length / toursPerPage);
  const startIndex = (currentPage - 1) * toursPerPage;
  const endIndex = startIndex + toursPerPage;
  const currentTours = filteredTours.slice(startIndex, endIndex);

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
                totalResults={filteredTours.length}
              />
            </div>
          </div>

          {/* Tours Content */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Đang tải tours...</p>
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
