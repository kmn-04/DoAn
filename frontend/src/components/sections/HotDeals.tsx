import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClockIcon, FireIcon, TagIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Card, Button } from '../ui';
import { tourService } from '../../services';
import type { PromotionResponse } from '../../services';

interface HotDeal {
  id: number;
  tourId: number;
  title: string;
  originalPrice: number;
  discountPrice: number;
  discountPercent: number;
  image: string;
  endDate: string;
  description: string;
  slug: string;
  isLimited: boolean;
  soldCount: number;
  totalCount: number;
  promotion: PromotionResponse;
}

const HotDeals: React.FC = () => {
  const navigate = useNavigate();
  const [hotDeals, setHotDeals] = useState<HotDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchHotDeals = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch featured tours
        const tours = await tourService.getFeaturedTours();

        // Filter tours with significant discount (>= 20%) and take first 6
        const deals: HotDeal[] = tours
          .filter(tour => {
            if (!tour.salePrice || tour.salePrice >= tour.price) return false;
            const discountPercent = ((tour.price - tour.salePrice) / tour.price) * 100;
            return discountPercent >= 20;
          })
          .slice(0, 6)
          .map((tour) => {
            const originalPrice = tour.price;
            const discountPrice = tour.salePrice || tour.price;
            const discountPercent = Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
            
            // Generate a realistic end date (7-14 days from now)
            const daysUntilEnd = Math.floor(Math.random() * 8) + 7; // 7-14 days
            const endDate = new Date(Date.now() + daysUntilEnd * 24 * 60 * 60 * 1000).toISOString();
            
            // Generate realistic sold count based on discount
            const maxUses = discountPercent >= 40 ? 50 : discountPercent >= 30 ? 70 : 100;
            const soldPercentage = 0.5 + Math.random() * 0.4; // 50-90%
            const soldCount = Math.floor(maxUses * soldPercentage);
            
            return {
              id: tour.id,
              tourId: tour.id,
              title: tour.name,
              originalPrice,
              discountPrice,
              discountPercent,
              image: tour.mainImage,
              endDate,
              description: tour.shortDescription || tour.description || 'Tour du lịch đặc sắc với ưu đãi hấp dẫn',
              slug: tour.slug,
              isLimited: maxUses <= 50, // Tours with high discount are limited
              soldCount,
              totalCount: maxUses,
              promotion: {} as PromotionResponse
            };
          });

        setHotDeals(deals);
      } catch (err) {
        console.error('Error fetching hot deals:', err);
        setError('Không thể tải ưu đãi. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotDeals();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: { [key: number]: string } = {};
      
      hotDeals.forEach(deal => {
        const now = new Date().getTime();
        const endTime = new Date(deal.endDate).getTime();
        const distance = endTime - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          newTimeLeft[deal.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        } else {
          newTimeLeft[deal.id] = 'Hết hạn';
        }
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [hotDeals]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ưu Đãi Sốc</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ưu Đãi Sốc</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (hotDeals.length === 0) {
    return (
      <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ưu Đãi Sốc</h2>
            <p className="text-gray-600">Hiện chưa có ưu đãi nào.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FireIcon className="h-8 w-8 text-red-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Ưu Đãi Sốc
            </h2>
            <FireIcon className="h-8 w-8 text-red-500" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Đừng bỏ lỡ những chương trình khuyến mãi giới hạn với mức giá không thể tin nổi!
          </p>
        </div>

        {/* Hot Deals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {hotDeals.map((deal) => (
            <Card key={deal.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 border-red-200">
              <div className="relative">
                {/* Deal Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={deal.image} 
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Discount Badge */}
                  <div className="absolute top-4 left-4">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center space-x-1">
                      <TagIcon className="h-4 w-4" />
                      <span>-{deal.discountPercent}%</span>
                    </div>
                  </div>

                  {/* Limited Badge */}
                  {deal.isLimited && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                        SỐ LƯỢNG CÓ HẠN
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                    <div className="flex justify-between text-white text-sm mb-2">
                      <span>Đã bán: {deal.soldCount}/{deal.totalCount}</span>
                      <span>{Math.round((deal.soldCount / deal.totalCount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/30 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(deal.soldCount / deal.totalCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Deal Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                    {deal.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {deal.description}
                  </p>

                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-red-600">
                          {formatPrice(deal.discountPrice)}
                        </span>
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(deal.originalPrice)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">/ người</span>
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div className="bg-red-100 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <ClockIcon className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-700">Kết thúc sau:</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600 font-mono">
                      {timeLeft[deal.id] || 'Đang tính...'}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link to={`/tours/${deal.slug}`}>
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-lg">
                      Đặt Ngay - Tiết Kiệm {deal.discountPercent}%
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Deals CTA */}
        <div className="text-center mt-12">
          <Link to="/tours?filter=deals">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg font-semibold rounded-xl">
              Xem Tất Cả Ưu Đãi
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HotDeals;
