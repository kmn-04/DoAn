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
  ChevronUpIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { IoBedOutline, IoRestaurantOutline } from 'react-icons/io5';

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
  shortDescription?: string;
  price: number;
  salePrice?: number;
  originalPrice?: number;
  duration: number;
  location: string;
  departureLocation?: string;
  destination?: string;
  averageRating: number;
  totalReviews: number;
  maxGroupSize: number;
  images: Array<{ imageUrl: string; imageType?: string }>;
  category: { name: string };
  tourType?: 'DOMESTIC' | 'INTERNATIONAL';
  country?: {
    name: string;
    code: string;
    flagUrl?: string;
    visaRequired?: boolean;
  };
  flightIncluded?: boolean;
  visaRequired?: boolean;
  visaInfo?: string;
  highlights?: string[];
  includedServices?: string[];
  excludedServices?: string[];
  includes?: string[];
  excludes?: string[];
  itinerary?: Array<{
    id?: number;
    day: number;
    title: string;
    description: string;
    activities?: string[];
    accommodation?: string;
    meals?: string;
  }>;
  cancellationPolicy?: string;
  isFeatured?: boolean;
  accommodationInfo?: string;
  mealsInfo?: string;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'includes' | 'info'>('overview');
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen && tourId) {
      fetchTourDetail();
    }
  }, [isOpen, tourId, tourSlug]);

  const fetchTourDetail = async () => {
    try {
      setIsLoading(true);
      let tourResponse;
      if (tourSlug) {
        // Try to get by slug first
        tourResponse = await tourService.getTourBySlug(tourSlug);
      } else {
        // Fallback to get by ID (need to implement this endpoint)
        tourResponse = await tourService.getTourById(tourId);
      }
      // Parse highlights if it's a string
      let highlightsList: string[] = [];
      if (tourResponse.highlights) {
        if (typeof tourResponse.highlights === 'string') {
          try {
            highlightsList = JSON.parse(tourResponse.highlights);
          } catch {
            highlightsList = tourResponse.highlights.split('\n').filter((h: string) => h.trim());
          }
        } else if (Array.isArray(tourResponse.highlights)) {
          highlightsList = tourResponse.highlights;
        }
      }
      // Parse included/excluded services
      let includedList: string[] = [];
      let excludedList: string[] = [];
      
      if (tourResponse.includedServices) {
        if (typeof tourResponse.includedServices === 'string') {
          try {
            includedList = JSON.parse(tourResponse.includedServices);
          } catch {
            includedList = tourResponse.includedServices.split('\n').filter((s: string) => s.trim());
          }
        } else if (Array.isArray(tourResponse.includedServices)) {
          includedList = tourResponse.includedServices;
        }
      }
      
      if (tourResponse.excludedServices) {
        if (typeof tourResponse.excludedServices === 'string') {
          try {
            excludedList = JSON.parse(tourResponse.excludedServices);
          } catch {
            excludedList = tourResponse.excludedServices.split('\n').filter((s: string) => s.trim());
          }
        } else if (Array.isArray(tourResponse.excludedServices)) {
          excludedList = tourResponse.excludedServices;
        }
      }
      // Fallback data nếu không có
      if (includedList.length === 0) {
        includedList = [
          'Xe du lịch đời mới, máy lạnh',
          'Khách sạn tiêu chuẩn theo chương trình',
          'Ăn uống theo chương trình',
          'Vé tham quan các điểm trong chương trình',
          'Hướng dẫn viên nhiệt tình, kinh nghiệm',
          'Bảo hiểm du lịch theo quy định'
        ];
      }
      
      if (excludedList.length === 0) {
        excludedList = [
          'Vé máy bay đi/về điểm tập trung (nếu có)',
          'Chi phí cá nhân ngoài chương trình',
          'Phụ thu phòng đơn',
          'Tip cho hướng dẫn viên (tùy tâm)',
          'Các chi phí phát sinh ngoài chương trình'
        ];
      }
      
      // Map to TourDetail interface
      const mappedTour: TourDetail = {
        id: tourResponse.id,
        name: tourResponse.name,
        slug: tourResponse.slug,
        description: tourResponse.description || tourResponse.shortDescription || 'Khám phá tour tuyệt vời này',
        shortDescription: tourResponse.shortDescription,
        price: tourResponse.salePrice || tourResponse.price,
        salePrice: tourResponse.salePrice,
        originalPrice: (tourResponse.salePrice && tourResponse.salePrice < tourResponse.price) ? tourResponse.price : undefined,
        duration: tourResponse.duration,
        location: tourResponse.destination || tourResponse.departureLocation || tourResponse.location || 'Việt Nam',
        departureLocation: tourResponse.departureLocation,
        destination: tourResponse.destination,
        averageRating: tourResponse.averageRating || 0,
        totalReviews: tourResponse.totalReviews || 0,
        maxGroupSize: tourResponse.maxPeople || 20,
        images: tourResponse.images || [{ imageUrl: '/default-tour.jpg' }],
        category: tourResponse.category || { name: 'Tour' },
        tourType: tourResponse.tourType,
        country: tourResponse.country,
        flightIncluded: tourResponse.flightIncluded,
        visaRequired: tourResponse.visaRequired || tourResponse.country?.visaRequired,
        visaInfo: tourResponse.visaInfo,
        highlights: highlightsList.length > 0 ? highlightsList : undefined,
        includedServices: includedList.length > 0 ? includedList : undefined,
        excludedServices: excludedList.length > 0 ? excludedList : undefined,
        includes: includedList,
        excludes: excludedList,
        itinerary: tourResponse.itinerary && tourResponse.itinerary.length > 0 
          ? tourResponse.itinerary.map((item: any) => {
              let activities = [];
              if (item.activities) {
                if (Array.isArray(item.activities)) {
                  activities = item.activities;
                } else if (typeof item.activities === 'string') {
                  try {
                    activities = JSON.parse(item.activities);
                  } catch {
                    activities = item.activities.split('\n').filter((a: string) => a.trim());
                  }
                }
              }
              
              return {
                id: item.id,
                day: item.day,
                title: item.title,
                description: item.description,
                activities: activities,
                accommodation: item.accommodation,
                meals: item.meals
              };
            })
          : (() => {
              // Generate itinerary based on tour duration
              const duration = tourResponse.duration || 2;
              const destination = tourResponse.destination || tourResponse.location || 'điểm đến';
              const itineraries = [];
              
              // Day 1
              itineraries.push({
                day: 1,
                title: `Ngày 1: Khởi hành đến ${destination}`,
                description: 'Bắt đầu hành trình khám phá. Đoàn tập trung tại điểm hẹn, khởi hành theo lịch trình. Check-in khách sạn, nghỉ ngơi.',
                activities: [
                  'Tập trung tại điểm hẹn',
                  'Khởi hành đi tour',
                  'Nhận phòng khách sạn',
                  'Tự do khám phá khu vực xung quanh'
                ]
              });
              
              // Middle days
              for (let day = 2; day < duration; day++) {
                itineraries.push({
                  day: day,
                  title: `Ngày ${day}: Khám phá ${destination}`,
                  description: `Tham quan và trải nghiệm các điểm đến tuyệt vời tại ${destination}.`,
                  activities: [
                    'Ăn sáng tại khách sạn',
                    'Tham quan các điểm du lịch nổi tiếng',
                    'Ăn trưa đặc sản địa phương',
                    'Tiếp tục hành trình khám phá',
                    'Nghỉ đêm tại khách sạn'
                  ]
                });
              }
              
              // Last day
              itineraries.push({
                day: duration,
                title: `Ngày ${duration}: Kết thúc chuyến đi`,
                description: 'Ăn sáng tại khách sạn. Tham quan các điểm cuối cùng. Trả phòng và khởi hành về điểm xuất phát.',
                activities: [
                  'Ăn sáng tại khách sạn',
                  'Tham quan các điểm nổi tiếng',
                  'Mua sắm đặc sản địa phương',
                  'Trở về điểm xuất phát'
                ]
              });
              
              return itineraries;
            })(),
        cancellationPolicy: tourResponse.cancellationPolicy,
        isFeatured: tourResponse.isFeatured,
        accommodationInfo: tourResponse.accommodation,
        mealsInfo: tourResponse.mealsIncluded
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
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {tour.departureLocation && tour.destination ? 
                      `${tour.departureLocation} → ${tour.destination}` : 
                      tour.location
                    }
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
                
                {/* Tour Type & Country Info */}
                {(tour.tourType === 'INTERNATIONAL' || tour.country) && (
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {tour.country && (
                      <div className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full">
                        {tour.country.flagUrl && (
                          <img src={tour.country.flagUrl} alt={tour.country.name} className="h-4 w-5 mr-2 rounded" />
                        )}
                        <span className="font-medium">{tour.country.name}</span>
                      </div>
                    )}
                    {tour.flightIncluded && (
                      <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-medium">
                        ✈️ Bao gồm vé máy bay
                      </span>
                    )}
                    {tour.visaRequired && (
                      <span className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full font-medium">
                        📝 Yêu cầu visa
                      </span>
                    )}
                  </div>
                )}
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
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Tổng quan' },
                  { id: 'itinerary', label: 'Lịch trình' },
                  { id: 'includes', label: 'Bao gồm' },
                  { id: 'info', label: 'Thông tin quan trọng' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

              {activeTab === 'itinerary' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold">Lịch trình chi tiết</h3>
                  
                  {tour.itinerary && tour.itinerary.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Lịch trình chi tiết sẽ được cập nhật sau</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'includes' && (
                <div className="space-y-6">
                  {tour.includes && tour.includes.length > 0 && tour.excludes && tour.excludes.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-green-600 mb-3">Bao gồm</h3>
                      <ul className="space-y-2">
                        {tour.includes.map((item, index) => (
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
                        {tour.excludes.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">✗</span>
                            <span className="text-gray-600">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">Thông tin chi tiết sẽ được cập nhật sau</p>
                    </div>
                  )}
                  
                  {/* Additional Info */}
                  {(tour.accommodationInfo || tour.mealsInfo) && (
                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                      {tour.accommodationInfo && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <IoBedOutline className="h-5 w-5 text-blue-600 mr-2" />
                            <h4 className="font-semibold text-blue-900">Khách sạn</h4>
                          </div>
                          <p className="text-sm text-blue-800">{tour.accommodationInfo}</p>
                        </div>
                      )}
                      {tour.mealsInfo && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <IoRestaurantOutline className="h-5 w-5 text-orange-600 mr-2" />
                            <h4 className="font-semibold text-orange-900">Bữa ăn</h4>
                          </div>
                          <p className="text-sm text-orange-800">{tour.mealsInfo}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Visa Information */}
                  {tour.visaInfo && (
                    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg">
                      <div className="flex items-center mb-2">
                        <InformationCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                        <h3 className="text-lg font-semibold text-yellow-900">Thông tin Visa</h3>
                      </div>
                      <div className="text-gray-700 whitespace-pre-line">{tour.visaInfo}</div>
                    </div>
                  )}
                  
                  {/* Cancellation Policy */}
                  {tour.cancellationPolicy && (
                    <div className="border-l-4 border-red-400 bg-red-50 p-4 rounded-r-lg">
                      <div className="flex items-center mb-2">
                        <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                        <h3 className="text-lg font-semibold text-red-900">Chính sách hủy tour</h3>
                      </div>
                      <div className="text-gray-700 whitespace-pre-line">{tour.cancellationPolicy}</div>
                    </div>
                  )}
                  
                  {/* Important Notes */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <InformationCircleIcon className="h-5 w-5 text-gray-600 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">Lưu ý quan trọng</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span>Vui lòng mang theo giấy tờ tùy thân (CMND/CCCD/Hộ chiếu) khi tham gia tour</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span>Thời gian có thể thay đổi tùy vào tình hình thực tế</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-500 mr-2 mt-1">•</span>
                        <span>Quý khách vui lòng có mặt đúng giờ tại điểm tập trung</span>
                      </li>
                      {tour.tourType === 'INTERNATIONAL' && (
                        <>
                          <li className="flex items-start">
                            <span className="text-blue-500 mr-2 mt-1">•</span>
                            <span>Hộ chiếu còn hạn ít nhất 6 tháng kể từ ngày khởi hành</span>
                          </li>
                          {tour.visaRequired && (
                            <li className="flex items-start">
                              <span className="text-blue-500 mr-2 mt-1">•</span>
                              <span>Quý khách tự lo visa hoặc liên hệ với chúng tôi để được hỗ trợ</span>
                            </li>
                          )}
                        </>
                      )}
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
