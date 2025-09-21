import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { Card, Button, Pagination } from '../../components/ui';

interface WishlistTour {
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
  category: string;
  addedDate: string;
}

const mockWishlistTours: WishlistTour[] = [
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
    category: "beach",
    addedDate: "2024-01-20"
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
    category: "mountain",
    addedDate: "2024-01-18"
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
    category: "beach",
    addedDate: "2024-01-15"
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
    category: "culture",
    addedDate: "2024-01-12"
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
    category: "city",
    addedDate: "2024-01-10"
  }
];

const WishlistPage: React.FC = () => {
  const [tours, setTours] = useState<WishlistTour[]>([]);
  const [filteredTours, setFilteredTours] = useState<WishlistTour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'newest'
  });

  const toursPerPage = 6;

  useEffect(() => {
    // Simulate API call
    const fetchWishlist = async () => {
      setIsLoading(true);
      setTimeout(() => {
        setTours(mockWishlistTours);
        setIsLoading(false);
      }, 1000);
    };

    fetchWishlist();
  }, []);

  useEffect(() => {
    let filtered = [...tours];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(tour => 
        tour.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        tour.location.toLowerCase().includes(filters.search.toLowerCase()) ||
        tour.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(tour => tour.category === filters.category);
    }

    // Sort
    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.addedDate).getTime() - new Date(b.addedDate).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
    }

    setFilteredTours(filtered);
    setCurrentPage(1);
  }, [filters, tours]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRemoveFromWishlist = (tourId: number) => {
    setTours(prev => prev.filter(tour => tour.id !== tourId));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: 'all', sortBy: 'newest' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredTours.length / toursPerPage);
  const startIndex = (currentPage - 1) * toursPerPage;
  const endIndex = startIndex + toursPerPage;
  const currentTours = filteredTours.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <HeartSolidIcon className="h-8 w-8 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Tour yêu thích</h1>
        </div>
        <p className="text-gray-600">
          Danh sách các tour du lịch bạn đã lưu để xem sau ({tours.length} tour)
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2" />
            Bộ lọc và sắp xếp
          </h2>
          
          <div className="text-sm text-gray-600">
            Hiển thị {filteredTours.length} / {tours.length} tour
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm tour yêu thích..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả danh mục</option>
            <option value="beach">Tour Biển</option>
            <option value="mountain">Tour Núi</option>
            <option value="city">Tour Thành Phố</option>
            <option value="culture">Tour Văn Hóa</option>
          </select>

          {/* Sort */}
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Mới thêm nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="price-low">Giá thấp đến cao</option>
            <option value="price-high">Giá cao đến thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={clearFilters}
            className="whitespace-nowrap"
          >
            Xóa bộ lọc
          </Button>
        </div>
      </Card>

      {/* Tours Grid */}
      {currentTours.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentTours.map((tour) => (
              <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Link to={`/tours/${tour.slug}`}>
                    <img
                      src={tour.image}
                      alt={tour.name}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  
                  {/* Remove from wishlist */}
                  <button
                    onClick={() => handleRemoveFromWishlist(tour.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors group"
                    title="Xóa khỏi danh sách yêu thích"
                  >
                    <XMarkIcon className="h-4 w-4 text-gray-600 group-hover:text-red-500" />
                  </button>

                  {/* Discount */}
                  {tour.originalPrice && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      -{Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <Link to={`/tours/${tour.slug}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                      {tour.name}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {tour.description}
                  </p>

                  {/* Tour Details */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-3 w-3" />
                      <span>{tour.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UsersIcon className="h-3 w-3" />
                      <span>Max {tour.maxPeople}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-sm text-gray-900">{tour.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500">({tour.reviewCount} đánh giá)</span>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {tour.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(tour.originalPrice)}
                        </span>
                      )}
                      <span className="text-lg font-bold text-blue-600">
                        {formatPrice(tour.price)}
                      </span>
                    </div>

                    <Link
                      to={`/tours/${tour.slug}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Xem Chi Tiết
                    </Link>
                  </div>

                  {/* Added Date */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Đã thêm: {formatDate(tour.addedDate)}
                    </p>
                  </div>
                </div>
              </Card>
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
      ) : (
        /* Empty State */
        <Card className="p-12 text-center">
          <HeartIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filters.search || filters.category !== 'all'
              ? 'Không tìm thấy tour nào'
              : 'Chưa có tour yêu thích'
            }
          </h3>
          <p className="text-gray-600 mb-6">
            {filters.search || filters.category !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Hãy khám phá và lưu những tour du lịch yêu thích của bạn!'
            }
          </p>
          <div className="flex justify-center space-x-4">
            {(filters.search || filters.category !== 'all') && (
              <Button variant="outline" onClick={clearFilters}>
                Xóa bộ lọc
              </Button>
            )}
            <Link to="/tours">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Khám phá tours
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WishlistPage;
