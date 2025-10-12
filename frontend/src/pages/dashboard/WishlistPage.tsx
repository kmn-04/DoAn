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
import { Card, Button, Pagination, SkeletonTourCard } from '../../components/ui';
import { wishlistService } from '../../services';
import { useAuth } from '../../hooks/useAuth';
import type { WishlistItem } from '../../services/wishlistService';
import { toast } from 'react-hot-toast';

const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const [tours, setTours] = useState<WishlistItem[]>([]);
  const [filteredTours, setFilteredTours] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // 0-based indexing to match Pagination component
  
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    sortBy: 'newest'
  });

  const toursPerPage = 6;

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const wishlistItems = await wishlistService.getUserWishlist(user.id);
        setTours(wishlistItems);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast.error('Không thể tải danh sách yêu thích. Vui lòng thử lại sau.');
        setTours([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [user?.id]);

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
    setCurrentPage(0);
  }, [filters, tours]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRemoveFromWishlist = async (tourId: number, tourName: string) => {
    const confirmed = window.confirm(`Bạn có chắc muốn xóa "${tourName}" khỏi danh sách yêu thích?`);
    
    if (confirmed && user?.id) {
      try {
        await wishlistService.removeFromWishlist(user.id, tourId);
        setTours(prev => prev.filter(tour => tour.id !== tourId));
        toast.success(`Đã xóa "${tourName}" khỏi danh sách yêu thích`);
      } catch (error) {
        console.error('Error removing from wishlist:', error);
        toast.error('Không thể xóa tour khỏi danh sách yêu thích');
      }
    }
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

  // Pagination (0-based indexing)
  const totalPages = Math.ceil(filteredTours.length / toursPerPage);
  const startIndex = currentPage * toursPerPage;
  const endIndex = startIndex + toursPerPage;
  const currentTours = filteredTours.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="p-6">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        {/* Filters Skeleton */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 animate-pulse">
            <div className="flex-1 h-10 bg-gray-200 rounded"></div>
            <div className="w-40 h-10 bg-gray-200 rounded"></div>
            <div className="w-40 h-10 bg-gray-200 rounded"></div>
          </div>
        </Card>
        
        {/* Tours Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonTourCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-3 mb-2">
            <HeartSolidIcon className="h-8 w-8" style={{ color: '#D4AF37' }} />
            <h1 className="text-3xl font-normal text-slate-900 tracking-tight">Tour yêu thích</h1>
          </div>
          <p className="text-gray-600 font-normal">
            Danh sách các tour du lịch bạn đã lưu để xem sau ({tours.length} tour)
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6 bg-white border border-stone-200 rounded-none animate-fade-in-up opacity-0 delay-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h2 className="text-xl font-medium text-slate-900 flex items-center tracking-tight">
              <FunnelIcon className="h-5 w-5 mr-2" style={{ color: '#D4AF37' }} />
              Bộ lọc và sắp xếp
            </h2>
            
            <div className="text-sm font-normal" style={{ color: '#D4AF37' }}>
              Hiển thị {filteredTours.length} / {tours.length} tour
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5" style={{ color: '#D4AF37' }} />
              <input
                type="text"
                placeholder="Tìm tour yêu thích..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-stone-300 rounded-none px-3 py-2 focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300"
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
              className="border border-stone-300 rounded-none px-3 py-2 focus:ring-0 focus:border-slate-700 font-normal transition-all duration-300"
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
              className="whitespace-nowrap border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </Card>

      {/* Tours Grid */}
      {currentTours.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 items-stretch">
            {currentTours.map((tour, index) => (
              <Card key={tour.id} className="overflow-hidden bg-white border border-stone-200 rounded-none hover:border-slate-700 hover:shadow-lg transition-all duration-300 h-full flex flex-col stagger-animation opacity-0">
                <div className="relative">
                  <Link to={`/tours/${tour.slug}`} className="group">
                    <img
                      src={tour.image}
                      alt={tour.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                  
                  {/* Remove from wishlist */}
                  <button
                    onClick={() => handleRemoveFromWishlist(tour.id, tour.name)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-none hover:bg-white transition-colors group border border-stone-200"
                    title="Xóa khỏi danh sách yêu thích"
                  >
                    <XMarkIcon className="h-4 w-4 text-slate-600 group-hover:text-red-500 transition-colors duration-300" />
                  </button>

                  {/* Discount */}
                  {tour.originalPrice && (
                    <div className="absolute top-3 left-3 text-white px-2 py-1 rounded-none text-xs font-semibold" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                      -{Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <Link to={`/tours/${tour.slug}`}>
                    <h3 className="text-lg font-medium text-slate-900 mb-2 tracking-tight transition-colors line-clamp-2 min-h-[3.5rem]" style={{ hover: { color: '#D4AF37' } }}>
                      {tour.name}
                    </h3>
                  </Link>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] font-normal">
                    {tour.description}
                  </p>

                  {/* Tour Details */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-4 min-h-[3rem]">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
                      <span className="font-normal">{tour.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
                      <span className="font-normal">{tour.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UsersIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
                      <span className="font-normal">Max {tour.maxPeople}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-4 min-h-[1.5rem]">
                    <div className="flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 fill-current" style={{ color: '#D4AF37' }} />
                      <span className="font-medium text-sm text-slate-900">{tour.rating}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-normal">({tour.reviewCount} đánh giá)</span>
                  </div>

                  {/* Spacer to push price & action to bottom */}
                  <div className="flex-1"></div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      {tour.originalPrice && (
                        <span className="text-xs text-gray-400 line-through font-normal">
                          {formatPrice(tour.originalPrice)}
                        </span>
                      )}
                      <span className="text-xl font-normal" style={{ color: '#D4AF37' }}>
                        {formatPrice(tour.price)}
                      </span>
                    </div>

                    <Link
                      to={`/tours/${tour.slug}`}
                      className="text-white px-4 py-2 rounded-none text-sm font-medium transition-all duration-300 hover:opacity-90 tracking-wide" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                    >
                      Xem Chi Tiết
                    </Link>
                  </div>

                  {/* Added Date */}
                  <div className="mt-3 pt-3 border-t border-stone-200">
                    <p className="text-xs text-gray-500 font-normal">
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
        <Card className="p-12 text-center bg-white border border-stone-200 rounded-none">
          <HeartIcon className="mx-auto h-16 w-16 mb-4" style={{ color: '#D4AF37' }} />
          <h3 className="text-2xl font-normal text-slate-900 mb-2 tracking-tight">
            {filters.search || filters.category !== 'all'
              ? 'Không tìm thấy tour nào'
              : 'Chưa có tour yêu thích'
            }
          </h3>
          <p className="text-gray-600 mb-6 font-normal">
            {filters.search || filters.category !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Hãy khám phá và lưu những tour du lịch yêu thích của bạn!'
            }
          </p>
          <div className="flex justify-center space-x-4">
            {(filters.search || filters.category !== 'all') && (
              <Button variant="outline" onClick={clearFilters} className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none">
                Xóa bộ lọc
              </Button>
            )}
            <Link to="/tours">
              <Button className="text-white rounded-none hover:opacity-90 transition-all duration-300" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                Khám phá tours
              </Button>
            </Link>
          </div>
        </Card>
      )}
      </div>
    </div>
  );
};

export default WishlistPage;
