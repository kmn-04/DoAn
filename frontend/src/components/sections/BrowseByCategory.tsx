import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BeakerIcon,
  BuildingLibraryIcon,
  FireIcon,
  HeartIcon,
  HomeIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface TourCategory {
  id: number;
  name: string;
  slug: string;
  icon: React.ComponentType<any>;
  tourCount: number;
  image: string;
  description: string;
  color: string;
  bgColor: string;
}

const BrowseByCategory: React.FC = () => {
  const categories: TourCategory[] = [
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
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Khám Phá Theo Chủ Đề
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tìm kiếm tour phù hợp với sở thích và phong cách du lịch của bạn
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.id}
                to={`/tours?category=${category.slug}`}
                className="group"
              >
                <div className={`relative overflow-hidden rounded-2xl ${category.bgColor} border border-gray-200 transition-all duration-300 hover:shadow-lg hover:scale-105`}>
                  {/* Background Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300"></div>
                    
                    {/* Icon Overlay */}
                    <div className="absolute top-4 right-4">
                      <div className={`p-3 rounded-full bg-white/90 ${category.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                    </div>
                    
                    {/* Tour Count Badge */}
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {category.tourCount} tours
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className={`text-xl font-bold ${category.color} mb-2 group-hover:text-opacity-80 transition-colors`}>
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {category.description}
                    </p>
                    
                    {/* Hover Arrow */}
                    <div className="mt-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className={`text-sm font-medium ${category.color}`}>
                        Khám phá ngay
                      </span>
                      <svg className={`h-4 w-4 ${category.color} transform group-hover:translate-x-1 transition-transform`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Categories CTA */}
        <div className="text-center mt-12">
          <Link
            to="/tours"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-300"
          >
            <span>Xem Tất Cả Tour</span>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BrowseByCategory;
