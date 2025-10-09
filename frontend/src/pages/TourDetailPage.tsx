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
import { IoBedOutline, IoRestaurantOutline } from 'react-icons/io5';

import ImageGallery from '../components/tours/ImageGallery';
import BookingForm from '../components/tours/BookingForm';
import TourReviews from '../components/tours/TourReviews';
import TourCard from '../components/tours/TourCard';
import { Button } from '../components/ui';
import tourService from '../services/tourService';

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
  const [relatedTours, setRelatedTours] = useState<any[]>([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'reviews' | 'info'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<number[]>([1]); // Mặc định mở rộng ngày đầu tiên

  useEffect(() => {
    const fetchTour = async () => {
      if (!slug) return;
      
      try {
        setIsLoading(true);
        // Get tour by slug from API
        const tourResponse = await tourService.getTourBySlug(slug);
        // Parse included services
        let includedList = [];
        if (tourResponse.includedServices) {
          if (Array.isArray(tourResponse.includedServices)) {
            includedList = tourResponse.includedServices;
          } else if (typeof tourResponse.includedServices === 'string') {
            try {
              includedList = JSON.parse(tourResponse.includedServices);
            } catch {
              includedList = [];
            }
          }
        }
        
        // Parse excluded services
        let excludedList = [];
        if (tourResponse.excludedServices) {
          if (Array.isArray(tourResponse.excludedServices)) {
            excludedList = tourResponse.excludedServices;
          } else if (typeof tourResponse.excludedServices === 'string') {
            try {
              excludedList = JSON.parse(tourResponse.excludedServices);
            } catch {
              excludedList = [];
            }
          }
        }
        
        // Use fallback if empty
        if (includedList.length === 0) {
          includedList = [
            'Xe du lịch đời mới, máy lạnh',
            'Khách sạn tiêu chuẩn',
            'Ăn theo chương trình',
            'Vé tham quan các điểm trong chương trình',
            'Hướng dẫn viên nhiệt tình',
            'Bảo hiểm du lịch'
          ];
        }
        
        if (excludedList.length === 0) {
          excludedList = [
            'Vé máy bay đi/về điểm tập trung',
            'Chi phí cá nhân',
            'Phụ thu phòng đơn',
            'Tip cho hướng dẫn viên'
          ];
        }
        // Map API response to TourDetail interface
        const mappedTour: TourDetail = {
          id: tourResponse.id,
          name: tourResponse.name,
          slug: tourResponse.slug,
          description: tourResponse.description || tourResponse.shortDescription || 'Khám phá tour tuyệt vời này',
          price: tourResponse.salePrice || tourResponse.price, // Giá hiệu quả (đã sale hoặc gốc)
          originalPrice: (tourResponse.salePrice && tourResponse.salePrice < tourResponse.price) ? tourResponse.price : undefined, // Giá gốc chỉ khi có sale
          duration: `${tourResponse.duration} ngày`,
          location: tourResponse.destination || tourResponse.departureLocation || 'Việt Nam',
          rating: 4.5, // TODO: Add rating to backend
          reviewCount: 0, // TODO: Add review count to backend
          maxPeople: tourResponse.maxPeople || 20,
          images: tourResponse.images?.map((img: any) => img.imageUrl) || ['/default-tour.jpg'],
          badge: tourResponse.isFeatured ? 'Nổi bật' : undefined,
          category: tourResponse.category?.name || 'Tour',
          highlights: Array.isArray(tourResponse.highlights) 
            ? tourResponse.highlights 
            : (typeof tourResponse.highlights === 'string' 
                ? JSON.parse(tourResponse.highlights) 
                : [
                    'Trải nghiệm tuyệt vời',
                    'Dịch vụ chất lượng cao',
                    'Hướng dẫn viên chuyên nghiệp'
                  ]),
          included: includedList,
          excluded: excludedList,
          itinerary: tourResponse.itineraries && tourResponse.itineraries.length > 0
            ? tourResponse.itineraries.map((item: any) => ({
                day: item.dayNumber,
                title: item.title,
                description: item.description || '',
                activities: Array.isArray(item.activities) 
                  ? item.activities 
                  : (typeof item.activities === 'string' 
                      ? JSON.parse(item.activities) 
                      : []),
                // Include partner information
                partner: item.partner,
                accommodationPartner: item.accommodationPartner,
                mealsPartner: item.mealsPartner
              }))
            : [
                {
                  day: 1,
                  title: `Ngày 1: Khởi hành đến ${tourResponse.destination || 'điểm đến'}`,
                  description: 'Bắt đầu hành trình khám phá',
                  activities: ['Tập trung tại điểm hẹn', 'Khởi hành', 'Nhận phòng khách sạn']
                },
                {
                  day: 2,
                  title: `Ngày 2: Tham quan ${tourResponse.destination || 'điểm đến'}`,
                  description: 'Khám phá những điểm đến tuyệt vời',
                  activities: ['Tham quan các điểm nổi tiếng', 'Ăn trưa tại nhà hàng địa phương', 'Trở về']
                }
              ],
          importantInfo: [
            'Vui lòng mang theo giấy tờ tùy thân',
            'Trang phục thoải mái, phù hợp với thời tiết',
            'Mang theo thuốc cá nhân nếu cần'
          ],
          cancellationPolicy: tourResponse.cancellationPolicy || 'Miễn phí hủy trong 24h. Hủy trước 7 ngày không tính phí.',
          availableDates: tourResponse.schedules && tourResponse.schedules.length > 0
            ? tourResponse.schedules
                .filter((schedule: any) => schedule.status === 'Available')
                .map((schedule: any) => schedule.departureDate)
            : []
        };
        
        setTour(mappedTour);
        
        // Fetch related tours with smart recommendation
        if (tourResponse.category?.id) {
          try {
            const categoryResponse = await tourService.getToursByCategory(tourResponse.category.id);
            const allToursInCategory = categoryResponse.content || categoryResponse.data || categoryResponse;
            
            // Filter out current tour
            const availableTours = (Array.isArray(allToursInCategory) ? allToursInCategory : [])
              .filter((t: any) => t.id !== tourResponse.id);
            
            // Calculate price range
            const currentPrice = tourResponse.salePrice || tourResponse.price;
            const priceMin = currentPrice * 0.7;  // -30%
            const priceMax = currentPrice * 1.3;  // +30%
            
            let relatedToursList: any[] = [];
            
            // TIER 1: Same category + similar price (±30%) + high rating
            const tier1 = availableTours
              .filter((t: any) => {
                const tPrice = t.salePrice || t.price;
                return tPrice >= priceMin && tPrice <= priceMax;
              })
              .sort((a: any, b: any) => {
                // Sort by rating (if available), then by view count
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                if (ratingB !== ratingA) return ratingB - ratingA;
                return (b.viewCount || 0) - (a.viewCount || 0);
              })
              .slice(0, 3);
            
            relatedToursList = [...tier1];
            
            // TIER 2: If not enough, expand price range to ±50%
            if (relatedToursList.length < 3) {
              const priceMinWide = currentPrice * 0.5;  // -50%
              const priceMaxWide = currentPrice * 1.5;  // +50%
              
              const tier2 = availableTours
                .filter((t: any) => !relatedToursList.some((rt: any) => rt.id === t.id))
                .filter((t: any) => {
                  const tPrice = t.salePrice || t.price;
                  return tPrice >= priceMinWide && tPrice <= priceMaxWide;
                })
                .sort((a: any, b: any) => {
                  const ratingA = a.rating || 0;
                  const ratingB = b.rating || 0;
                  if (ratingB !== ratingA) return ratingB - ratingA;
                  return (b.viewCount || 0) - (a.viewCount || 0);
                })
                .slice(0, 3 - relatedToursList.length);
              
              relatedToursList = [...relatedToursList, ...tier2];
            }
            
            // TIER 3: Still not enough, take any from same category
            if (relatedToursList.length < 3) {
              const tier3 = availableTours
                .filter((t: any) => !relatedToursList.some((rt: any) => rt.id === t.id))
                .sort((a: any, b: any) => {
                  const ratingA = a.rating || 0;
                  const ratingB = b.rating || 0;
                  if (ratingB !== ratingA) return ratingB - ratingA;
                  return (b.viewCount || 0) - (a.viewCount || 0);
                })
                .slice(0, 3 - relatedToursList.length);
              
              relatedToursList = [...relatedToursList, ...tier3];
            }
            
            setRelatedTours(relatedToursList);
          } catch (relatedError) {
            console.error('❌ Error fetching related tours:', relatedError);
            setRelatedTours(mockRelatedTours);
          }
        } else {
          setRelatedTours(mockRelatedTours);
        }
        
      } catch (error) {
        console.error('❌ Error fetching tour:', error);
        // Don't show anything if API fails - let error boundary handle it
      } finally {
        setIsLoading(false);
      }
    };

    fetchTour();
  }, [slug]);

  const handleBooking = (bookingData: any) => {
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
    <div className="min-h-screen bg-stone-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tour Header */}
            <div className="animate-fade-in-up opacity-0">
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors group"
                >
                  <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-normal tracking-wide">Quay lại</span>
                </button>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    {tour.badge && (
                      <span className="text-white px-4 py-1.5 rounded-none text-xs font-medium tracking-wider uppercase shadow-lg animate-fade-in opacity-0 delay-100" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                        {tour.badge}
                      </span>
                    )}
                    <span className="bg-stone-100 text-slate-700 px-4 py-1.5 rounded-none text-xs font-normal tracking-wide capitalize border border-stone-200 animate-fade-in opacity-0 delay-200">
                      {tour.category || 'Tour du lịch'}
                    </span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-normal text-slate-900 mb-4 tracking-tight leading-tight">{tour.name}</h1>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="p-3 rounded-none border border-stone-300 hover:bg-stone-50 hover:border-slate-700 transition-all shadow-md hover:shadow-lg"
                  >
                    {isWishlisted ? (
                      <HeartSolidIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <HeartIcon className="h-6 w-6 text-slate-600" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="p-3 rounded-none border border-stone-300 hover:bg-stone-50 hover:border-slate-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <ShareIcon className="h-6 w-6 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* Tour Meta */}
              <div className="flex flex-wrap items-center gap-8 text-base text-gray-700 mb-8 pb-6 border-b border-stone-200 animate-fade-in opacity-0 delay-300">
                <div className="flex items-center space-x-2">
                  <StarIcon className="h-6 w-6 fill-current" style={{ color: '#D4AF37' }} />
                  <span className="font-semibold text-slate-900 text-lg">{tour.rating}</span>
                  <span className="font-normal">({tour.reviewCount} đánh giá)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="h-6 w-6" style={{ color: '#D4AF37' }} />
                  <span className="font-normal">{tour.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-6 w-6" style={{ color: '#D4AF37' }} />
                  <span className="font-normal">{tour.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-6 w-6" style={{ color: '#D4AF37' }} />
                  <span className="font-normal">Max {tour.maxPeople} người</span>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="animate-fade-in-up opacity-0 delay-400">
              <ImageGallery images={tour.images} title={tour.name} />
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-stone-200 bg-white rounded-none shadow-sm animate-slide-in-left opacity-0 delay-500">
              <nav className="flex space-x-1 p-1">
                {[
                  { key: 'overview', label: 'Tổng quan' },
                  { key: 'itinerary', label: 'Lịch trình' },
                  { key: 'reviews', label: 'Đánh giá' },
                  { key: 'info', label: 'Thông tin' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-1 py-3 px-4 font-medium text-sm tracking-wide transition-all rounded-none ${
                      activeTab === tab.key
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'text-slate-700 hover:bg-stone-50 hover:text-slate-900'
                    }`}
                    style={activeTab === tab.key ? { background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' } : {}}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-none shadow-lg p-8 border border-stone-200 animate-fade-in opacity-0 delay-600">
              {activeTab === 'overview' && (
                <div className="space-y-10">
                  {/* Description */}
                  <div className="animate-fade-in-up opacity-0 delay-100">
                    <h3 className="text-3xl font-normal text-slate-900 mb-5 tracking-tight">Mô tả tour</h3>
                    <p className="text-gray-800 leading-relaxed text-base">{tour.description}</p>
                  </div>

                  {/* Highlights */}
                  <div className="animate-fade-in-up opacity-0 delay-200">
                    <h3 className="text-3xl font-normal text-slate-900 mb-6 tracking-tight">Điểm nổi bật</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tour.highlights.map((highlight, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-stone-50 rounded-none border-l-2 hover:bg-stone-100 transition-all duration-300 hover:shadow-md hover:translate-x-1" style={{ borderLeftColor: '#D4AF37' }}>
                          <CheckCircleIcon className="h-6 w-6 mt-0.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                          <span className="text-gray-800 text-base">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Included/Excluded */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up opacity-0 delay-300">
                    <div className="bg-stone-50 p-6 rounded-none border border-stone-200 hover:border-slate-700 transition-all duration-300 hover:shadow-lg">
                      <h3 className="text-2xl font-medium text-slate-900 mb-5 tracking-tight">Bao gồm</h3>
                      <div className="space-y-3">
                        {tour.included.map((item, index) => (
                          <div key={index} className="flex items-start space-x-3 hover:translate-x-1 transition-transform duration-200">
                            <CheckCircleIcon className="h-5 w-5 mt-1 flex-shrink-0" style={{ color: '#D4AF37' }} />
                            <span className="text-base text-gray-800">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-stone-50 p-6 rounded-none border border-stone-200 hover:border-slate-700 transition-all duration-300 hover:shadow-lg">
                      <h3 className="text-2xl font-medium text-slate-900 mb-5 tracking-tight">Không bao gồm</h3>
                      <div className="space-y-3">
                        {tour.excluded.map((item, index) => (
                          <div key={index} className="flex items-start space-x-3 hover:translate-x-1 transition-transform duration-200">
                            <XCircleIcon className="h-5 w-5 mt-1 flex-shrink-0 text-slate-400" />
                            <span className="text-base text-gray-800">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-3xl font-normal text-slate-900 tracking-tight">Lịch trình chi tiết</h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={expandAllDays}
                        className="text-xs text-slate-700 hover:text-slate-900 font-medium tracking-wide uppercase"
                        style={{ color: '#D4AF37' }}
                      >
                        Mở rộng tất cả
                      </button>
                      <span className="text-stone-300">|</span>
                      <button
                        onClick={collapseAllDays}
                        className="text-xs text-slate-700 hover:text-slate-900 font-medium tracking-wide uppercase"
                        style={{ color: '#D4AF37' }}
                      >
                        Thu gọn tất cả
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {tour.itinerary.map((day, index) => {
                      const isExpanded = expandedDays.includes(day.day);
                      return (
                        <div key={`day-${index}`} className="bg-stone-50 rounded-none border border-stone-200 overflow-hidden hover:border-slate-700 transition-all hover:shadow-lg stagger-animation opacity-0">
                          {/* Day Header - Always visible */}
                          <div 
                            className="p-5 cursor-pointer hover:bg-white transition-colors group"
                            onClick={() => toggleDayExpanded(day.day)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="text-white rounded-none w-10 h-10 flex items-center justify-center font-medium text-sm shadow-md group-hover:scale-110 transition-transform duration-300" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                                  {day.day}
                                </div>
                                <div>
                                  <h4 className="text-xl font-medium text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">{day.title}</h4>
                                  <div 
                                    className="text-base text-gray-700 mt-2 prose prose-base max-w-none"
                                    dangerouslySetInnerHTML={{ __html: day.description }}
                                  />
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronUpIcon className="h-5 w-5 text-slate-400" />
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
                                {/* Activities */}
                                {day.activities.map((activity, index) => (
                                  <div key={index} className="flex items-start space-x-3">
                                    <CalendarDaysIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div 
                                      className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                                      dangerouslySetInnerHTML={{ __html: activity }}
                                    />
                                  </div>
                                ))}
                                
                                {/* Partners - Chỉ hiển thị khách sạn và nhà hàng */}
                                {((day as any).accommodationPartner || (day as any).mealsPartner) && (
                                  <div className="flex items-start space-x-3 pt-2">
                                    <div className="h-4 w-4 flex-shrink-0"></div>
                                    <div className="text-sm text-gray-600 italic flex flex-wrap gap-x-6 gap-y-1">
                                      {(day as any).accommodationPartner && (
                                        <span className="flex items-center gap-1.5">
                                          <IoBedOutline className="h-4 w-4 text-blue-600" />
                                          <span className="text-blue-700 font-medium">{(day as any).accommodationPartner.name}</span>
                                        </span>
                                      )}
                                      {(day as any).mealsPartner && (
                                        <span className="flex items-center gap-1.5">
                                          <IoRestaurantOutline className="h-4 w-4 text-orange-600" />
                                          <span className="text-orange-700 font-medium">{(day as any).mealsPartner.name}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
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
                    <h3 className="text-3xl font-normal text-slate-900 mb-6 tracking-tight">Thông tin quan trọng</h3>
                    <div className="bg-amber-50 border-l-4 rounded-none p-6" style={{ borderLeftColor: '#D4AF37' }}>
                      <div className="space-y-3">
                        {tour.importantInfo.map((info, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <InformationCircleIcon className="h-6 w-6 mt-0.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                            <span className="text-base text-gray-800">{info}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div>
                    <h3 className="text-3xl font-normal text-slate-900 mb-6 tracking-tight">Chính sách hủy tour</h3>
                    <div className="bg-stone-50 border border-stone-200 rounded-none p-6">
                      <p className="text-base text-gray-800 leading-relaxed">{tour.cancellationPolicy}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1 animate-slide-in-right opacity-0 delay-700">
            <BookingForm tour={tour} onBooking={handleBooking} />
          </div>
        </div>

        {/* Related Tours */}
        {relatedTours.length > 0 && (
          <div className="mt-16 pt-12 border-t border-stone-200 animate-fade-in-up opacity-0 delay-800">
            <div className="text-center mb-12">
              <div className="inline-block px-8 py-3 border border-slate-800 rounded-none mb-6 hover:border-slate-600 transition-all hover:shadow-md">
                <span className="text-slate-900 font-medium text-base tracking-[0.3em] uppercase">Tour Liên Quan</span>
              </div>
              <p className="text-gray-600 max-w-2xl mx-auto font-normal">
                Khám phá những tour tương tự có thể bạn quan tâm
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTours.map((relatedTour, index) => (
                <div key={relatedTour.id} className="stagger-animation opacity-0" style={{ animationDelay: `${index * 150}ms` }}>
                  <TourCard tour={relatedTour} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourDetailPage;
