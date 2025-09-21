import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  StarIcon, 
  MapPinIcon, 
  GlobeAltIcon,
  CalendarIcon,
  TicketIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { Partner } from '../../types';
import { Card } from '../ui';

interface PartnerCardProps {
  partner: Partner;
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Add to favorites API call
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
      <div className="relative">
        {/* Cover Image */}
        <div className="aspect-video overflow-hidden">
          <img
            src={partner.coverImage}
            alt={partner.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Logo Overlay */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-12 h-12 rounded-full bg-white shadow-lg border-2 border-white overflow-hidden">
            <img
              src={partner.logo}
              alt={`${partner.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 group/heart"
        >
          {isFavorite ? (
            <HeartIconSolid className="h-4 w-4 text-red-500" />
          ) : (
            <HeartIcon className="h-4 w-4 text-gray-600 group-hover/heart:text-red-500" />
          )}
        </button>
      </div>

      <div className="p-4 pt-8 flex-1 flex flex-col">
        {/* Partner Name & Description */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            <Link to={`/partners/${partner.slug}`}>
              {partner.name}
            </Link>
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-3 min-h-[4.5rem]">
            {partner.description}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <TicketIcon className="h-4 w-4 mr-1" />
            <span>{partner.totalTours} tours</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Từ {partner.establishedYear}</span>
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {partner.specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
              >
                {specialty}
              </span>
            ))}
            {partner.specialties.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{partner.specialties.length - 3} khác
              </span>
            )}
          </div>
        </div>

        {/* Location & Website */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          {partner.address && (
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span className="truncate">{partner.address}</span>
            </div>
          )}
          {partner.website && (
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-blue-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <GlobeAltIcon className="h-4 w-4 mr-1" />
              <span>Website</span>
            </a>
          )}
        </div>

        {/* Spacer to push rating to bottom */}
        <div className="flex-1"></div>

        {/* Rating & CTA */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <StarIconSolid className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-gray-900">{partner.rating}</span>
            </div>
            <span className="text-sm text-gray-600">
              ({partner.totalBookings.toLocaleString()} đánh giá)
            </span>
          </div>
          <Link
            to={`/partners/${partner.slug}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Xem chi tiết →
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default PartnerCard;
