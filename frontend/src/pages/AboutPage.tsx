import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  StarIcon,
  CheckBadgeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Card } from '../components/ui';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const AboutPage: React.FC = () => {
  // Scroll animation hooks for each section
  const timelineSection = useScrollAnimation({ threshold: 0.2 });
  const valuesSection = useScrollAnimation({ threshold: 0.2 });
  const missionSection = useScrollAnimation({ threshold: 0.3 });
  const teamSection = useScrollAnimation({ threshold: 0.2 });
  const whyChooseSection = useScrollAnimation({ threshold: 0.2 });
  const ctaSection = useScrollAnimation({ threshold: 0.3 });

  const coreValues = [
    {
      icon: HeartIcon,
      title: 'Tận Tâm',
      description: 'Luôn đặt lợi ích và trải nghiệm của khách hàng lên hàng đầu trong mọi dịch vụ.'
    },
    {
      icon: CheckBadgeIcon,
      title: 'Chất Lượng',
      description: 'Cam kết mang đến dịch vụ vượt trội với tiêu chuẩn quốc tế.'
    },
    {
      icon: LightBulbIcon,
      title: 'Đổi Mới',
      description: 'Không ngừng sáng tạo và phát triển những sản phẩm du lịch độc đáo.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Trách Nhiệm',
      description: 'Kinh doanh có trách nhiệm với cộng đồng và bảo vệ môi trường.'
    }
  ];

  const timeline = [
    {
      year: '2015',
      title: 'Khởi Đầu Đam Mê',
      description: 'Được thành lập bởi nhóm bạn trẻ yêu thích khám phá, bắt đầu với các tour nội địa và quốc tế khám phá vẻ đẹp thế giới.'
    },
    {
      year: '2018',
      title: 'Mở Rộng Toàn Quốc',
      description: 'Phát triển mạng lưới đối tác trong nước và ra mắt các tour quốc tế đầu tiên đến Thái Lan, Singapore.'
    },
    {
      year: '2020',
      title: 'Chuyển Đổi Số & Quốc Tế Hóa',
      description: 'Ra mắt nền tảng đặt tour online và mở rộng tour quốc tế đến Nhật Bản, Hàn Quốc, châu Âu.'
    },
    {
      year: '2023',
      title: 'Đối Tác Toàn Cầu',
      description: 'Trở thành đối tác tin cậy với 500+ khách hàng, phục vụ tour đến hơn 20 quốc gia trên thế giới.'
    }
  ];

  const teamMembers = [
    {
      name: 'Nguyễn Minh Anh',
      position: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      experience: '8 năm kinh nghiệm trong ngành du lịch',
      quote: '"Du lịch không chỉ là di chuyển, mà là cách chúng ta kết nối với thế giới."'
    },
    {
      name: 'Trần Thị Hương',
      position: 'Giám Đốc Điều Hành Tour Quốc Tế',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      experience: '6 năm kinh nghiệm tổ chức tour nội địa và quốc tế',
      quote: '"Từ trong nước đến quốc tế, mỗi hành trình đều là trải nghiệm đáng nhớ."'
    },
    {
      name: 'Lê Văn Đức',
      position: 'Trưởng Phòng Chăm Sóc Khách Hàng',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      experience: '5 năm kinh nghiệm chăm sóc khách hàng',
      quote: '"Sự hài lòng của khách hàng là động lực lớn nhất của chúng tôi."'
    }
  ];

  const achievements = [
    {
      number: '500+',
      label: 'Tours thành công',
      description: 'Nội địa & quốc tế'
    },
    {
      number: '20+',
      label: 'Quốc gia',
      description: 'Điểm đến trên thế giới'
    },
    {
      number: '4.8/5',
      label: 'Đánh giá khách hàng',
      description: 'Từ 1000+ reviews'
    },
    {
      number: '24/7',
      label: 'Hỗ trợ toàn cầu',
      description: 'Mọi lúc, mọi nơi'
    }
  ];

  const whyChooseUs = [
    {
      icon: UserGroupIcon,
      title: 'Hướng Dẫn Viên Chuyên Nghiệp',
      description: 'Đội ngũ HDV chuyên nghiệp cho cả tour nội địa và quốc tế, có chứng chỉ quốc tế.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Tour Đa Dạng',
      description: 'Từ khám phá trong nước đến chinh phục thế giới với hơn 20 quốc gia điểm đến.'
    },
    {
      icon: PhoneIcon,
      title: 'Hỗ Trợ Toàn Cầu 24/7',
      description: 'Đội ngũ hỗ trợ đa ngôn ngữ, sẵn sàng giúp đỡ bạn ở bất kỳ đâu trên thế giới.'
    },
    {
      icon: CheckBadgeIcon,
      title: 'Đối Tác Quốc Tế',
      description: 'Mạng lưới đối tác uy tín từ trong nước đến các quốc gia trên thế giới.'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=900&fit=crop)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/75 to-slate-900/85"></div>
        </div>
        
        <div className="relative h-full flex items-center justify-center text-center text-white px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-normal mb-6 tracking-tight animate-fade-in-up opacity-0">
              Đam Mê Khám Phá, Tận Tâm Phục Vụ
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 font-normal leading-relaxed animate-fade-in-up opacity-0 delay-200">
              Kết nối bạn với thế giới - Từ trong nước đến năm châu
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              {achievements.map((stat, index) => (
                <div key={index} className="text-center bg-white/5 backdrop-blur-sm p-6 rounded-none border border-white/10 animate-fade-in-scale opacity-0" style={{ animationDelay: `${0.4 + index * 0.1}s` }}>
                  <div className="text-3xl md:text-4xl font-normal mb-2" style={{ color: '#D4AF37' }}>
                    {stat.number}
                  </div>
                  <div className="text-base font-medium mb-1 tracking-wide">{stat.label}</div>
                  <div className="text-sm text-gray-400 font-normal">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Timeline */}
      <section className="py-20 px-4 max-w-7xl mx-auto" ref={timelineSection.ref}>
        <div className={`text-center mb-16 scroll-animate ${timelineSection.isVisible ? 'scroll-fade-in-up' : ''}`}>
          <h2 className="text-4xl md:text-5xl font-normal text-slate-900 mb-4 tracking-tight">
            Câu Chuyện Của Chúng Tôi
              </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Từ những chuyến du lịch nội địa đầu tiên đến việc mở rộng ra thị trường quốc tế, 
            chúng tôi đã trở thành cầu nối đáng tin cậy giữa du khách Việt và thế giới.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full hidden md:block" style={{ background: 'linear-gradient(180deg, #D4AF37 0%, #C5A028 100%)' }}></div>
          
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} scroll-animate ${timelineSection.isVisible ? 'scroll-slide-in' : ''}`} style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="w-full md:w-5/12">
                  <div className="bg-white border border-stone-200 rounded-none p-6 hover:border-slate-700 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center mb-4">
                      <div className="text-white px-4 py-2 rounded-none font-medium text-lg tracking-wide" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                        {item.year}
                      </div>
                    </div>
                    <h3 className="text-xl font-medium text-slate-900 mb-3 tracking-tight">{item.title}</h3>
                    <p className="text-gray-600 font-normal leading-relaxed">{item.description}</p>
                  </div>
                </div>
                
                {/* Timeline dot */}
                <div className="hidden md:flex w-2/12 justify-center">
                  <div className="w-4 h-4 rounded-full border-4 border-white shadow-lg" style={{ background: '#D4AF37' }}></div>
            </div>
            
                <div className="hidden md:block w-5/12"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="py-20 bg-white" ref={missionSection.ref}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-16 scroll-animate ${missionSection.isVisible ? 'scroll-fade-in-up' : ''}`}>
            <h2 className="text-4xl md:text-5xl font-normal text-slate-900 mb-4 tracking-tight">
              Sứ Mệnh, Tầm Nhìn & Giá Trị
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed">
              Những giá trị cốt lõi định hướng mọi hoạt động của chúng tôi
            </p>
          </div>
          
          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className={`bg-stone-50 border border-stone-200 rounded-none p-8 text-center hover:border-slate-700 hover:shadow-lg transition-all duration-300 scroll-animate ${missionSection.isVisible ? 'scroll-slide-in' : ''}`} style={{ animationDelay: '0s' }}>
              <div className="w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-slate-900 mb-4 tracking-tight">Sứ Mệnh</h3>
              <p className="text-gray-600 text-base leading-relaxed font-normal">
                Mang đến những trải nghiệm du lịch đích thực, an toàn và đáng nhớ 
                cho du khách trong nước và quốc tế, kết nối họ với thế giới và quảng bá văn hóa Việt ra toàn cầu.
              </p>
            </div>

            <div className={`bg-stone-50 border border-stone-200 rounded-none p-8 text-center hover:border-slate-700 hover:shadow-lg transition-all duration-300 scroll-animate ${missionSection.isVisible ? 'scroll-slide-in' : ''}`} style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-medium text-slate-900 mb-4 tracking-tight">Tầm Nhìn</h3>
              <p className="text-gray-600 text-base leading-relaxed font-normal">
                Trở thành công ty lữ hành hàng đầu Việt Nam, được công nhận quốc tế 
                về chất lượng dịch vụ và du lịch bền vững.
              </p>
            </div>
            </div>
            
          {/* Core Values */}
          <div ref={valuesSection.ref}>
            <h3 className={`text-3xl font-normal text-center text-slate-900 mb-12 tracking-tight scroll-animate ${valuesSection.isVisible ? 'scroll-zoom-in' : ''}`}>Giá Trị Cốt Lõi</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreValues.map((value, index) => (
                <div key={index} className={`bg-white border border-stone-200 rounded-none p-6 text-center hover:border-slate-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 scroll-animate ${valuesSection.isVisible ? 'scroll-rotate-in' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="bg-stone-100 w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-4 transition-transform duration-300 hover:scale-110">
                    <value.icon className="w-8 h-8" style={{ color: '#D4AF37' }} />
              </div>
                  <h4 className="text-lg font-medium text-slate-900 mb-3 tracking-tight">{value.title}</h4>
                  <p className="text-gray-600 text-sm font-normal leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-20 bg-stone-50" ref={teamSection.ref}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-16 scroll-animate ${teamSection.isVisible ? 'scroll-fade-in-up' : ''}`}>
            <h2 className="text-4xl md:text-5xl font-normal text-slate-900 mb-4 tracking-tight">
              Đội Ngũ Của Chúng Tôi
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed">
              Những con người tài năng và đam mê tạo nên sự khác biệt
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className={`bg-white border border-stone-200 rounded-none p-6 text-center hover:border-slate-700 hover:shadow-lg transition-all duration-300 scroll-animate ${teamSection.isVisible ? 'scroll-zoom-in' : ''}`} style={{ animationDelay: teamSection.isVisible ? `${index * 0.15}s` : '0s' }}>
                  <img
                    src={member.image}
                    alt={member.name}
                  className="w-32 h-32 rounded-none mx-auto mb-6 object-cover border-2 transition-transform duration-300 hover:scale-105" style={{ borderColor: '#D4AF37' }}
                />
                <h3 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">{member.name}</h3>
                <p className="font-medium mb-3 text-sm tracking-wide" style={{ color: '#D4AF37' }}>{member.position}</p>
                <p className="text-gray-600 mb-4 text-sm font-normal">{member.experience}</p>
                <blockquote className="text-gray-700 italic text-sm font-normal leading-relaxed border-l-2 pl-4" style={{ borderColor: '#D4AF37' }}>
                    {member.quote}
                  </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white" ref={whyChooseSection.ref}>
        <div className="max-w-7xl mx-auto px-4">
          <div className={`text-center mb-16 scroll-animate ${whyChooseSection.isVisible ? 'scroll-fade-in-up' : ''}`}>
            <h2 className="text-4xl md:text-5xl font-normal text-slate-900 mb-4 tracking-tight">
              Tại Sao Lựa Chọn Chúng Tôi?
            </h2>
            <p className="text-lg text-gray-600 font-normal leading-relaxed">
              Những lý do thuyết phục để bạn tin tưởng và đồng hành cùng chúng tôi
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {whyChooseUs.map((reason, index) => (
              <div key={index} className={`bg-stone-50 border border-stone-200 rounded-none p-6 text-center hover:border-slate-700 hover:shadow-lg transition-all duration-300 scroll-animate ${whyChooseSection.isVisible ? 'scroll-fade-in-up' : ''}`} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="bg-stone-100 w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-4">
                  <reason.icon className="w-8 h-8" style={{ color: '#D4AF37' }} />
                </div>
                <h3 className="text-base font-medium text-slate-900 mb-3 tracking-tight">{reason.title}</h3>
                <p className="text-gray-600 text-sm font-normal leading-relaxed">{reason.description}</p>
              </div>
            ))}
                  </div>

          {/* Additional Stats */}
          <div className="bg-stone-50 border border-stone-200 rounded-none p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-normal mb-2" style={{ color: '#D4AF37' }}>
                    {stat.number}
                  </div>
                  <div className="text-base font-medium text-slate-900 mb-1 tracking-wide">{stat.label}</div>
                  <div className="text-sm text-gray-600 font-normal">{stat.description}</div>
                </div>
              ))}
              </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-slate-900 relative overflow-hidden" ref={ctaSection.ref}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full -translate-x-32 -translate-y-32" style={{ background: '#D4AF37' }}></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full translate-x-48 translate-y-48" style={{ background: '#D4AF37' }}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95"></div>
        
        <div className={`relative max-w-4xl mx-auto text-center px-4 scroll-animate ${ctaSection.isVisible ? 'scroll-zoom-in' : ''}`}>
          <h2 className="text-4xl md:text-5xl font-normal text-white mb-6 tracking-tight">
            Sẵn Sàng Khám Phá Thế Giới Cùng Chúng Tôi?
          </h2>
          <p className="text-lg text-gray-300 mb-10 font-normal leading-relaxed">
            Từ Việt Nam đến năm châu - Hãy để chúng tôi biến ước mơ du lịch của bạn thành hiện thực
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tours"
              className="bg-white text-slate-900 px-8 py-4 rounded-none font-medium text-base hover:bg-gray-100 transition-all duration-300 hover:shadow-lg inline-flex items-center justify-center tracking-wide"
            >
              <GlobeAltIcon className="w-5 h-5 mr-2" />
              Khám Phá Các Tour Du Lịch
            </Link>
            
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-none font-medium text-base hover:bg-white transition-all duration-300 hover:shadow-lg inline-flex items-center justify-center tracking-wide hover:text-slate-900"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Liên Hệ Để Được Tư Vấn
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid #D4AF37' }}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400 font-normal">
              <div className="flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2" style={{ color: '#D4AF37' }} />
                <span>Hotline: 1900 1234 (24/7)</span>
              </div>
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" style={{ color: '#D4AF37' }} />
                <span>Email: info@tourcompany.vn</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
