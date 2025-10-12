import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  StarIcon, 
  PhotoIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { destinationService } from '../../services';
import type { PopularDestinationResponse } from '../../services';
import { DestinationCardSkeleton } from '../ui/Skeleton';

const PopularDestinations: React.FC = () => {
  const [destinations, setDestinations] = useState<PopularDestinationResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setIsLoading(true);
        const data = await destinationService.getPopularDestinations(4, 1); // Get top 4 destinations with min 1 tour
        setDestinations(data);
      } catch (err) {
        console.error('Error fetching destinations:', err);
        setError('Không thể tải điểm đến. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDestinations();
  }, []);
  

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Điểm Đến Phổ Biến
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <DestinationCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Điểm Đến Phổ Biến
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (destinations.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Điểm Đến Phổ Biến
            </h2>
            <p className="text-gray-600">Chưa có điểm đến nào.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-up opacity-0 delay-100">
          <div className="inline-block px-8 py-3 border border-slate-800 rounded-none mb-6">
            <span className="text-slate-900 font-medium text-base tracking-[0.3em] uppercase">Điểm Đến Phổ Biến</span>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Khám phá những điểm đến được yêu thích nhất với trải nghiệm tuyệt vời
          </p>
        </div>

        {/* Popular Destinations - Large Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up opacity-0 delay-200">
          {destinations.map((destination, index) => (
            <Link
              key={index}
              to={`/tours?location=${encodeURIComponent(destination.name)}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white border border-stone-200 hover:border-slate-700">
                {/* Image */}
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Badge - Minimalist */}
                  <div className="absolute top-6 left-6">
                    <div className="bg-amber-700 text-white px-3 py-1.5 rounded-none text-xs font-medium flex items-center space-x-2 tracking-wider uppercase shadow-lg">
                      <StarIcon className="h-3 w-3 fill-current" />
                      <span>Phổ Biến</span>
                    </div>
                  </div>

                  {/* Tour Count */}
                  <div className="absolute top-6 right-6">
                    <div className="bg-white text-gray-900 px-3 py-1.5 rounded-none text-xs font-medium flex items-center space-x-2 shadow-lg">
                      <PhotoIcon className="h-3 w-3" />
                      <span>{destination.tourCount} tours</span>
                    </div>
                  </div>

                  {/* Destination Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center space-x-2 mb-2 text-xs tracking-wider uppercase">
                      <MapPinIcon className="h-4 w-4" />
                      <span className="font-normal">{destination.country}</span>
                    </div>
                    <h3 className="text-2xl font-normal mb-3 tracking-tight">{destination.name}</h3>
                    
                    {/* Rating and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{destination.averageRating}</span>
                        <span className="text-gray-300">({destination.tourCount} tours)</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">Từ {formatPrice(destination.averagePrice)}</div>
                        <div className="text-sm text-gray-300">/ người</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Highlights */}
                  {destination.highlights && destination.highlights.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {destination.highlights.map((highlight, idx) => (
                          <span
                            key={idx}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-semibold group-hover:text-blue-700 transition-colors">
                      Khám phá {destination.name}
                    </span>
                    <ArrowRightIcon className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>


        {/* View All Destinations CTA */}
        <div className="text-center mt-20">
          <Link
            to="/destinations"
            className="inline-flex items-center bg-slate-900 text-white hover:bg-slate-800 px-8 py-3 rounded-none text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 border border-slate-900 hover:border-amber-600 group"
          >
            <span>Xem Tất Cả Điểm Đến</span>
            <ArrowRightIcon className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
