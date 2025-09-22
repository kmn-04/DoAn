import React from 'react';
import {
  UsersIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
  HomeIcon,
  TruckIcon,
  MapIcon,
  CogIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import PartnerContactForm from '../components/partners/PartnerContactForm';
import { Button } from '../components/ui';

const benefits = [
  {
    icon: UsersIcon,
    title: 'Tiếp cận 50K+ khách hàng/tháng',
    description: 'Kết nối với cơ sở khách hàng rộng lớn và đa dạng trên toàn quốc',
    stats: '50,000+'
  },
  {
    icon: ChartBarIcon,
    title: 'Tăng doanh thu 30-50%',
    description: 'Nguồn booking ổn định từ platform với commission hấp dẫn',
    stats: '30-50%'
  },
  {
    icon: SpeakerWaveIcon,
    title: 'Quảng bá thương hiệu miễn phí',
    description: 'Featured placement, social media marketing và SEO optimization',
    stats: 'Miễn phí'
  },
  {
    icon: UserGroupIcon,
    title: 'Hỗ trợ chuyên nghiệp 24/7',
    description: 'Đội ngũ chăm sóc đối tác tận tình và quy trình hợp tác minh bạch',
    stats: '24/7'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Bảo vệ uy tín thương hiệu',
    description: 'Verification system và quality control nghiêm ngặt',
    stats: '100%'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Hoa hồng cạnh tranh',
    description: 'Mức commission hấp dẫn với thanh toán đúng hạn',
    stats: '10-20%'
  }
];

const partnerTypes = [
  {
    icon: BuildingOffice2Icon,
    title: 'Khách sạn & Resort',
    description: 'Từ homestay đến resort 5 sao',
    count: '500+',
    commission: '12-18%',
    requirements: ['Giấy phép kinh doanh', 'Rating tối thiểu 3.5⭐', 'Hỗ trợ booking online']
  },
  {
    icon: HomeIcon,
    title: 'Nhà hàng & F&B',
    description: 'Ẩm thực địa phương và quốc tế',
    count: '300+',
    commission: '8-12%',
    requirements: ['Chứng nhận ATTP', 'Menu đa dạng', 'Phục vụ group tour']
  },
  {
    icon: TruckIcon,
    title: 'Vận chuyển',
    description: 'Xe bus, taxi, thuê xe máy',
    count: '200+',
    commission: '10-15%',
    requirements: ['Bảo hiểm xe', 'Lái xe có kinh nghiệm', 'Đúng giờ, an toàn']
  },
  {
    icon: MapIcon,
    title: 'Tour Operator',
    description: 'Nhà điều hành tour chuyên nghiệp',
    count: '150+',
    commission: '15-20%',
    requirements: ['Hướng dẫn viên chuyên nghiệp', 'Chương trình tour chi tiết', 'Emergency support']
  },
  {
    icon: CogIcon,
    title: 'Dịch vụ khác',
    description: 'SPA, giải trí, hoạt động thể thao',
    count: '100+',
    commission: '8-15%',
    requirements: ['Thiết bị an toàn', 'Staff được training', 'Insurance coverage']
  }
];

const processSteps = [
  {
    step: 1,
    title: 'Gửi thông tin đăng ký',
    description: 'Điền form với thông tin cơ bản về doanh nghiệp',
    time: '5 phút',
    details: ['Thông tin công ty', 'Người liên hệ', 'Loại hình kinh doanh', 'Tài liệu đính kèm']
  },
  {
    step: 2,
    title: 'Đánh giá & Xét duyệt',
    description: 'Team chúng tôi xem xét hồ sơ và đánh giá',
    time: '1-2 ngày',
    details: ['Kiểm tra giấy tờ', 'Đánh giá chất lượng', 'Background check', 'Site visit (nếu cần)']
  },
  {
    step: 3,
    title: 'Thảo luận điều khoản',
    description: 'Họp online thống nhất mức hoa hồng và điều khoản',
    time: '3-5 ngày',
    details: ['Commission rate', 'Payment terms', 'Marketing support', 'Service standards']
  },
  {
    step: 4,
    title: 'Onboarding & Launch',
    description: 'Ký kết hợp đồng và setup trên hệ thống',
    time: '1 tuần',
    details: ['Ký hợp đồng', 'Setup profile', 'Training hệ thống', 'First listing']
  }
];

const requirements = [
  'Giấy phép kinh doanh hợp lệ và còn hiệu lực',
  'Tối thiểu 1 năm hoạt động trong ngành du lịch',
  'Chất lượng dịch vụ đạt chuẩn tốt (rating ≥ 3.5⭐)',
  'Cam kết hợp tác dài hạn ít nhất 1 năm',
  'Có khả năng phục vụ khách hàng booking online',
  'Tuân thủ các quy định về an toàn du lịch',
  'Responsive communication (phản hồi trong 24h)',
  'Chấp nhận thanh toán qua hệ thống platform'
];

const successStories = [
  {
    name: 'Sapa Adventure Tours',
    type: 'Tour Operator',
    growth: '+150%',
    quote: 'Sau 6 tháng hợp tác, số lượng khách tăng 150%. Hệ thống booking rất tiện lợi!',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
  },
  {
    name: 'Mekong Riverside Hotel',
    type: 'Khách sạn',
    growth: '+80%',
    quote: 'Platform giúp chúng tôi tiếp cận nhiều khách hàng mới. Team support rất tận tình!',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=64&h=64&fit=crop&crop=face'
  },
  {
    name: 'Central Vietnam Transport',
    type: 'Vận chuyển',
    growth: '+120%',
    quote: 'Doanh thu tăng đáng kể nhờ có booking ổn định từ các tour groups.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face'
  }
];

const PartnershipPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to="/partners"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại danh sách đối tác
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&h=800&fit=crop"
            alt="Partnership"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <SparklesIcon className="h-12 w-12 text-blue-300 mr-4" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Trở thành Đối tác
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Cùng xây dựng hệ sinh thái du lịch Việt Nam với hơn <span className="font-bold text-white">1,250+</span> đối tác tin cậy
            </p>
            
            {/* Quick Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">50K+</div>
                <div className="text-sm text-blue-200">Khách hàng/tháng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">15-20%</div>
                <div className="text-sm text-blue-200">Hoa hồng</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">24/7</div>
                <div className="text-sm text-blue-200">Hỗ trợ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">1,250+</div>
                <div className="text-sm text-blue-200">Đối tác hiện tại</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Benefits Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Tại sao chọn chúng tôi?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Những lợi ích vượt trội khi trở thành đối tác chiến lược
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <benefit.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {benefit.title}
                      </h3>
                      <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {benefit.stats}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Partner Types Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Chúng tôi đang tìm kiếm
            </h2>
            <p className="text-xl text-gray-600">
              Các đối tác trong những lĩnh vực sau
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {partnerTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <type.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {type.title}
                      </h3>
                      <div className="text-right">
                        <div className="text-sm text-blue-600 font-medium">
                          Hoa hồng: {type.commission}
                        </div>
                        <div className="text-xs text-gray-500">
                          {type.count} đối tác
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {type.description}
                    </p>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Yêu cầu cơ bản:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {type.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Process Timeline */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Quy trình hợp tác
            </h2>
            <p className="text-xl text-gray-600">
              4 bước đơn giản để trở thành đối tác
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-blue-200 z-0"></div>
                )}
                
                <div className="relative z-10 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">{step.step}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {step.description}
                    </p>
                    <div className="flex items-center justify-center text-xs text-blue-600 mb-3">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {step.time}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-gray-900 mb-2">Bao gồm:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Câu chuyện thành công
            </h2>
            <p className="text-xl text-gray-600">
              Những đối tác đã thành công cùng chúng tôi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{story.name}</h3>
                    <p className="text-sm text-gray-600">{story.type}</p>
                  </div>
                  <div className="ml-auto">
                    <div className="text-lg font-bold text-green-600">{story.growth}</div>
                    <div className="text-xs text-gray-500">tăng trưởng</div>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic">
                  "{story.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements & Contact Form */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Requirements */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Yêu cầu đối tác
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
                <ul className="space-y-4">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                <div className="flex items-start">
                  <HeartIcon className="h-6 w-6 text-blue-600 mr-3 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">
                      💡 Cam kết của chúng tôi
                    </h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Chúng tôi cam kết hỗ trợ đối tác phát triển bền vững thông qua 
                      công nghệ hiện đại, marketing hiệu quả và dịch vụ khách hàng xuất sắc. 
                      Thành công của bạn chính là thành công của chúng tôi!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <PartnerContactForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PartnershipPage;
