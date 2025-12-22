import React, { memo, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  StarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  HeartIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { TourCardSkeleton } from '../ui/Skeleton';
import { useTranslation } from 'react-i18next';

interface TourCardProps {
  tour: {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    originalPrice?: number;
    duration: string;
    durationValue?: number;
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
    badgeKey?: string;
    category?: string;
  };
  isWishlisted?: boolean;
  onToggleWishlist?: (tourId: number) => void;
  isLoading?: boolean;
}

const TourCard: React.FC<TourCardProps> = memo(({ 
  tour, 
  isWishlisted = false, 
  onToggleWishlist,
  isLoading = false
}) => {
  const { t } = useTranslation();
  // Show skeleton if loading
  if (isLoading) {
    return <TourCardSkeleton />;
  }
  // Memoize expensive calculations
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }, []);

  const discountPercentage = useMemo(() => {
    return tour.originalPrice 
      ? Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)
      : 0;
  }, [tour.originalPrice, tour.price]);

  // Memoize wishlist toggle handler
  const handleWishlistToggle = useCallback(() => {
    if (onToggleWishlist) {
      onToggleWishlist(tour.id);
    }
  }, [onToggleWishlist, tour.id]);

  const badgeLabel = tour.badge || (tour.badgeKey ? t(`tours.card.badges.${tour.badgeKey}`) : undefined);
  const durationLabel = tour.durationValue ? t('tours.card.durationDays', { count: tour.durationValue }) : tour.duration;
  const locationLabel = tour.tourType === 'international' && tour.country 
    ? tour.country.name 
    : tour.location || t('tours.card.locationFallback');
  const reviewLabel = t('tours.card.reviews', { count: tour.reviewCount });

  return (
    <div className="bg-white rounded-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col border border-stone-200 hover:border-slate-700">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link to={`/tours/${tour.slug}`}>
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </Link>
        
        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={handleWishlistToggle}
            className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-none hover:bg-white transition-all shadow-md hover:scale-110"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        )}

        {/* Badge */}
        {badgeLabel && (
          <div className="absolute top-4 left-4 text-white px-3 py-1.5 rounded-none text-xs font-medium tracking-wider uppercase shadow-lg" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
            {badgeLabel}
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 left-4 bg-slate-900 text-white px-3 py-1.5 rounded-none text-xs font-medium tracking-wider shadow-lg">
            -{discountPercentage}%
          </div>
        )}

        {/* Category */}
        {tour.category && (
          <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-none text-xs font-normal tracking-wide">
            {typeof tour.category === 'string' ? tour.category : tour.category.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Tour Name */}
        <Link to={`/tours/${tour.slug}`}>
          <h3 className="text-lg font-medium text-slate-900 mb-3 hover:text-slate-700 transition-colors line-clamp-2 min-h-[3.5rem] tracking-tight">
            {tour.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem] font-normal leading-relaxed">
          {tour.description}
        </p>

        {/* Tour Details */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-4 min-h-[3rem]">
          <div className="flex items-center space-x-1.5 font-normal">
            <MapPinIcon className="h-4 w-4 flex-shrink-0" style={{ color: '#D4AF37' }} />
            <span className="truncate">{locationLabel}</span>
          </div>
          <div className="flex items-center space-x-1.5 font-normal">
            <ClockIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
            <span>{durationLabel}</span>
          </div>
          <div className="flex items-center space-x-1.5 font-normal">
            <UsersIcon className="h-4 w-4" style={{ color: '#D4AF37' }} />
            <span>{t('tours.card.maxPeople', { count: tour.maxPeople })}</span>
          </div>
        </div>

        {/* International Tour Info */}
        {tour.tourType === 'international' && tour.country && (
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center space-x-1.5 bg-stone-100 text-slate-700 px-3 py-1.5 rounded-none text-xs font-normal">
              <GlobeAltIcon className="h-3.5 w-3.5" />
              <span>{tour.country.name}</span>
            </div>
            {tour.flightIncluded && (
              <div className="flex items-center space-x-1.5 text-white px-3 py-1.5 rounded-none text-xs font-normal shadow-md" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                <PaperAirplaneIcon className="h-3.5 w-3.5" />
                <span>{t('tours.card.flightIncluded')}</span>
              </div>
            )}
            {tour.country.visaRequired ? (
              <div className="flex items-center space-x-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-none text-xs font-normal">
                <DocumentTextIcon className="h-3.5 w-3.5" />
                <span>{t('tours.card.visaRequired')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 bg-stone-100 text-slate-700 px-3 py-1.5 rounded-none text-xs font-normal">
                <DocumentTextIcon className="h-3.5 w-3.5" />
                <span>{t('tours.card.visaNotRequired')}</span>
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4 min-h-[1.5rem]">
          <div className="flex items-center space-x-1">
            <StarIcon className="h-4 w-4 fill-current" style={{ color: '#D4AF37' }} />
            <span className="font-medium text-sm text-slate-900">{tour.rating}</span>
          </div>
          <span className="text-xs text-gray-500 font-normal">
            ({reviewLabel})
          </span>
        </div>

        {/* Spacer to push price & action to bottom */}
        <div className="flex-1"></div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-200">
          <div className="flex flex-col">
            {tour.originalPrice && (
              <span className="text-xs text-gray-400 line-through font-normal">
                {formatPrice(tour.originalPrice)}
              </span>
            )}
            <span className="text-xl font-normal text-slate-900 tracking-tight">
              {formatPrice(tour.price)}
            </span>
          </div>

          <Link
            to={`/tours/${tour.slug}`}
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-none text-xs font-medium tracking-wider uppercase transition-all duration-300 border border-slate-900 hover:shadow-lg"
            style={{ '--hover-border': '#D4AF37' } as React.CSSProperties}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D4AF37'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#0f172a'}
          >
            Chi Tiết
          </Link>
        </div>
      </div>
    </div>
  );
});

TourCard.displayName = 'TourCard';

export default TourCard;
