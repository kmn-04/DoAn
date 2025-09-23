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

const AboutPage: React.FC = () => {
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
      description: 'Được thành lập bởi nhóm bạn trẻ yêu thích khám phá, bắt đầu với các tour nội địa khám phá vẻ đẹp Việt Nam.'
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
      quote: '"Từ Việt Nam đến thế giới, mỗi hành trình đều là trải nghiệm đáng nhớ."'
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
      description: 'Từ khám phá Việt Nam đến chinh phục thế giới với hơn 20 quốc gia điểm đến.'
    },
    {
      icon: PhoneIcon,
      title: 'Hỗ Trợ Toàn Cầu 24/7',
      description: 'Đội ngũ hỗ trợ đa ngôn ngữ, sẵn sàng giúp đỡ bạn ở bất kỳ đâu trên thế giới.'
    },
    {
      icon: CheckBadgeIcon,
      title: 'Đối Tác Quốc Tế',
      description: 'Mạng lưới đối tác uy tín từ Việt Nam đến các quốc gia trên thế giới.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-blue-900 to-blue-700">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-blend-overlay"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&h=900&fit=crop)'
          }}
        >
          <div className="absolute inset-0 bg-blue-900/60"></div>
        </div>
        
        <div className="relative h-full flex items-center justify-center text-center text-white px-4">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Đam Mê Khám Phá, Tận Tâm Phục Vụ
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Kết nối bạn với thế giới - Từ Việt Nam đến năm châu
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              {achievements.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold mb-1">{stat.label}</div>
                  <div className="text-sm text-blue-200">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Timeline */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Câu Chuyện Của Chúng Tôi
              </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Từ những chuyến du lịch nội địa đầu tiên đến việc mở rộng ra thị trường quốc tế, 
            chúng tôi đã trở thành cầu nối đáng tin cậy giữa du khách Việt và thế giới.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200 hidden md:block"></div>
          
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div key={index} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="w-full md:w-5/12">
                  <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-full font-bold text-lg">
                        {item.year}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </Card>
                </div>
                
                {/* Timeline dot */}
                <div className="hidden md:flex w-2/12 justify-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
            </div>
            
                <div className="hidden md:block w-5/12"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Sứ Mệnh, Tầm Nhìn & Giá Trị
            </h2>
            <p className="text-xl text-gray-600">
              Những giá trị cốt lõi định hướng mọi hoạt động của chúng tôi
            </p>
          </div>
          
          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="p-8 text-center bg-blue-50 border-blue-200">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <HeartIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sứ Mệnh</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Mang đến những trải nghiệm du lịch đích thực, an toàn và đáng nhớ 
                cho du khách Việt Nam, kết nối họ với thế giới và quảng bá văn hóa Việt ra toàn cầu.
              </p>
            </Card>

            <Card className="p-8 text-center bg-green-50 border-green-200">
              <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Tầm Nhìn</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Trở thành công ty lữ hành hàng đầu Việt Nam, được công nhận quốc tế 
                về chất lượng dịch vụ và du lịch bền vững.
              </p>
            </Card>
            </div>
            
          {/* Core Values */}
          <div>
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">Giá Trị Cốt Lõi</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {coreValues.map((value, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-8 h-8 text-blue-600" />
              </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h4>
                  <p className="text-gray-600">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Đội Ngũ Của Chúng Tôi
            </h2>
            <p className="text-xl text-gray-600">
              Những con người tài năng và đam mê tạo nên sự khác biệt
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <img
                    src={member.image}
                    alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-blue-100"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{member.position}</p>
                <p className="text-gray-600 mb-4">{member.experience}</p>
                <blockquote className="text-gray-700 italic border-l-4 border-blue-200 pl-4">
                    {member.quote}
                  </blockquote>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tại Sao Lựa Chọn Chúng Tôi?
            </h2>
            <p className="text-xl text-gray-600">
              Những lý do thuyết phục để bạn tin tưởng và đồng hành cùng chúng tôi
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {whyChooseUs.map((reason, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <reason.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{reason.title}</h3>
                <p className="text-gray-600">{reason.description}</p>
              </Card>
            ))}
                  </div>

          {/* Additional Stats */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.description}</div>
                </div>
              ))}
              </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Sẵn Sàng Khám Phá Thế Giới Cùng Chúng Tôi?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Từ Việt Nam đến năm châu - Hãy để chúng tôi biến ước mơ du lịch của bạn thành hiện thực
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tours"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
            >
              <GlobeAltIcon className="w-5 h-5 mr-2" />
              Khám Phá Các Tour Du Lịch
            </Link>
            
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Liên Hệ Để Được Tư Vấn
            </Link>
          </div>
          
          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t border-blue-500">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-100">
              <div className="flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2" />
                <span>Hotline: 1900 1234 (24/7)</span>
              </div>
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
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
