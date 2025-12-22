import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { TourCardSkeleton } from '../ui/Skeleton';

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
  const { t, i18n } = useTranslation();
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
        setError(t('landing.featuredTours.errorMessage'));
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
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
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
              {t('landing.featuredTours.loadingTitle')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <TourCardSkeleton key={i} />
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
              {t('landing.featuredTours.errorTitle')}
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                {t('landing.featuredTours.reload')}
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
              {t('landing.featuredTours.title')}
            </h2>
            <p className="text-gray-600">{t('landing.featuredTours.emptyMessage')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-stone-50 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(15 23 42) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-up opacity-0">
          <div className="inline-block px-8 py-3 border border-slate-800 rounded-none mb-6">
            <span className="text-slate-900 font-medium text-base tracking-[0.3em] uppercase">{t('landing.featuredTours.badge')}</span>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            {t('landing.featuredTours.subtitle')}
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative group">
          {/* Navigation Buttons - Minimalist */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-none p-3 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 border border-gray-200 hover:border-gray-900"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-900" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-none p-3 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 border border-gray-200 hover:border-gray-900"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-900" />
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
                className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 flex-shrink-0 flex flex-col bg-white rounded-none border border-stone-200 hover:border-slate-700"
                onClick={(e) => handleCardClick(tour.slug, e)}
                style={{ width: '360px' }}
              >
                <div className="relative overflow-hidden">
                    {/* Tour Image */}
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={tour.mainImage}
                        alt={tour.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                    </div>
                  
                  {/* Badge - Minimalist */}
                  {tour.isNew && (
                    <div className="absolute top-4 left-4 bg-slate-900 text-white px-3 py-1.5 rounded-none text-xs font-medium tracking-wider uppercase">
                      {t('landing.featuredTours.new')}
                    </div>
                  )}
                  {tour.isFeatured && !tour.isNew && (
                    <div className="absolute top-4 left-4 bg-amber-700 text-white px-3 py-1.5 rounded-none text-xs font-medium tracking-wider uppercase">
                      {t('landing.featuredTours.badge')}
                    </div>
                  )}

                  {/* Price - Clean Style */}
                  <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-none shadow-lg border border-gray-200">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(tour.effectivePrice || tour.salePrice || tour.price)}
                    </div>
                    {tour.salePrice && tour.salePrice < tour.price && (
                      <div className="text-xs line-through text-gray-500">
                        {formatPrice(tour.price)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  {/* Tour Name */}
                  <Link to={`/tours/${tour.slug}`}>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 hover:text-gray-600 transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                      {tour.name}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-gray-500 text-sm mb-5 line-clamp-2 min-h-[2.5rem] leading-relaxed font-normal">
                    {tour.shortDescription || tour.description}
                  </p>

                  {/* Tour Details */}
                  <div className="flex gap-4 text-xs text-gray-600 mb-5">
                    <div className="flex items-center space-x-1.5">
                      <MapPinIcon className="h-4 w-4" />
                      <span className="font-normal">{tour.destination || tour.region || t('landing.featuredTours.international')}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <ClockIcon className="h-4 w-4" />
                      <span className="font-normal">{tour.duration} {t('landing.featuredTours.days')}</span>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1"></div>

                  {/* Rating & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <StarIcon className="h-4 w-4 text-gray-900 fill-gray-900" />
                      <span className="text-sm font-medium text-gray-900">{tour.averageRating?.toFixed(1) || '5.0'}</span>
                      <span className="text-xs text-gray-400">({tour.totalReviews || 0})</span>
                    </div>

                    <Link
                      to={`/tours/${tour.slug}`}
                      className="text-xs font-medium text-gray-900 hover:text-gray-600 tracking-wider uppercase transition-colors duration-300 flex items-center space-x-1 group"
                    >
                      <span>{t('landing.featuredTours.view')}</span>
                      <ChevronRightIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View All Button - Minimalist */}
        <div className="text-center mt-20">
          <Link
            to="/tours"
            className="inline-flex items-center bg-slate-900 text-white hover:bg-slate-800 px-8 py-3 rounded-none text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 border border-slate-900 hover:border-amber-600 group"
          >
            <span>{t('landing.featuredTours.exploreAll')}</span>
            <ChevronRightIcon className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTours;
