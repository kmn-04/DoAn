import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BeakerIcon,
  BuildingLibraryIcon,
  FireIcon,
  HeartIcon,
  HomeIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { categoryService } from '../../services';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  tourCount?: number;
}

// Icon mapping for categories
const iconMap: Record<string, React.ComponentType<any>> = {
  beach: BeakerIcon,
  culture: BuildingLibraryIcon,
  adventure: FireIcon,
  family: HeartIcon,
  domestic: HomeIcon,
  luxury: SparklesIcon,
  budget: CurrencyDollarIcon,
  weekend: CalendarDaysIcon,
};

// Color mapping for categories
const colorMap: Record<string, { text: string; bg: string }> = {
  beach: { text: 'text-blue-600', bg: 'bg-blue-50 hover:bg-blue-100' },
  culture: { text: 'text-purple-600', bg: 'bg-purple-50 hover:bg-purple-100' },
  adventure: { text: 'text-red-600', bg: 'bg-red-50 hover:bg-red-100' },
  family: { text: 'text-pink-600', bg: 'bg-pink-50 hover:bg-pink-100' },
  domestic: { text: 'text-green-600', bg: 'bg-green-50 hover:bg-green-100' },
  luxury: { text: 'text-yellow-600', bg: 'bg-yellow-50 hover:bg-yellow-100' },
  budget: { text: 'text-orange-600', bg: 'bg-orange-50 hover:bg-orange-100' },
  weekend: { text: 'text-indigo-600', bg: 'bg-indigo-50 hover:bg-indigo-100' },
};

// Default image mapping
const imageMap: Record<string, string> = {
  beach: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  culture: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=300&fit=crop',
  adventure: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  family: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
  domestic: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  luxury: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=300&fit=crop',
  budget: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
  weekend: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
};

const BrowseByCategory: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Không thể tải danh mục. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400; // Scroll by ~1.5 card width
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1;
    
    // Mark as moved if dragged more than 5px
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    setTimeout(() => setHasMoved(false), 100);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.touches[0].pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1;
    
    // Mark as moved if dragged more than 5px
    if (Math.abs(walk) > 5) {
      setHasMoved(true);
    }
    
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setTimeout(() => setHasMoved(false), 100);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Khám Phá Theo Chủ Đề
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Khám Phá Theo Chủ Đề
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg mx-auto">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Tải lại
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Khám Phá Theo Chủ Đề
            </h2>
            <p className="text-gray-600">Chưa có danh mục nào.</p>
          </div>
        </div>
      </section>
    );
  }

  const mockCategories = [
    {
      id: 1,
      name: 'Tour Biển Đảo',
      slug: 'beach',
      icon: BeakerIcon,
      tourCount: 45,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      description: 'Nghỉ dưỡng bãi biển tuyệt đẹp',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      id: 2,
      name: 'Tour Văn Hóa',
      slug: 'culture',
      icon: BuildingLibraryIcon,
      tourCount: 38,
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=300&fit=crop',
      description: 'Khám phá di sản văn hóa',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      id: 3,
      name: 'Tour Mạo Hiểm',
      slug: 'adventure',
      icon: FireIcon,
      tourCount: 32,
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
      description: 'Trải nghiệm phiêu lưu thú vị',
      color: 'text-red-600',
      bgColor: 'bg-red-50 hover:bg-red-100'
    },
    {
      id: 4,
      name: 'Tour Gia Đình',
      slug: 'family',
      icon: HeartIcon,
      tourCount: 28,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      description: 'Vui chơi cùng gia đình',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 hover:bg-pink-100'
    },
    {
      id: 5,
      name: 'Tour Trong Nước',
      slug: 'domestic',
      icon: HomeIcon,
      tourCount: 67,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      description: 'Khám phá Việt Nam xinh đẹp',
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100'
    },
    {
      id: 6,
      name: 'Tour Cao Cấp',
      slug: 'luxury',
      icon: SparklesIcon,
      tourCount: 15,
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=300&fit=crop',
      description: 'Trải nghiệm đẳng cấp 5 sao',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 hover:bg-yellow-100'
    },
    {
      id: 7,
      name: 'Tour Tiết Kiệm',
      slug: 'budget',
      icon: CurrencyDollarIcon,
      tourCount: 52,
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
      description: 'Giá tốt nhất thị trường',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100'
    },
    {
      id: 8,
      name: 'Tour Cuối Tuần',
      slug: 'weekend',
      icon: CalendarDaysIcon,
      tourCount: 41,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
      description: 'Nghỉ ngơi cuối tuần tuyệt vời',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100'
    }
  ];

  return (
    <section className="py-24 bg-stone-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20 animate-fade-in-up opacity-0">
          <div className="inline-block px-8 py-3 border border-slate-800 rounded-none mb-6">
            <span className="text-slate-900 font-medium text-base tracking-[0.3em] uppercase">Khám Phá Theo Chủ Đề</span>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Tìm kiếm tour phù hợp với sở thích và phong cách du lịch của bạn
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative group">
          {/* Navigation Buttons - Minimalist */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-none p-3 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 border border-gray-200 hover:border-gray-900"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-900" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white rounded-none p-3 shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 border border-gray-200 hover:border-gray-900"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-900" />
          </button>

          {/* Scrollable Categories */}
          <div 
            ref={scrollContainerRef}
            className={`flex gap-6 overflow-x-auto scrollbar-hide pb-4 select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
              scrollBehavior: isDragging ? 'auto' : 'smooth',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {categories.map((category) => {
              const IconComponent = iconMap[category.slug] || HomeIcon;
              const colors = colorMap[category.slug] || { text: 'text-gray-600', bg: 'bg-gray-50 hover:bg-gray-100' };
              const image = imageMap[category.slug] || imageMap.domestic;
              
              return (
                <div
                  key={category.id}
                  className="group flex-shrink-0 cursor-pointer"
                  style={{ width: '280px' }}
                  onClick={(e) => {
                    if (!hasMoved) {
                      navigate(`/tours?category=${category.slug}`);
                    }
                  }}
                >
                  <div className="relative overflow-hidden rounded-none bg-white border border-stone-200 hover:border-slate-700 transition-all duration-300 hover:shadow-lg h-full">
                  {/* Background Image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
                    
                    {/* Tour Count Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white text-gray-900 px-3 py-1.5 rounded-none text-xs font-medium shadow-lg">
                        {category.tourCount || 0} tours
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed font-normal h-12 overflow-hidden">
                      {category.description || `Khám phá các tour ${category.name.toLowerCase()}`}
                    </p>
                    
                    {/* Arrow Icon */}
                    <div className="mt-4 flex items-center space-x-2 text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="text-xs font-medium tracking-wider uppercase">
                        Khám Phá
                      </span>
                      <ChevronRightIcon className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* View All Categories CTA */}
        <div className="text-center mt-20">
          <Link
            to="/tours"
            className="inline-flex items-center bg-slate-900 text-white hover:bg-slate-800 px-8 py-3 rounded-none text-xs font-medium tracking-[0.2em] uppercase transition-all duration-300 border border-slate-900 hover:border-amber-600 group"
          >
            <span>Xem Tất Cả Tour</span>
            <ChevronRightIcon className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BrowseByCategory;
