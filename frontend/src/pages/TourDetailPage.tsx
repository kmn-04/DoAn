import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  StarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  CalendarDaysIcon,
  ShareIcon,
  HeartIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

import ImageGallery from '../components/tours/ImageGallery';
import BookingForm from '../components/tours/BookingForm';
import TourReviews from '../components/tours/TourReviews';
import TourCard from '../components/tours/TourCard';
import { Button } from '../components/ui';

interface TourDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  location: string;
  rating: number;
  reviewCount: number;
  maxPeople: number;
  images: string[];
  badge?: string;
  category: string;
  highlights: string[];
  included: string[];
  excluded: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
    activities: string[];
  }[];
  importantInfo: string[];
  cancellationPolicy: string;
  availableDates: string[];
}

// Mock tour detail data
const mockTourDetail: TourDetail = {
  id: 1,
  name: "Hạ Long Bay - Kỳ Quan Thế Giới",
  slug: "ha-long-bay-ky-quan-the-gioi",
  description: "Khám phá vẻ đẹp huyền bí của Vịnh Hạ Long với hàng ngàn đảo đá vôi kỳ thú. Trải nghiệm du thuyền sang trọng, thưởng thức hải sản tươi ngon và tận hưởng những khoảnh khắc tuyệt vời giữa thiên nhiên kỳ vĩ.",
  price: 2500000,
  originalPrice: 3000000,
  duration: "2 ngày 1 đêm",
  location: "Quảng Ninh",
  rating: 4.8,
  reviewCount: 245,
  maxPeople: 20,
  images: [
    "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    "https://images.unsplash.com/photo-1555618254-74e3f7d4f9b8?w=800",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
    "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800"
  ],
  badge: "Bán chạy",
  category: "beach",
  highlights: [
    "Du thuyền sang trọng qua Vịnh Hạ Long",
    "Khám phá hang Sửng Sốt và hang Thiên Cung",
    "Kayaking qua các hang động bí ẩn",
    "BBQ hải sản tươi ngon trên du thuyền",
    "Ngắm hoàng hôn tuyệt đẹp trên vịnh",
    "Thăm làng chài cổ Cửa Vạn"
  ],
  included: [
    "Xe du lịch đời mới, máy lạnh",
    "Du thuyền 4 sao tiêu chuẩn quốc tế",
    "Khách sạn 4 sao, phòng đôi (2 người/phòng)",
    "Ăn theo chương trình (6 bữa ăn)",
    "Vé tham quan các điểm trong chương trình",
    "Hướng dẫn viên nhiệt tình, kinh nghiệm",
    "Bảo hiểm du lịch theo quy định"
  ],
  excluded: [
    "Vé máy bay đi/về điểm tập trung",
    "Chi phí cá nhân (giặt ủi, điện thoại, đồ uống...)",
    "Tip cho hướng dẫn viên và tài xế",
    "Chi phí phát sinh ngoài chương trình",
    "Thuế VAT (nếu có yêu cầu xuất hóa đơn đỏ)"
  ],
  itinerary: [
    {
      day: 1,
      title: "TP.HCM - Hà Nội - Hạ Long (Ăn trưa, tối)",
      description: "Khởi hành từ TP.HCM đến Hà Nội, sau đó di chuyển đến Hạ Long để bắt đầu hành trình khám phá.",
      activities: [
        "06:00: Tập trung tại sân bay Tân Sơn Nhất",
        "08:30: Bay đến Hà Nội",
        "11:00: Đến Hà Nội, xe đón đoàn đi Hạ Long",
        "13:00: Ăn trưa tại nhà hàng địa phương",
        "15:00: Lên du thuyền, nhận phòng",
        "16:00: Thăm hang Sửng Sốt",
        "18:00: Ngắm hoàng hôn trên vịnh",
        "19:30: BBQ hải sản trên du thuyền",
        "21:00: Câu mực đêm, nghỉ ngơi trên du thuyền"
      ]
    },
    {
      day: 2,
      title: "Hạ Long - Hà Nội - TP.HCM (Ăn sáng, trưa)",
      description: "Tiếp tục khám phá Hạ Long và trở về TP.HCM với những kỷ niệm đẹp.",
      activities: [
        "06:30: Thái cực quyền trên boong du thuyền",
        "07:30: Ăn sáng buffet trên du thuyền",
        "08:30: Thăm hang Thiên Cung",
        "10:00: Kayaking khám phá hang động",
        "11:30: Trả phòng, ăn trưa trên du thuyền",
        "13:00: Về bến, xe đưa đoàn về Hà Nội",
        "16:00: Đến sân bay Nội Bài",
        "18:00: Bay về TP.HCM",
        "20:30: Đến sân bay Tân Sơn Nhất, kết thúc tour"
      ]
    }
  ],
  importantInfo: [
    "Mang theo CMND/Passport còn hạn sử dụng",
    "Chuẩn bị áo ấm cho buổi tối trên du thuyền",
    "Mang giày thể thao, dép lào cho hoạt động kayaking",
    "Kem chống nắng, mũ, kính râm",
    "Thuốc cá nhân (nếu có)",
    "Máy ảnh chống nước cho hoạt động dưới nước"
  ],
  cancellationPolicy: "Miễn phí hủy tour trong vòng 24h sau khi đặt. Hủy tour trước 7 ngày: không tính phí. Hủy tour từ 3-6 ngày: tính 50% phí tour. Hủy tour trong vòng 2 ngày: tính 100% phí tour.",
  availableDates: []
};

// Mock related tours
const mockRelatedTours = [
  {
    id: 2,
    name: "Sapa - Thiên Đường Mây Trắng",
    slug: "sapa-thien-duong-may-trang",
    description: "Chinh phục đỉnh Fansipan và khám phá văn hóa độc đáo",
    price: 1800000,
    duration: "3 ngày 2 đêm",
    location: "Lào Cai",
    rating: 4.9,
    reviewCount: 189,
    maxPeople: 15,
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800",
    category: "mountain"
  },
  {
    id: 3,
    name: "Phú Quốc - Đảo Ngọc Xanh",
    slug: "phu-quoc-dao-ngoc-xanh",
    description: "Thư giãn tại những bãi biển tuyệt đẹp",
    price: 3200000,
    duration: "4 ngày 3 đêm",
    location: "Kiên Giang",
    rating: 4.7,
    reviewCount: 312,
    maxPeople: 25,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    category: "beach"
  },
  {
    id: 4,
    name: "Hội An - Phố Cổ Thơ Mộng",
    slug: "hoi-an-pho-co-tho-mong",
    description: "Dạo bước trong phố cổ với đèn lồng rực rỡ",
    price: 1500000,
    duration: "2 ngày 1 đêm",
    location: "Quảng Nam",
    rating: 4.6,
    reviewCount: 156,
    maxPeople: 18,
    image: "https://images.unsplash.com/photo-1555618254-74e3f7d4f9b8?w=800",
    category: "culture"
  }
];

const TourDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'reviews' | 'info'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<number[]>([1]); // Mặc định mở rộng ngày đầu tiên

  useEffect(() => {
    // Simulate API call
    const fetchTour = async () => {
      setIsLoading(true);
      // In real app, fetch tour by slug
      setTimeout(() => {
        setTour(mockTourDetail);
        setIsLoading(false);
      }, 1000);
    };

    fetchTour();
  }, [slug]);

  const handleBooking = (bookingData: any) => {
    console.log('Booking data:', bookingData);
    // In real app, process booking
    alert('Đặt tour thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tour?.name,
        text: tour?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link đã được copy!');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const toggleDayExpanded = (dayNumber: number) => {
    setExpandedDays(prev => 
      prev.includes(dayNumber) 
        ? prev.filter(day => day !== dayNumber)
        : [...prev, dayNumber]
    );
  };

  const expandAllDays = () => {
    if (tour) {
      setExpandedDays(tour.itinerary.map(day => day.day));
    }
  };

  const collapseAllDays = () => {
    setExpandedDays([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tour không tìm thấy</h1>
          <Link to="/tours" className="text-blue-600 hover:underline">
            ← Quay lại danh sách tour
          </Link>
        </div>
      </div>
    );
  }

  const ratingDistribution = {
    5: 150,
    4: 70,
    3: 20,
    2: 3,
    1: 2
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tour Header */}
            <div>
              {/* Back Button */}
              <div className="mb-4">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Quay lại</span>
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    {tour.badge && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {tour.badge}
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold capitalize">
                      {tour.category === 'beach' ? 'Tour biển đảo' : 
                       tour.category === 'mountain' ? 'Tour miền núi' :
                       tour.category === 'culture' ? 'Tour văn hóa' :
                       tour.category === 'city' ? 'Tour thành phố' : 'Tour du lịch'}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{tour.name}</h1>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    {isWishlisted ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-gray-600" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <ShareIcon className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Tour Meta */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-semibold text-gray-900">{tour.rating}</span>
                  <span>({tour.reviewCount} đánh giá)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{tour.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{tour.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>Max {tour.maxPeople} người</span>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <ImageGallery images={tour.images} title={tour.name} />

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                {[
                  { key: 'overview', label: 'Tổng quan' },
                  { key: 'itinerary', label: 'Lịch trình' },
                  { key: 'reviews', label: 'Đánh giá' },
                  { key: 'info', label: 'Thông tin' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
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
            <div>
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Description */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Mô tả tour</h3>
                    <p className="text-gray-700 leading-relaxed">{tour.description}</p>
                  </div>

                  {/* Highlights */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Điểm nổi bật</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tour.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Included/Excluded */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Bao gồm</h3>
                      <div className="space-y-2">
                        {tour.included.map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Không bao gồm</h3>
                      <div className="space-y-2">
                        {tour.excluded.map((item, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <XCircleIcon className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Lịch trình chi tiết</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={expandAllDays}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mở rộng tất cả
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={collapseAllDays}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Thu gọn tất cả
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {tour.itinerary.map((day) => {
                      const isExpanded = expandedDays.includes(day.day);
                      return (
                        <div key={day.day} className="bg-white rounded-lg border overflow-hidden">
                          {/* Day Header - Always visible */}
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleDayExpanded(day.day)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                                  {day.day}
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">{day.title}</h4>
                                  <p className="text-sm text-gray-600 mt-1">{day.description}</p>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Day Activities - Collapsible */}
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t bg-gray-50">
                              <div className="pt-4 space-y-3">
                                {day.activities.map((activity, index) => (
                                  <div key={index} className="flex items-start space-x-3">
                                    <CalendarDaysIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 leading-relaxed">{activity}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <TourReviews
                  reviews={[]}
                  overallRating={tour.rating}
                  totalReviews={tour.reviewCount}
                  ratingDistribution={ratingDistribution}
                />
              )}

              {activeTab === 'info' && (
                <div className="space-y-8">
                  {/* Important Info */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin quan trọng</h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="space-y-2">
                        {tour.importantInfo.map((info, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <InformationCircleIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{info}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Chính sách hủy tour</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700">{tour.cancellationPolicy}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <BookingForm tour={tour} onBooking={handleBooking} />
          </div>
        </div>

        {/* Related Tours */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Tour liên quan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRelatedTours.map((relatedTour) => (
              <TourCard key={relatedTour.id} tour={relatedTour} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetailPage;
