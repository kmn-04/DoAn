import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClockIcon, FireIcon, TagIcon } from '@heroicons/react/24/outline';
import { Card, Button } from '../ui';

interface HotDeal {
  id: number;
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
}

const HotDeals: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{ [key: number]: string }>({});

  // Mock data cho hot deals
  const hotDeals: HotDeal[] = [
    {
      id: 1,
      title: 'Phu Quoc Beach Paradise - 3N2D',
      originalPrice: 2500000,
      discountPrice: 1500000,
      discountPercent: 40,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
      endDate: '2025-09-30T23:59:59',
      description: 'Tận hưởng bãi biển tuyệt đẹp với khu nghỉ dưỡng 4 sao',
      slug: 'phu-quoc-beach-paradise-3n2d',
      isLimited: true,
      soldCount: 45,
      totalCount: 50
    },
    {
      id: 2,
      title: 'Ha Long Bay Luxury Cruise - 2N1D',
      originalPrice: 3200000,
      discountPrice: 2200000,
      discountPercent: 31,
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop',
      endDate: '2025-09-25T23:59:59',
      description: 'Du thuyền sang trọng khám phá kỳ quan thiên nhiên',
      slug: 'ha-long-bay-luxury-cruise-2n1d',
      isLimited: false,
      soldCount: 28,
      totalCount: 30
    }
  ];

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

  return (
    <section className="py-12 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <FireIcon className="h-8 w-8 text-red-500" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Ưu Đại Sốc
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
