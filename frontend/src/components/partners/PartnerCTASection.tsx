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
  ClockIcon
} from '@heroicons/react/24/outline';
import PartnerContactForm from './PartnerContactForm';

const benefits = [
  {
    icon: UsersIcon,
    title: 'Tiếp cận 50K+ khách hàng/tháng',
    description: 'Kết nối với cơ sở khách hàng rộng lớn và đa dạng trên toàn quốc'
  },
  {
    icon: ChartBarIcon,
    title: 'Tăng doanh thu 30-50%',
    description: 'Nguồn booking ổn định từ platform với commission hấp dẫn'
  },
  {
    icon: SpeakerWaveIcon,
    title: 'Quảng bá thương hiệu miễn phí',
    description: 'Featured placement, social media marketing và SEO optimization'
  },
  {
    icon: UserGroupIcon,
    title: 'Hỗ trợ chuyên nghiệp 24/7',
    description: 'Đội ngũ chăm sóc đối tác tận tình và quy trình hợp tác minh bạch'
  }
];

const partnerTypes = [
  {
    icon: BuildingOffice2Icon,
    title: 'Khách sạn & Resort',
    description: 'Từ homestay đến resort 5 sao',
    count: '500+'
  },
  {
    icon: HomeIcon,
    title: 'Nhà hàng & F&B',
    description: 'Ẩm thực địa phương và quốc tế',
    count: '300+'
  },
  {
    icon: TruckIcon,
    title: 'Vận chuyển',
    description: 'Xe bus, taxi, thuê xe máy',
    count: '200+'
  },
  {
    icon: MapIcon,
    title: 'Tour Operator',
    description: 'Nhà điều hành tour chuyên nghiệp',
    count: '150+'
  },
  {
    icon: CogIcon,
    title: 'Dịch vụ khác',
    description: 'SPA, giải trí, hoạt động thể thao',
    count: '100+'
  }
];

const processSteps = [
  {
    step: 1,
    title: 'Gửi thông tin',
    description: 'Điền form đăng ký với thông tin cơ bản',
    time: '5 phút'
  },
  {
    step: 2,
    title: 'Đánh giá hồ sơ',
    description: 'Chúng tôi xem xét và đánh giá ứng viên',
    time: '1-2 ngày'
  },
  {
    step: 3,
    title: 'Thảo luận điều khoản',
    description: 'Họp online để thống nhất mức hoa hồng',
    time: '3-5 ngày'
  },
  {
    step: 4,
    title: 'Bắt đầu hợp tác',
    description: 'Ký kết và onboarding vào hệ thống',
    time: '1 tuần'
  }
];

const requirements = [
  'Giấy phép kinh doanh hợp lệ',
  'Tối thiểu 1 năm hoạt động trong ngành',
  'Chất lượng dịch vụ đạt chuẩn tốt',
  'Cam kết hợp tác dài hạn ít nhất 1 năm',
  'Có khả năng phục vụ khách hàng online',
  'Tuân thủ các quy định về an toàn du lịch'
];

const PartnerCTASection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trở thành Đối tác Chiến lược
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Cùng phát triển hệ sinh thái du lịch Việt Nam với mạng lưới đối tác uy tín và chuyên nghiệp
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span>Miễn phí tham gia</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span>Hoa hồng cạnh tranh</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span>Hỗ trợ marketing</span>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Lợi ích khi hợp tác với chúng tôi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <benefit.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Types */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Chúng tôi đang tìm kiếm đối tác
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {partnerTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <type.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {type.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {type.description}
                  </p>
                  <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                    {type.count} đối tác
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Timeline */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Quy trình hợp tác
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-blue-200 z-0"></div>
                )}
                
                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {step.description}
                  </p>
                  <div className="flex items-center justify-center text-xs text-blue-600">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {step.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements & Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Requirements */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Yêu cầu đối tác
            </h3>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <ul className="space-y-4">
                {requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{requirement}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  💡 Lưu ý quan trọng
                </h4>
                <p className="text-sm text-blue-800">
                  Chúng tôi ưu tiên các đối tác có định hướng phát triển bền vững và 
                  cam kết mang lại trải nghiệm tốt nhất cho khách hàng.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <PartnerContactForm />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Sẵn sàng bắt đầu hành trình hợp tác?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Hãy để chúng tôi cùng nhau xây dựng một hệ sinh thái du lịch phát triển và bền vững. 
              Đội ngũ của chúng tôi sẽ hỗ trợ bạn trong mọi bước của quá trình hợp tác.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                Phản hồi trong 24h
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                Tư vấn miễn phí
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-300 rounded-full mr-2"></span>
                Hỗ trợ setup
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTASection;
