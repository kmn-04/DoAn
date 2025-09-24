import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { tourService } from '../../services';
import {
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
  ClockIcon,
  StarIcon,
  TagIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface TourDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: number;
  tourSlug?: string;
}

interface TourDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: number;
  location: string;
  averageRating: number;
  totalReviews: number;
  maxGroupSize: number;
  images: Array<{ imageUrl: string; imageType?: string }>;
  category: { name: string };
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
    activities?: string[];
  }>;
  isFeatured?: boolean;
}

export const TourDetailModal: React.FC<TourDetailModalProps> = ({
  isOpen,
  onClose,
  tourId,
  tourSlug
}) => {
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'includes'>('overview');
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen && tourId) {
      fetchTourDetail();
    }
  }, [isOpen, tourId, tourSlug]);

  const fetchTourDetail = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching tour detail for modal:', { tourId, tourSlug });
      
      let tourResponse;
      if (tourSlug) {
        // Try to get by slug first
        tourResponse = await tourService.getTourBySlug(tourSlug);
      } else {
        // Fallback to get by ID (need to implement this endpoint)
        tourResponse = await tourService.getTourById(tourId);
      }
      
      console.log('✅ Tour detail response:', tourResponse);
      
      // Map to TourDetail interface
      const mappedTour: TourDetail = {
        id: tourResponse.id,
        name: tourResponse.name,
        slug: tourResponse.slug,
        description: tourResponse.description || 'Khám phá tour tuyệt vời này',
        price: tourResponse.price,
        originalPrice: tourResponse.originalPrice,
        duration: tourResponse.duration,
        location: tourResponse.location,
        averageRating: tourResponse.averageRating || 0,
        totalReviews: tourResponse.totalReviews || 0,
        maxGroupSize: tourResponse.maxGroupSize || 20,
        images: tourResponse.images || [{ imageUrl: '/default-tour.jpg' }],
        category: tourResponse.category || { name: 'Tour' },
        highlights: tourResponse.highlights || [
          'Trải nghiệm tuyệt vời',
          'Dịch vụ chất lượng cao',
          'Hướng dẫn viên chuyên nghiệp'
        ],
        includes: tourResponse.includes || [
          'Xe du lịch đời mới, máy lạnh',
          'Khách sạn tiêu chuẩn',
          'Ăn theo chương trình',
          'Vé tham quan các điểm trong chương trình',
          'Hướng dẫn viên nhiệt tình',
          'Bảo hiểm du lịch'
        ],
        excludes: tourResponse.excludes || [
          'Vé máy bay đi/về điểm tập trung',
          'Chi phí cá nhân',
          'Phụ thu phòng đơn',
          'Tip cho hướng dẫn viên'
        ],
        itinerary: tourResponse.itinerary || [
          {
            day: 1,
            title: `Ngày 1: Khởi hành đến ${tourResponse.location}`,
            description: 'Bắt đầu hành trình khám phá',
            activities: ['Tập trung tại điểm hẹn', 'Khởi hành', 'Nhận phòng khách sạn']
          },
          {
            day: 2,
            title: `Ngày 2: Tham quan ${tourResponse.location}`,
            description: 'Khám phá những điểm đến tuyệt vời',
            activities: ['Tham quan các điểm nổi tiếng', 'Ăn trưa tại nhà hàng địa phương', 'Trở về']
          }
        ],
        isFeatured: tourResponse.isFeatured
      };
      
      setTour(mappedTour);
      
    } catch (error) {
      console.error('❌ Error fetching tour detail:', error);
      // Could show error message or fallback to basic info
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title=""
      showCloseButton={false}
      className="max-h-[95vh]"
    >
      <div className="relative max-h-[85vh] overflow-y-auto px-2">
        {/* Custom Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-3 bg-white/95 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 border border-gray-200"
        >
          <XMarkIcon className="h-5 w-5 text-gray-600 hover:text-gray-800" />
        </button>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" />
            <span className="ml-3 text-lg">Đang tải thông tin tour...</span>
          </div>
        ) : tour ? (
          <div className="space-y-8 pb-8 px-4">
            {/* Header */}
            <div className="pt-8">
              <div className="pr-16">
                <div className="flex items-center gap-2 mb-3">
                  {tour.isFeatured && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                      Nổi bật
                    </span>
                  )}
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                    {tour.category.name}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{tour.name}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {tour.location}
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {tour.duration} ngày
                  </div>
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 mr-1" />
                    Tối đa {tour.maxGroupSize} người
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl overflow-hidden">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={tour.images[activeImageIndex]?.imageUrl || '/default-tour.jpg'}
                  alt={tour.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tour.images.slice(1, 5).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index + 1)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImageIndex === index + 1 ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`${tour.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Price and Rating */}
            <div className="flex justify-between items-center py-4 border-t border-b">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-blue-600">
                    {formatPrice(tour.price)}
                  </span>
                  {tour.originalPrice && tour.originalPrice > tour.price && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(tour.originalPrice)}
                    </span>
                  )}
                  <span className="text-sm text-gray-600">/ người</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  {renderStars(tour.averageRating)}
                  <span className="text-sm font-medium text-gray-700 ml-1">
                    {tour.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {tour.totalReviews} đánh giá
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', label: 'Tổng quan' },
                  { id: 'itinerary', label: 'Lịch trình' },
                  { id: 'includes', label: 'Bao gồm' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Mô tả tour</h3>
                    <p className="text-gray-700 leading-relaxed text-base">{tour.description}</p>
                  </div>
                  
                  {tour.highlights && tour.highlights.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Điểm nổi bật</h3>
                      <ul className="space-y-2">
                        {tour.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start">
                            <TagIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'itinerary' && tour.itinerary && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Lịch trình chi tiết</h3>
                  
                  <div className="space-y-4">
                    {tour.itinerary.map((day) => {
                      const isExpanded = expandedDays[day.day] || false;
                      
                      return (
                        <div key={day.day} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                {day.day}
                              </div>
                              <h4 className="font-semibold text-gray-900 text-lg">{day.title}</h4>
                            </div>
                            {day.activities && day.activities.length > 0 && (
                              <button
                                onClick={() => setExpandedDays(prev => ({ ...prev, [day.day]: !isExpanded }))}
                                className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUpIcon className="h-4 w-4" />
                                    Thu gọn
                                  </>
                                ) : (
                                  <>
                                    <ChevronDownIcon className="h-4 w-4" />
                                    Chi tiết
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-4 leading-relaxed">{day.description}</p>
                          
                          {day.activities && day.activities.length > 0 && isExpanded && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h5 className="font-medium text-gray-900 mb-2">Hoạt động trong ngày:</h5>
                              <ul className="space-y-2">
                                {day.activities.map((activity, index) => (
                                  <li key={index} className="flex items-start text-sm text-gray-600">
                                    <span className="text-blue-500 mr-2 mt-1">•</span>
                                    <span>{activity}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'includes' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-green-600 mb-3">Bao gồm</h3>
                    <ul className="space-y-2">
                      {tour.includes?.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-3">Không bao gồm</h3>
                    <ul className="space-y-2">
                      {tour.excludes?.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2">✗</span>
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1"
              >
                Đóng
              </Button>
              <Button
                onClick={() => {
                  // Could add booking action here
                  window.open(`/tours/${tour.slug}`, '_blank');
                }}
                className="flex-1"
              >
                Xem chi tiết đầy đủ
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy thông tin tour.</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TourDetailModal;
