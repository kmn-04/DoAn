import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  StarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon
} from '@heroicons/react/24/solid';
import { Card } from '../ui';
import { tourService } from '../../services';

interface Tour {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  effectivePrice?: number;
  duration: number;
  destination?: string;
  region?: string;
  departureLocation?: string;
  averageRating?: number;
  totalReviews?: number;
  maxPeople?: number;
  mainImage: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

const FeaturedTours: React.FC = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    const fetchFeaturedTours = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await tourService.getFeaturedTours();
        setTours(data);
      } catch (err) {
        console.error('Error fetching featured tours:', err);
        setError('Không thể tải tour nổi bật. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedTours();
  }, []);

  const handleCardClick = (slug: string, e: React.MouseEvent) => {
    // Prevent navigation if user was dragging (moved more than 5px)
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Check if clicked element is a link (to avoid double navigation)
    const target = e.target as HTMLElement;
    if (target.tagName !== 'A' && !target.closest('a')) {
      navigate(`/tours/${slug}`);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; // Scroll by ~1 card width
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Multiply by 1 for smooth, controlled scroll
    
    // Mark as moved if dragged more than 5px
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    // Reset hasMoved after a short delay to allow click handler to check it
    setTimeout(() => setHasMoved(false), 100);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1; // Multiply by 1 for smooth, controlled scroll
    
    // Mark as moved if dragged more than 5px
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Reset hasMoved after a short delay to allow click handler to check it
    setTimeout(() => setHasMoved(false), 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tour Du Lịch Nổi Bật
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tour Du Lịch Nổi Bật
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Tải lại
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (tours.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tour Du Lịch Nổi Bật
            </h2>
            <p className="text-gray-600">Chưa có tour nổi bật nào.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tour Du Lịch Nổi Bật
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá những điểm đến tuyệt vời nhất Việt Nam với các tour du lịch được yêu thích nhất
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative group">
          {/* Navigation Buttons - Show on hover */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>

          {/* Scrollable Tours */}
          <div 
            ref={scrollContainerRef}
            className={`flex gap-6 overflow-x-auto scrollbar-hide pb-4 select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollBehavior: isDragging ? 'auto' : 'smooth',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {tours.map((tour) => (
              <div 
                key={tour.id} 
                className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow flex-shrink-0 flex flex-col bg-white rounded-xl border border-gray-200"
                onClick={(e) => handleCardClick(tour.slug, e)}
                style={{ width: '360px' }}
              >
                <div className="relative overflow-hidden rounded-t-xl">
                    {/* Tour Image */}
                    <img
                      src={tour.mainImage}
                      alt={tour.name}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  
                  {/* Badge */}
                  {tour.isNew && (
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Mới
                    </div>
                  )}
                  {tour.isFeatured && !tour.isNew && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Nổi bật
                    </div>
                  )}

                  {/* Price */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg">
                    <div className="text-sm font-bold">{formatPrice(tour.effectivePrice || tour.salePrice || tour.price)}</div>
                    {tour.salePrice && tour.salePrice < tour.price && (
                      <div className="text-xs line-through text-gray-300">
                        {formatPrice(tour.price)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  {/* Tour Name */}
                  <Link to={`/tours/${tour.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                      {tour.name}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {tour.shortDescription || tour.description}
                  </p>

                  {/* Tour Details */}
                  <div className="flex gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{tour.destination || tour.region || 'Việt Nam'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{tour.duration} ngày</span>
                    </div>
                  </div>

                  {/* Spacer to push rating & button to bottom */}
                  <div className="flex-1"></div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{tour.averageRating?.toFixed(1) || '5.0'}</span>
                      </div>
                      <span className="text-sm text-gray-500">({tour.totalReviews || 0} đánh giá)</span>
                    </div>

                    <Link
                      to={`/tours/${tour.slug}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Xem Chi Tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/tours"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Xem Tất Cả Tour Du Lịch
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTours;
