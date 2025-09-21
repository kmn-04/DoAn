import React from 'react';
import { Link } from 'react-router-dom';
import { 
  StarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface TourCardProps {
  tour: {
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
    category?: string;
  };
  isWishlisted?: boolean;
  onToggleWishlist?: (tourId: number) => void;
}

const TourCard: React.FC<TourCardProps> = ({ 
  tour, 
  isWishlisted = false, 
  onToggleWishlist 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const discountPercentage = tour.originalPrice 
    ? Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      {/* Image Container */}
      <div className="relative">
        <Link to={`/tours/${tour.slug}`}>
          <img
            src={tour.image}
            alt={tour.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            onClick={() => onToggleWishlist(tour.id)}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            {isWishlisted ? (
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        )}

        {/* Badge */}
        {tour.badge && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            {tour.badge}
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            -{discountPercentage}%
          </div>
        )}

        {/* Category */}
        {tour.category && (
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs">
            {tour.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Tour Name */}
        <Link to={`/tours/${tour.slug}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {tour.name}
          </h3>
        </Link>

        {/* Description */}
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
      </div>
    </div>
  );
};

export default TourCard;
