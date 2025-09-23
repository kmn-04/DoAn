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
      subtitle: 'Di sản thế giới UNESCO',
      description: 'Trải nghiệm vẻ đẹp huyền bí của Vịnh Hạ Long với những hang động kỳ thú và cảnh quan thiên nhiên tuyệt vời.',
      ctaText: 'Đặt Tour Ngay',
      ctaLink: '/tours?destination=ha-long'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1920&h=1080&fit=crop',
      title: 'Sapa Hùng Vĩ',
      subtitle: 'Núi rừng Tây Bắc',
      description: 'Chinh phục đỉnh Fansipan, khám phá văn hóa các dân tộc thiểu số và tận hưởng khí hậu mát mẻ.',
      ctaText: 'Khám Phá Sapa',
      ctaLink: '/tours?destination=sapa'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1920&h=1080&fit=crop',
      title: 'Phố Cổ Hội An',
      subtitle: 'Thành phố ánh đèn lồng',
      description: 'Dạo bước trên những con phố cổ kính, thưởng thức ẩm thực đặc sắc và mua sắm tại chợ đêm.',
      ctaText: 'Tour Hội An',
      ctaLink: '/tours?destination=hoi-an'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=1920&h=1080&fit=crop',
      title: 'Thiên Đường Phú Quốc',
      subtitle: 'Đảo ngọc miền Nam',
      description: 'Tắm biển tại bãi cát trắng, lặn ngắm san hô và thưởng thức hải sản tươi ngon.',
      ctaText: 'Đặt Tour Phú Quốc',
      ctaLink: '/tours?destination=phu-quoc'
    }
  ];

  // Auto slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

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
                
                {/* ✅ REMOVED: Smart Search Bar (redundant with header search) */}
                
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
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

      {/* Optional: Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center text-white/80">
          <span className="text-sm mb-2">Khám phá thêm</span>
          <div className="w-6 h-10 border-2 border-white/80 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/80 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;