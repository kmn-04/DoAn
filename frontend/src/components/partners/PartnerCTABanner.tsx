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
    <section className="py-20 bg-slate-900 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-x-32 -translate-y-32" style={{ background: '#D4AF37' }}></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full translate-x-48 translate-y-48" style={{ background: '#D4AF37' }}></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in opacity-0">
          <div className="flex items-center justify-center mb-4">
            <SparklesIcon className="h-8 w-8 mr-3" style={{ color: '#D4AF37' }} />
            <h2 className="text-3xl md:text-4xl font-normal text-white tracking-tight">
              Trở thành Đối tác của chúng tôi
            </h2>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Cùng phát triển hệ sinh thái du lịch Việt Nam với hơn <span className="font-medium" style={{ color: '#D4AF37' }}>1,250+</span> đối tác tin cậy
          </p>
        </div>

        {/* Quick Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {quickBenefits.map((benefit, index) => (
            <div key={index} className="text-center text-white bg-white/5 backdrop-blur-sm p-6 rounded-none border border-white/10 hover:bg-white/10 transition-all duration-300 animate-fade-in-up opacity-0" style={{ animationDelay: `${(index + 1) * 100}ms` }}>
              <div className="w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                <benefit.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-medium mb-2 tracking-tight">
                {benefit.title}
              </h3>
              <p className="text-gray-400 text-sm font-normal leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="text-center animate-fade-in opacity-0 delay-400">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/become-partner">
              <button className="inline-flex items-center bg-white text-slate-900 px-8 py-3 rounded-none hover:bg-gray-100 transition-all duration-300 text-sm font-medium tracking-wide group shadow-lg">
                Tìm hiểu thêm
                <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            
            <div className="text-gray-400 text-sm font-normal">
              <span className="block mb-1">Hoặc liên hệ trực tiếp:</span>
              <a href="tel:1900-123-456" className="font-medium text-white hover:opacity-80 transition-colors" style={{ color: '#D4AF37' }}>
                📞 1900-123-456
              </a>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-8 text-sm text-gray-400">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full mr-2" style={{ background: '#D4AF37' }}></span>
              <span className="font-normal">Miễn phí tham gia</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full mr-2" style={{ background: '#D4AF37' }}></span>
              <span className="font-normal">Phản hồi trong 24h</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full mr-2" style={{ background: '#D4AF37' }}></span>
              <span className="font-normal">Setup hỗ trợ miễn phí</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTABanner;
