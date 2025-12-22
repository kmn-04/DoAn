import React from 'react';
import { useTranslation } from 'react-i18next';
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

const getBenefits = (t: any) => [
  {
    icon: UsersIcon,
    title: t('partners.partnership.benefits.items.access.title'),
    description: t('partners.partnership.benefits.items.access.description'),
    stats: '50,000+'
  },
  {
    icon: ChartBarIcon,
    title: t('partners.partnership.benefits.items.revenue.title'),
    description: t('partners.partnership.benefits.items.revenue.description'),
    stats: '30-50%'
  },
  {
    icon: SpeakerWaveIcon,
    title: t('partners.partnership.benefits.items.marketing.title'),
    description: t('partners.partnership.benefits.items.marketing.description'),
    stats: 'Free'
  },
  {
    icon: UserGroupIcon,
    title: t('partners.partnership.benefits.items.support.title'),
    description: t('partners.partnership.benefits.items.support.description'),
    stats: '24/7'
  },
  {
    icon: ShieldCheckIcon,
    title: t('partners.partnership.benefits.items.protection.title'),
    description: t('partners.partnership.benefits.items.protection.description'),
    stats: '100%'
  },
  {
    icon: CurrencyDollarIcon,
    title: t('partners.partnership.benefits.items.commission.title'),
    description: t('partners.partnership.benefits.items.commission.description'),
    stats: '10-20%'
  }
];

const getPartnerTypes = (t: any) => [
  {
    icon: BuildingOffice2Icon,
    title: t('partners.partnership.partnerTypes.hotel.title'),
    description: t('partners.partnership.partnerTypes.hotel.description'),
    count: '500+',
    commission: '12-18%',
    requirements: ['Giấy phép kinh doanh', 'Rating tối thiểu 3.5⭐', 'Hỗ trợ booking online']
  },
  {
    icon: HomeIcon,
    title: t('partners.partnership.partnerTypes.restaurant.title'),
    description: t('partners.partnership.partnerTypes.restaurant.description'),
    count: '300+',
    commission: '8-12%',
    requirements: ['Chứng nhận ATTP', 'Menu đa dạng', 'Phục vụ group tour']
  },
  {
    icon: TruckIcon,
    title: t('partners.partnership.partnerTypes.transport.title'),
    description: t('partners.partnership.partnerTypes.transport.description'),
    count: '200+',
    commission: '10-15%',
    requirements: ['Bảo hiểm xe', 'Lái xe có kinh nghiệm', 'Đúng giờ, an toàn']
  },
  {
    icon: MapIcon,
    title: t('partners.partnership.partnerTypes.tourOperator.title'),
    description: t('partners.partnership.partnerTypes.tourOperator.description'),
    count: '150+',
    commission: '15-20%',
    requirements: ['Hướng dẫn viên chuyên nghiệp', 'Chương trình tour chi tiết', 'Emergency support']
  },
  {
    icon: CogIcon,
    title: t('partners.partnership.partnerTypes.service.title'),
    description: t('partners.partnership.partnerTypes.service.description'),
    count: '100+',
    commission: '8-15%',
    requirements: ['Thiết bị an toàn', 'Staff được training', 'Insurance coverage']
  }
];

const getProcessSteps = (t: any) => [
  {
    step: 1,
    title: t('partners.partnership.process.steps.1.title'),
    description: t('partners.partnership.process.steps.1.description'),
    time: t('partners.partnership.process.steps.1.time'),
    details: ['Thông tin công ty', 'Người liên hệ', 'Loại hình kinh doanh', 'Tài liệu đính kèm']
  },
  {
    step: 2,
    title: t('partners.partnership.process.steps.2.title'),
    description: t('partners.partnership.process.steps.2.description'),
    time: t('partners.partnership.process.steps.2.time'),
    details: ['Kiểm tra giấy tờ', 'Đánh giá chất lượng', 'Background check', 'Site visit (nếu cần)']
  },
  {
    step: 3,
    title: t('partners.partnership.process.steps.3.title'),
    description: t('partners.partnership.process.steps.3.description'),
    time: t('partners.partnership.process.steps.3.time'),
    details: ['Commission rate', 'Payment terms', 'Marketing support', 'Service standards']
  },
  {
    step: 4,
    title: t('partners.partnership.process.steps.4.title'),
    description: t('partners.partnership.process.steps.4.description'),
    time: t('partners.partnership.process.steps.4.time'),
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
  const { t } = useTranslation();
  const benefits = getBenefits(t);
  const partnerTypes = getPartnerTypes(t);
  const processSteps = getProcessSteps(t);
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-stone-200 animate-fade-in opacity-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link 
            to="/partners"
            className="inline-flex items-center text-sm text-slate-700 hover:text-slate-900 transition-colors group font-normal tracking-wide"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('partners.partnership.backToList')}
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-slate-900 overflow-hidden animate-fade-in-up opacity-0 delay-100">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&h=800&fit=crop"
            alt="Partnership"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-6 animate-fade-in opacity-0 delay-200">
              <SparklesIcon className="h-10 w-10 mr-4" style={{ color: '#D4AF37' }} />
              <h1 className="text-4xl md:text-6xl font-normal tracking-tight">
                {t('partners.partnership.hero.title')}
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 font-normal leading-relaxed animate-fade-in opacity-0 delay-300">
              {t('partners.partnership.hero.subtitle')} <span className="font-medium" style={{ color: '#D4AF37' }}>1,250+</span> {t('partners.partnership.hero.subtitle', { defaultValue: 'trusted partners' })}
            </p>
            
            {/* Quick Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto animate-fade-in opacity-0 delay-400">
              <div className="text-center bg-white/5 backdrop-blur-sm p-6 rounded-none border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl font-normal mb-2" style={{ color: '#D4AF37' }}>50K+</div>
                <div className="text-sm text-gray-400 font-normal tracking-wide">{t('partners.partnership.hero.stats.customers')}</div>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-sm p-6 rounded-none border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl font-normal mb-2" style={{ color: '#D4AF37' }}>15-20%</div>
                <div className="text-sm text-gray-400 font-normal tracking-wide">{t('partners.partnership.hero.stats.commission')}</div>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-sm p-6 rounded-none border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl font-normal mb-2" style={{ color: '#D4AF37' }}>24/7</div>
                <div className="text-sm text-gray-400 font-normal tracking-wide">{t('partners.partnership.hero.stats.support')}</div>
              </div>
              <div className="text-center bg-white/5 backdrop-blur-sm p-6 rounded-none border border-white/10 hover:bg-white/10 transition-all duration-300">
                <div className="text-3xl font-normal mb-2" style={{ color: '#D4AF37' }}>1,250+</div>
                <div className="text-sm text-gray-400 font-normal tracking-wide">{t('partners.partnership.hero.stats.currentPartners')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Benefits Section */}
        <section className="mb-20">
          <div className="text-center mb-12 animate-fade-in opacity-0 delay-100">
            <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-4 tracking-tight">
              {t('partners.partnership.benefits.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto font-normal leading-relaxed">
              {t('partners.partnership.benefits.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-none p-6 border border-stone-200 hover:border-slate-700 hover:shadow-lg transition-all duration-300 group animate-fade-in-up opacity-0" style={{ animationDelay: `${(index + 2) * 100}ms` }}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-none flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                    <benefit.icon className="h-6 w-6" style={{ color: '#D4AF37' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-900 text-base tracking-tight">
                        {benefit.title}
                      </h3>
                      <span className="text-sm font-medium text-white px-3 py-1 rounded-none whitespace-nowrap" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                        {benefit.stats}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed font-normal">
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
          <div className="text-center mb-12 animate-fade-in opacity-0 delay-100">
            <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-4 tracking-tight">
              {t('partners.partnership.partnerTypes.title')}
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed">
              {t('partners.partnership.partnerTypes.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {partnerTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-none p-6 border border-stone-200 hover:border-slate-700 hover:shadow-lg transition-all duration-300 animate-fade-in-up opacity-0" style={{ animationDelay: `${(index + 2) * 100}ms` }}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-stone-100 rounded-none flex items-center justify-center">
                    <type.icon className="h-6 w-6" style={{ color: '#D4AF37' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-slate-900 tracking-tight">
                        {type.title}
                      </h3>
                      <div className="text-right">
                        <div className="text-sm font-medium mb-1" style={{ color: '#D4AF37' }}>
                          {t('partners.partnership.partnerTypes.hotel.commission')} {type.commission}
                        </div>
                        <div className="text-xs text-gray-500 font-normal">
                          {type.count} {t('partners.partnership.partnerTypes.hotel.partners')}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 font-normal text-sm leading-relaxed">
                      {type.description}
                    </p>
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 mb-2">{t('partners.partnership.partnerTypes.hotel.requirements')}</h4>
                      <ul className="text-sm text-gray-600 space-y-1.5">
                        {type.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center font-normal">
                            <CheckCircleIcon className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: '#D4AF37' }} />
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
          <div className="text-center mb-12 animate-fade-in opacity-0 delay-100">
            <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-4 tracking-tight">
              {t('partners.partnership.process.title')}
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed">
              {t('partners.partnership.process.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line */}
                {index < processSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 z-0" style={{ background: 'linear-gradient(90deg, #D4AF37 0%, #C5A028 100%)' }}></div>
                )}
                
                <div className="relative z-10 bg-white rounded-none p-6 border border-stone-200 hover:border-slate-700 hover:shadow-lg transition-all duration-300 animate-fade-in-up opacity-0" style={{ animationDelay: `${(index + 2) * 100}ms` }}>
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 rounded-none flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                      <span className="text-white font-medium">{step.step}</span>
                    </div>
                    <h3 className="font-medium text-slate-900 mb-2 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 font-normal leading-relaxed">
                      {step.description}
                    </p>
                    <div className="flex items-center justify-center text-xs mb-3" style={{ color: '#D4AF37' }}>
                      <ClockIcon className="h-4 w-4 mr-1" />
                      <span className="font-normal">{step.time}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-slate-900 mb-2">{t('partners.partnership.process.steps.1.includes')}</h4>
                    <ul className="text-xs text-gray-600 space-y-1.5">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center font-normal">
                          <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ background: '#D4AF37' }}></div>
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
          <div className="text-center mb-12 animate-fade-in opacity-0 delay-100">
            <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-4 tracking-tight">
              {t('partners.partnership.successStories.title')}
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed">
              {t('partners.partnership.successStories.subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white rounded-none p-6 border border-stone-200 hover:border-slate-700 hover:shadow-lg transition-all duration-300 animate-fade-in-up opacity-0" style={{ animationDelay: `${(index + 2) * 100}ms` }}>
                <div className="flex items-center mb-4">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-12 h-12 rounded-none mr-4 border border-stone-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 tracking-tight">{story.name}</h3>
                    <p className="text-sm text-gray-600 font-normal">{story.type}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium" style={{ color: '#D4AF37' }}>{story.growth}</div>
                    <div className="text-xs text-gray-500 font-normal">{t('partners.partnership.successStories.growth')}</div>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic font-normal text-sm leading-relaxed">
                  "{story.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </section>

        {/* Requirements & Contact Form */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Requirements */}
            <div className="animate-fade-in-up opacity-0 delay-200">
              <h3 className="text-2xl font-normal text-slate-900 mb-6 tracking-tight">
                {t('partners.partnership.requirements.title')}
              </h3>
              <div className="bg-white rounded-none p-6 border border-stone-200 mb-6">
                <ul className="space-y-3.5">
                  {requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
                      <span className="text-gray-700 font-normal text-sm leading-relaxed">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-stone-100 rounded-none p-6 border border-stone-200">
                <div className="flex items-start">
                  <HeartIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0" style={{ color: '#D4AF37' }} />
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2 tracking-tight">
                      {t('partners.partnership.requirements.commitment.title')}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed font-normal">
                      {t('partners.partnership.requirements.commitment.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-fade-in-up opacity-0 delay-300">
              <PartnerContactForm />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PartnershipPage;
