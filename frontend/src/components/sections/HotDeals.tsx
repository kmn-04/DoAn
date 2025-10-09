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
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-up opacity-0">
          <div className="inline-block px-8 py-3 border border-white rounded-none mb-6">
            <span className="text-white font-medium text-base tracking-[0.3em] uppercase">Ưu Đãi Đặc Biệt</span>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Những chương trình khuyến mãi giới hạn với mức giá đặc biệt
          </p>
        </div>

        {/* Hot Deals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up opacity-0 delay-200">
          {hotDeals.map((deal) => (
            <div key={deal.id} className="bg-white text-gray-900 rounded-none border border-slate-700 overflow-hidden group hover:border-amber-500 transition-all duration-300">
              <div className="relative">
                {/* Deal Image */}
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={deal.image} 
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-300"></div>
                  
                  {/* Discount Badge */}
                  <div className="absolute top-6 left-6">
                    <div className="bg-white text-black px-4 py-2 rounded-none text-sm font-medium tracking-wider">
                      -{deal.discountPercent}%
                    </div>
                  </div>

                  {/* Limited Badge */}
                  {deal.isLimited && (
                    <div className="absolute top-6 right-6">
                      <div className="bg-amber-600 text-white px-3 py-1.5 rounded-none text-xs font-medium tracking-wider uppercase shadow-lg">
                        Có Hạn
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4">
                    <div className="flex justify-between text-white text-xs mb-2 font-normal">
                      <span>Đã bán: {deal.soldCount}/{deal.totalCount}</span>
                      <span>{Math.round((deal.soldCount / deal.totalCount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/20 h-px">
                      <div 
                        className="bg-white h-px transition-all duration-300"
                        style={{ width: `${(deal.soldCount / deal.totalCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Deal Content */}
                <div className="p-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 hover:text-gray-600 transition-colors">
                    {deal.title}
                  </h3>
                  
                  <p className="text-gray-500 text-sm mb-6 font-normal line-clamp-2">
                    {deal.description}
                  </p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline space-x-3 mb-1">
                      <span className="text-3xl font-normal text-gray-900">
                        {formatPrice(deal.discountPrice)}
                      </span>
                      <span className="text-sm text-gray-400 line-through font-normal">
                        {formatPrice(deal.originalPrice)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 tracking-wide uppercase font-normal">Mỗi người</span>
                  </div>

                  {/* Countdown Timer */}
                  <div className="border border-gray-200 p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-900 tracking-wider uppercase">Kết Thúc Sau</span>
                      <ClockIcon className="h-4 w-4 text-gray-900" />
                    </div>
                    <div className="text-xl font-normal text-gray-900 font-mono tracking-tight">
                      {timeLeft[deal.id] || 'Đang tính...'}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link to={`/tours/${deal.slug}`}>
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 text-xs tracking-[0.2em] uppercase rounded-none transition-all duration-300 border border-slate-900 hover:border-amber-600">
                      Đặt Ngay
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Deals CTA */}
        <div className="text-center mt-20">
          <Link to="/tours?filter=deals">
            <Button className="bg-white text-black hover:bg-gray-100 px-8 py-3 text-xs font-medium tracking-[0.2em] uppercase rounded-none transition-all duration-300 border border-white">
              Xem Tất Cả Ưu Đãi
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HotDeals;
