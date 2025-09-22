import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui';

interface BannerSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Banner slides data
  const slides: BannerSlide[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop',
      title: 'Khám Phá Vịnh Hạ Long',
      subtitle: 'Kỳ quan thiên nhiên thế giới',
      description: 'Trải nghiệm vẻ đẹp huyền bí của Vịnh Hạ Long với những hang động kỳ thú và cảnh quan thiên nhiên tuyệt đẹp',
      ctaText: 'Khám phá ngay',
      ctaLink: '/tours'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1920&h=1080&fit=crop',
      title: 'Sapa - Thiên Đường Mù Cang Chải',
      subtitle: 'Ruộng bậc thang đẹp nhất Việt Nam',
      description: 'Chinh phục đỉnh Fansipan và khám phá văn hóa độc đáo của các dân tộc thiểu số',
      ctaText: 'Đặt tour ngay',
      ctaLink: '/tours'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop',
      title: 'Phú Quốc - Đảo Ngọc',
      subtitle: 'Thiên đường biển đảo',
      description: 'Tận hưởng những bãi biển trong xanh, hải sản tươi ngon và làng chài bình dị',
      ctaText: 'Xem chi tiết',
      ctaLink: '/tours'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
      title: 'Hội An - Phố Cổ',
      subtitle: 'Di sản văn hóa thế giới',
      description: 'Lạc lối trong những con phố cổ kính với đèn lồng rực rỡ và kiến trúc truyền thống',
      ctaText: 'Khởi hành ngay',
      ctaLink: '/tours'
    }
  ];

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Banner Slides */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
            
            {/* Content */}
            <div className="relative h-full flex items-center justify-center text-white">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-sm md:text-base font-medium text-blue-200 mb-4 tracking-wider uppercase">
                  {slide.subtitle}
                </h2>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                  {slide.description}
                </p>
                <Link to={slide.ctaLink}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    {slide.ctaText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-10"
      >
        <ChevronLeftIcon className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-10"
      >
        <ChevronRightIcon className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Quick Stats Overlay */}
      <div className="absolute bottom-20 left-8 hidden lg:block">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">500+</div>
              <div className="text-sm text-gray-200">Tour du lịch</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">10K+</div>
              <div className="text-sm text-gray-200">Khách hàng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">5⭐</div>
              <div className="text-sm text-gray-200">Đánh giá</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;