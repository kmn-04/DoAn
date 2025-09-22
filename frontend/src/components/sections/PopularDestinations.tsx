import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  StarIcon, 
  PhotoIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface Destination {
  id: number;
  name: string;
  country: string;
  slug: string;
  image: string;
  tourCount: number;
  averageRating: number;
  averagePrice: number;
  bestTime: string;
  highlights: string[];
  isPopular: boolean;
  climate: string;
}

const PopularDestinations: React.FC = () => {
  const destinations: Destination[] = [
    {
      id: 1,
      name: 'Phú Quốc',
      country: 'Việt Nam',
      slug: 'phu-quoc',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      tourCount: 24,
      averageRating: 4.8,
      averagePrice: 2500000,
      bestTime: 'Nov - Apr',
      highlights: ['Bãi biển tuyệt đẹp', 'Hải sản tươi ngon', 'Cáp treo Hòn Thơm'],
      isPopular: true,
      climate: 'Nhiệt đới'
    },
    {
      id: 2,
      name: 'Vịnh Hạ Long',
      country: 'Việt Nam',
      slug: 'ha-long-bay',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      tourCount: 32,
      averageRating: 4.9,
      averagePrice: 1800000,
      bestTime: 'Mar - May',
      highlights: ['Kỳ quan thiên nhiên', 'Du thuyền sang trọng', 'Hang động kỳ thú'],
      isPopular: true,
      climate: 'Cận nhiệt đới'
    },
    {
      id: 3,
      name: 'Sapa',
      country: 'Việt Nam',
      slug: 'sapa',
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=600&fit=crop',
      tourCount: 18,
      averageRating: 4.7,
      averagePrice: 2200000,
      bestTime: 'Sep - Nov',
      highlights: ['Ruộng bậc thang', 'Đỉnh Fansipan', 'Văn hóa dân tộc'],
      isPopular: true,
      climate: 'Ôn đới'
    },
    {
      id: 4,
      name: 'Hội An',
      country: 'Việt Nam',
      slug: 'hoi-an',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      tourCount: 21,
      averageRating: 4.8,
      averagePrice: 1500000,
      bestTime: 'Feb - Apr',
      highlights: ['Phố cổ độc đáo', 'Đèn lồng rực rỡ', 'Ẩm thực đặc sắc'],
      isPopular: true,
      climate: 'Nhiệt đới gió mùa'
    },
    {
      id: 5,
      name: 'Đà Lạt',
      country: 'Việt Nam',
      slug: 'da-lat',
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
      tourCount: 16,
      averageRating: 4.6,
      averagePrice: 1800000,
      bestTime: 'Dec - Mar',
      highlights: ['Khí hậu mát mẻ', 'Thác Elephant', 'Thung lũng tình yêu'],
      isPopular: false,
      climate: 'Ôn đới'
    },
    {
      id: 6,
      name: 'Bangkok',
      country: 'Thái Lan',
      slug: 'bangkok',
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&h=600&fit=crop',
      tourCount: 14,
      averageRating: 4.5,
      averagePrice: 8500000,
      bestTime: 'Nov - Feb',
      highlights: ['Chùa Vàng', 'Chợ nổi', 'Street food'],
      isPopular: false,
      climate: 'Nhiệt đới'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Filter only popular destinations
  const popularDestinations = destinations.filter(dest => dest.isPopular);

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Điểm Đến Phổ Biến
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá những điểm đến được yêu thích nhất với trải nghiệm tuyệt vời
          </p>
        </div>

        {/* Popular Destinations - Large Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {popularDestinations.map((destination) => (
            <Link
              key={destination.id}
              to={`/tours?destination=${destination.slug}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white border border-gray-200">
                {/* Image */}
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Popular Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                      <StarIcon className="h-4 w-4 fill-current" />
                      <span>Phổ biến</span>
                    </div>
                  </div>

                  {/* Tour Count */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <PhotoIcon className="h-4 w-4" />
                      <span>{destination.tourCount} tours</span>
                    </div>
                  </div>

                  {/* Destination Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPinIcon className="h-5 w-5" />
                      <span className="text-sm font-medium">{destination.country}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{destination.name}</h3>
                    
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
                  {/* Best Time & Climate */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>Thời gian tốt nhất: {destination.bestTime}</span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {destination.climate}
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {destination.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

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
        <div className="text-center mt-12">
          <Link
            to="/destinations"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-300"
          >
            <span>Xem Tất Cả Điểm Đến</span>
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularDestinations;
