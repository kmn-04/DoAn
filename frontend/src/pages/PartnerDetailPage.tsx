import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// import { Helmet } from 'react-helmet-async';
import {
  StarIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  TicketIcon,
  ChevronLeftIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import type { Partner } from '../types';
import { TourCard } from '../components/tours';
import { Loading, Button, Card } from '../components/ui';

const PartnerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tours' | 'reviews'>('overview');

  // Mock data - Replace with API call
  const mockPartner: Partner = {
    id: 1,
    name: 'Saigon Tourist',
    slug: 'saigon-tourist',
    description: 'Công ty du lịch hàng đầu Việt Nam với hơn 30 năm kinh nghiệm trong ngành du lịch. Chúng tôi chuyên cung cấp các dịch vụ du lịch chất lượng cao, từ tour trong nước đến quốc tế, đáp ứng mọi nhu cầu của khách hàng từ du lịch gia đình, doanh nghiệp đến du lịch luxury.',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center',
    coverImage: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=600&fit=crop',
    website: 'https://saigontourist.net',
    phone: '028-3822-4987',
    email: 'info@saigontourist.net',
    address: 'TP. Hồ Chí Minh, Việt Nam',
    establishedYear: 1975,
    rating: 4.8,
    totalTours: 150,
    totalBookings: 25000,
    specialties: ['Du lịch văn hóa', 'Du lịch biển', 'Du lịch luxury', 'Du lịch gia đình', 'Du lịch doanh nghiệp'],
    tours: [
      {
        id: 1,
        title: 'Hạ Long Bay - Kỳ Quan Thế Giới',
        slug: 'ha-long-bay-ky-quan-the-gioi',
        description: 'Khám phá vẻ đẹp huyền bí của Vịnh Hạ Long với những hang động kỳ thú và cảnh quan thiên nhiên tuyệt đẹp',
        price: 6200000,
        originalPrice: 7500000,
        duration: 'Th 5, 15 thg 2',
        location: 'Quảng Ninh',
        images: ['https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'],
        rating: 4.9,
        totalReviews: 245,
        maxGroupSize: 20,
        difficulty: 'easy' as const,
        category: { id: 1, name: 'Du lịch biển', slug: 'du-lich-bien' },
        highlights: ['Thăm hang Sửng Sốt', 'Chèo kayak', 'Ngắm hoàng hôn trên vịnh'],
        includes: ['Xe đưa đón', 'Khách sạn 4*', 'Bữa ăn theo chương trình'],
        excludes: ['Chi phí cá nhân', 'Đồ uống có cồn'],
        itinerary: [],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      },
      {
        id: 2,
        title: 'Sapa - Thiên Đường Mây Trắng',
        slug: 'sapa-thien-duong-may-trang',
        description: 'Trải nghiệm vẻ đẹp hùng vĩ của núi rừng Tây Bắc và tìm hiểu văn hóa các dân tộc thiểu số',
        price: 3600000,
        originalPrice: 4200000,
        duration: 'Th 7, 20 thg 1',
        location: 'Lào Cai',
        images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'],
        rating: 4.7,
        totalReviews: 189,
        maxGroupSize: 15,
        difficulty: 'moderate' as const,
        category: { id: 2, name: 'Du lịch núi', slug: 'du-lich-nui' },
        highlights: ['Chinh phục đỉnh Fansipan', 'Thăm bản làng dân tộc', 'Ngắm ruộng bậc thang'],
        includes: ['Xe đưa đón', 'Khách sạn 3*', 'Hướng dẫn viên'],
        excludes: ['Vé cáp treo Fansipan', 'Chi phí cá nhân'],
        itinerary: [],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      if (slug === 'saigon-tourist') {
        setPartner(mockPartner);
      } else {
        setPartner(null);
      }
      setLoading(false);
    }, 1000);
  }, [slug]);

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i}>
          {i <= Math.floor(rating) ? (
            <StarIconSolid className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarIcon className="h-5 w-5 text-gray-300" />
          )}
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Loading />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BuildingOffice2Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đối tác</h1>
          <p className="text-gray-600 mb-4">Đối tác bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link to="/partners">
            <Button>
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Quay lại danh sách đối tác
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>

      <div className="min-h-screen bg-gray-50">
        {/* Back Button */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link 
              to="/partners"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Quay lại danh sách đối tác
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative">
          <div className="aspect-[3/1] overflow-hidden">
            <img
              src={partner.coverImage}
              alt={partner.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          
          {/* Partner Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end space-x-6">
                <div className="w-24 h-24 rounded-full bg-white p-2 shadow-lg">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="text-white">
                  <h1 className="text-4xl font-bold mb-2">{partner.name}</h1>
                  <div className="flex items-center space-x-4 text-white/90">
                    <div className="flex items-center space-x-1">
                      {renderStars(partner.rating)}
                      <span className="ml-2 font-medium">{partner.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>Từ {partner.establishedYear}</span>
                    </div>
                    <div className="flex items-center">
                      <TicketIcon className="h-4 w-4 mr-1" />
                      <span>{partner.totalTours} tours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex space-x-8 border-b border-gray-200 mb-8">
                {[
                  { key: 'overview', label: 'Tổng quan' },
                  { key: 'tours', label: `Tours (${partner.tours.length})` },
                  { key: 'reviews', label: 'Đánh giá' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as 'overview' | 'tours' | 'reviews')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Description */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Giới thiệu</h3>
                    <p className="text-gray-700 leading-relaxed">{partner.description}</p>
                  </Card>

                  {/* Specialties */}
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Chuyên môn</h3>
                    <div className="flex flex-wrap gap-2">
                      {partner.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </Card>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">{partner.totalTours}</div>
                      <div className="text-sm text-gray-600">Tours</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">{partner.totalBookings.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Lượt đặt</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600 mb-1">{partner.rating}</div>
                      <div className="text-sm text-gray-600">Đánh giá</div>
                    </Card>
                    <Card className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">{partner.establishedYear ? new Date().getFullYear() - partner.establishedYear : 'N/A'}</div>
                      <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'tours' && (
                <div className="space-y-6">
                  {partner.tours.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {partner.tours.map((tour) => (
                        <TourCard 
                          key={tour.id} 
                          tour={{
                            ...tour,
                            name: tour.title,
                            reviewCount: tour.totalReviews,
                            maxPeople: tour.maxGroupSize,
                            image: tour.images[0] || '',
                            category: tour.category.name
                          }} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TicketIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Chưa có tour nào
                      </h3>
                      <p className="text-gray-600">
                        Đối tác này chưa có tour du lịch nào được đăng tải.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <StarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Đánh giá sẽ sớm có mặt
                    </h3>
                    <p className="text-gray-600">
                      Tính năng đánh giá đối tác đang được phát triển.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
                <div className="space-y-3">
                  {partner.address && (
                    <div className="flex items-start">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{partner.address}</span>
                    </div>
                  )}
                  {partner.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <a href={`tel:${partner.phone}`} className="text-sm text-blue-600 hover:text-blue-700">
                        {partner.phone}
                      </a>
                    </div>
                  )}
                  {partner.email && (
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <a href={`mailto:${partner.email}`} className="text-sm text-blue-600 hover:text-blue-700">
                        {partner.email}
                      </a>
                    </div>
                  )}
                  {partner.website && (
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                      <a 
                        href={partner.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Website chính thức
                      </a>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Đánh giá trung bình</span>
                    <div className="flex items-center">
                      <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{partner.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng số tours</span>
                    <span className="text-sm font-medium">{partner.totalTours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Lượt đặt tour</span>
                    <span className="text-sm font-medium">{partner.totalBookings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Thành lập</span>
                    <span className="text-sm font-medium">{partner.establishedYear}</span>
                  </div>
                </div>
              </Card>

              {/* CTA */}
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quan tâm đến đối tác này?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Khám phá các tour du lịch tuyệt vời từ {partner.name}
                </p>
                <Button 
                  className="w-full"
                  onClick={() => setActiveTab('tours')}
                >
                  Xem tất cả tours
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerDetailPage;
