import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { bannerService } from '../../services';
import type { Banner } from '../../services';

const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active banners from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const data = await bannerService.getActiveBanners();
        setBanners(data);
      } catch (error) {
        console.error('Error fetching banners:', error);
        // Fallback to default banner if API fails
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Fallback banner if no banners from API
  const defaultBanner: Banner = {
    id: 0,
    title: 'Khám Phá Thế Giới Cùng Chúng Tôi',
    subtitle: 'Những chuyến đi đáng nhớ đang chờ đón bạn',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&h=1080&fit=crop',
    linkUrl: '/tours',
    buttonText: 'Xem Tours',
    displayOrder: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const displayBanners = banners.length > 0 ? banners : [defaultBanner];

  // Auto slide functionality
  useEffect(() => {
    if (displayBanners.length <= 1) return; // Don't auto-slide if only 1 banner
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [displayBanners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % displayBanners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + displayBanners.length) % displayBanners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (isLoading) {
    return (
      <section className="relative h-screen overflow-hidden bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </section>
    );
  }

  // Get current banner to display
  const currentBanner = displayBanners[currentSlide];
  const bannerLink = currentBanner?.linkUrl || '/tours';
  const bannerText = currentBanner?.buttonText || 'Xem Tours';

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Banner Slides - Only render current banner */}
      <div className="relative h-full">
        <div className="absolute inset-0">
          {/* Background Image with Parallax Effect */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105 hover:scale-110"
            style={{ 
              backgroundImage: `url(${currentBanner?.imageUrl})`,
              filter: 'brightness(0.9)'
            }}
          />
          
          {/* Elegant Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-gray-900/30 to-black/50" />
          
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white rounded-full filter blur-[120px]"></div>
          </div>
          
          {/* Content with Glass Effect */}
          <div className="relative h-full flex items-center justify-center text-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {/* Minimalist Elegant Container */}
              <div className="max-w-4xl">
                {currentBanner?.subtitle && (
                  <div className="text-xs md:text-sm font-medium text-gray-300 mb-6 tracking-[0.3em] uppercase animate-fade-in-up opacity-0 delay-100 inline-block px-5 py-2 border border-white/20 rounded-sm">
                    {currentBanner.subtitle}
                  </div>
                )}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal mb-8 leading-tight text-white animate-fade-in-up opacity-0 delay-200 tracking-tight">
                  {currentBanner?.title}
                </h1>
                
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mb-8 mx-auto animate-fade-in-up opacity-0 delay-250"></div>
                
                <p className="text-base md:text-lg text-gray-300 mb-12 max-w-2xl mx-auto font-normal leading-relaxed animate-fade-in-up opacity-0 delay-300">
                  Trải nghiệm những điều kỳ diệu trên khắp thế giới với dịch vụ chuyên nghiệp
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up opacity-0 delay-400">
                  <Link to={bannerLink}>
                    <Button className="bg-white text-gray-900 hover:bg-gray-100 px-10 py-4 text-sm font-semibold tracking-wider uppercase rounded-none shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/10">
                      {bannerText}
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button className="bg-transparent hover:bg-white/5 backdrop-blur-sm text-white px-10 py-4 text-sm font-semibold tracking-wider uppercase rounded-none border border-white/30 hover:border-white/50 transition-all duration-300">
                      Về chúng tôi
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Minimalist */}
      {displayBanners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-8 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-3 rounded-none border border-white/10 hover:border-white/30 transition-all duration-300 z-10 group"
          >
            <ChevronLeftIcon className="h-6 w-6 group-hover:-translate-x-1 transition-transform duration-300" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white p-3 rounded-none border border-white/10 hover:border-white/30 transition-all duration-300 z-10 group"
          >
            <ChevronRightIcon className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </button>

          {/* Slide Indicators - Minimalist */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
            {displayBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-0.5 transition-all duration-500 ${
                  index === currentSlide 
                    ? 'bg-white w-16' 
                    : 'bg-white/30 hover:bg-white/50 w-8'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Scroll Down Indicator - Minimalist */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <div className="flex flex-col items-center text-white/70">
          <span className="text-xs font-normal mb-3 tracking-[0.2em] uppercase">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/70 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;