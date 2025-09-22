import React from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  ChartBarIcon,
  UserGroupIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

const quickBenefits = [
  {
    icon: UsersIcon,
    title: '50K+ Khách hàng',
    description: 'Tiếp cận cơ sở khách hàng rộng lớn'
  },
  {
    icon: ChartBarIcon,
    title: 'Tăng doanh thu',
    description: 'Hoa hồi cạnh tranh 10-20%'
  },
  {
    icon: UserGroupIcon,
    title: 'Hỗ trợ 24/7',
    description: 'Đội ngũ chăm sóc đối tác chuyên nghiệp'
  }
];

const PartnerCTABanner: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="h-8 w-8 text-blue-200 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Trở thành Đối tác của chúng tôi
            </h2>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Cùng phát triển hệ sinh thái du lịch Việt Nam với hơn 1,250+ đối tác tin cậy
          </p>
        </div>

        {/* Quick Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {quickBenefits.map((benefit, index) => (
            <div key={index} className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {benefit.title}
              </h3>
              <p className="text-blue-100 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/become-partner">
              <Button 
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 group"
              >
                Tìm hiểu thêm
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <div className="text-white/80 text-sm">
              <span className="block">Hoặc liên hệ trực tiếp:</span>
              <a href="tel:1900-123-456" className="font-semibold text-white hover:text-blue-200 transition-colors">
                📞 1900-123-456
              </a>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-8 mt-8 text-sm text-blue-200">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Miễn phí tham gia
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Phản hồi trong 24h
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Setup hỗ trợ miễn phí
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTABanner;
