import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  StarIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon
} from '@heroicons/react/24/solid';
import { Card } from '../ui';

interface Tour {
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
}

// Mock data - sẽ thay bằng API call
const mockTours: Tour[] = [
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
    badge: "Bán chạy"
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
    badge: "Mới"
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
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"
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
    image: "https://images.unsplash.com/photo-1555618254-74e3f7d4f9b8?w=800"
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
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
  }
];

const FeaturedTours: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const toursPerSlide = 3;
  const maxSlides = Math.ceil(mockTours.length / toursPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % maxSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const currentTours = mockTours.slice(
    currentSlide * toursPerSlide,
    (currentSlide + 1) * toursPerSlide
  );

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tour Du Lịch Nổi Bật
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá những điểm đến tuyệt vời nhất Việt Nam với các tour du lịch được yêu thích nhất
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
            disabled={currentSlide === 0}
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow"
            disabled={currentSlide === maxSlides - 1}
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-600" />
          </button>

          {/* Tours Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentTours.map((tour) => (
              <Card key={tour.id} className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative">
                  {/* Tour Image */}
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Badge */}
                  {tour.badge && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {tour.badge}
                    </div>
                  )}

                  {/* Price */}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg">
                    <div className="text-sm font-bold">{formatPrice(tour.price)}</div>
                    {tour.originalPrice && (
                      <div className="text-xs line-through text-gray-300">
                        {formatPrice(tour.originalPrice)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {/* Tour Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {tour.name}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {tour.description}
                  </p>

                  {/* Tour Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{tour.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span>{tour.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <UsersIcon className="h-4 w-4" />
                      <span>Max {tour.maxPeople}</span>
                    </div>
                  </div>

                  {/* Rating & Reviews */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{tour.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">({tour.reviewCount} đánh giá)</span>
                    </div>

                    <Link
                      to={`/tours/${tour.slug}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Xem Chi Tiết
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {Array.from({ length: maxSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
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
