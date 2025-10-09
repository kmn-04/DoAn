import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
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
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col bg-white rounded-none border border-stone-200 hover:border-slate-700">
      <div className="relative">
        {/* Cover Image */}
        <div className="aspect-video overflow-hidden">
          {partner.images && partner.images.length > 0 ? (
            <img
              src={partner.images.find(img => img.imageType === 'cover')?.imageUrl || partner.images[0]?.imageUrl}
              alt={partner.images.find(img => img.imageType === 'cover')?.altText || partner.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center border-b border-stone-200">
              <span className="text-gray-400 text-sm font-normal">Không có ảnh</span>
            </div>
          )}
        </div>
        
        {/* Logo Overlay */}
        <div className="absolute -bottom-6 left-4 group-hover:scale-110 transition-transform duration-300">
          <div className="w-14 h-14 rounded-none bg-white shadow-lg border-2 overflow-hidden" style={{ borderColor: '#D4AF37' }}>
            {partner.images?.find(img => img.imageType === 'logo') ? (
              <img
                src={partner.images.find(img => img.imageType === 'logo')?.imageUrl}
                alt={partner.images.find(img => img.imageType === 'logo')?.altText || `${partner.name} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                <span className="text-gray-400 text-xs font-normal">Logo</span>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-none flex items-center justify-center hover:bg-white transition-all duration-200 group/heart shadow-md hover:shadow-lg border border-white/50"
        >
          {isFavorite ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-slate-600 group-hover/heart:text-red-500" />
          )}
        </button>
      </div>

      <div className="p-5 pt-8 flex-1 flex flex-col">
        {/* Partner Name & Description */}
        <div className="mb-4">
          <h3 className="text-xl font-medium text-slate-900 transition-colors mb-2 line-clamp-2 min-h-[3.5rem] tracking-tight group-hover:text-slate-700">
            <Link to={`/partners/${partner.slug}`}>
              {partner.name}
            </Link>
          </h3>
          <p className="text-sm text-gray-700 line-clamp-3 min-h-[4.5rem] font-normal leading-relaxed">
            {partner.description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 min-h-[3rem]">
          <div className="flex items-center space-x-2">
            <TicketIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
            <span className="font-normal">{partner.totalTours || 0} tours</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
            <span className="font-normal">Từ {partner.establishedYear || 'N/A'}</span>
          </div>
        </div>

        {/* Specialties */}
        <div className="mb-4 min-h-[2rem]">
          <div className="flex flex-wrap gap-2">
            {Array.isArray(partner.specialties) && partner.specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="inline-block bg-stone-100 text-slate-700 text-xs px-3 py-1.5 rounded-none border border-stone-200 font-normal"
              >
                {specialty}
              </span>
            ))}
            {Array.isArray(partner.specialties) && partner.specialties.length > 3 && (
              <span className="inline-block text-white text-xs px-3 py-1.5 rounded-none font-medium shadow-md" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                +{partner.specialties.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        {partner.address && (
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0" style={{ color: '#D4AF37' }} />
            <span className="truncate font-normal">{partner.address}</span>
          </div>
        )}

        {/* Website */}
        {partner.website && (
          <div className="mb-4">
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-gray-600 hover:text-slate-900 transition-colors font-normal"
              onClick={(e) => e.stopPropagation()}
            >
              <GlobeAltIcon className="h-5 w-5 mr-2" style={{ color: '#D4AF37' }} />
              <span>Website</span>
            </a>
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center space-x-2 mb-4 h-6">
          <div className="flex items-center space-x-2">
            <StarIconSolid className="h-5 w-5 fill-current" style={{ color: '#D4AF37' }} />
            <span className="font-semibold text-base text-slate-900">{partner.rating?.toFixed(1) || '0.0'}</span>
          </div>
          <span className="text-sm text-gray-600 font-normal">({(partner.totalBookings || 0).toLocaleString()} đánh giá)</span>
        </div>

        {/* Spacer to push price & action to bottom */}
        <div className="flex-1"></div>

        {/* Action Button */}
        <div className="pt-4 border-t border-stone-200">
          <Link
            to={`/partners/${partner.slug}`}
            className="w-full bg-slate-900 text-white px-6 py-3 rounded-none hover:bg-slate-800 transition-all duration-300 text-xs font-medium text-center block tracking-[0.2em] uppercase hover:shadow-lg border border-slate-900"
            onClick={(e) => e.stopPropagation()}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D4AF37';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1e293b';
            }}
          >
            Xem {partner.totalTours || 0} tours
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default PartnerCard;
