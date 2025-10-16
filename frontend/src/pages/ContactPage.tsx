import React, { useState } from 'react';
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { Card, Button, Input } from '../components/ui';
import { showToast } from '../components/ui/Toast';
import { contactService } from '../services';
import type { ContactRequest } from '../services/contactService';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  tourInterest?: string;
}

interface ContactInfo {
  icon: React.ReactNode;
  title: string;
  details: string[];
  color: string;
}

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    tourInterest: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Contact information
  const contactInfo: ContactInfo[] = [
    {
      icon: <PhoneIcon className="h-6 w-6" />,
      title: 'Điện thoại',
      details: ['Hotline: 1900 1234', 'Di động: 0123 456 789'],
      color: 'bg-blue-500'
    },
    {
      icon: <EnvelopeIcon className="h-6 w-6" />,
      title: 'Email',
      details: ['info@tourcompany.vn', 'support@tourcompany.vn'],
      color: 'bg-green-500'
    },
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: 'Địa chỉ',
      details: ['123 Đường ABC, Quận 1', 'TP. Hồ Chí Minh, Việt Nam'],
      color: 'bg-red-500'
    },
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: 'Giờ làm việc',
      details: ['Thứ 2 - Thứ 6: 8:00 - 18:00', 'Thứ 7 - CN: 8:00 - 17:00'],
      color: 'bg-purple-500'
    }
  ];

  // Tour interest options
  const tourInterests = [
    'Tour trong nước',
    'Tour quốc tế',
    'Tour cao cấp',
    'Tour tiết kiệm',
    'Tour gia đình',
    'Tour doanh nghiệp',
    'Khác'
  ];

  // FAQ data with detailed answers
  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: 'Làm thế nào để đặt tour?',
      answer: 'Bạn có thể đặt tour qua nhiều cách: (1) Đặt trực tuyến qua website của chúng tôi - chọn tour, điền thông tin và thanh toán online; (2) Gọi hotline 1900 1234 để được tư vấn trực tiếp từ nhân viên chuyên nghiệp; (3) Đến trực tiếp văn phòng tại 123 Đường ABC, Quận 1, TP.HCM để được tư vấn chi tiết và xem thêm các tour khác. Chúng tôi hỗ trợ đặt tour 24/7 qua website và hotline.'
    },
    {
      id: 2,
      question: 'Chính sách hủy tour như thế nào?',
      answer: 'Chính sách hủy tour phụ thuộc vào thời gian hủy: (1) Hủy trước 30 ngày: hoàn 90% tổng tiền; (2) Hủy trước 15-29 ngày: hoàn 70% tổng tiền; (3) Hủy trước 7-14 ngày: hoàn 50% tổng tiền; (4) Hủy trong vòng 7 ngày: hoàn 20% tổng tiền. Đối với tour cao cấp và tour quốc tế, chính sách có thể khác do ràng buộc với đối tác. Vui lòng đọc kỹ điều khoản khi đặt tour.'
    },
    {
      id: 3,
      question: 'Có hỗ trợ làm visa không?',
      answer: 'Có, chúng tôi cung cấp dịch vụ hỗ trợ làm visa cho tất cả các tour quốc tế. Dịch vụ bao gồm: (1) Tư vấn loại visa phù hợp; (2) Chuẩn bị hồ sơ theo yêu cầu lãnh sự quán; (3) Đặt lịch hẹn và hỗ trợ phỏng vấn; (4) Theo dõi tiến độ xử lý hồ sơ. Phí visa và phí dịch vụ được tính riêng, dao động từ 1-5 triệu VNĐ tùy quốc gia. Thời gian xử lý từ 5-15 ngày làm việc.'
    },
    {
      id: 4,
      question: 'Các hình thức thanh toán được chấp nhận?',
      answer: 'Chúng tôi chấp nhận đa dạng hình thức thanh toán: (1) Tiền mặt tại văn phòng; (2) Chuyển khoản ngân hàng (Vietcombank, BIDV, Techcombank); (3) Thẻ tín dụng/ghi nợ (Visa, Mastercard, JCB); (4) Ví điện tử (ZaloPay, VNPay); (5) Trả góp qua thẻ tín dụng (0% lãi suất cho tour trên 10 triệu). Bạn có thể thanh toán 30% khi đặt tour và 70% trước ngày khởi hành 7 ngày.'
    },
    {
      id: 5,
      question: 'Bảo hiểm du lịch có được bao gồm?',
      answer: 'Tất cả tour của chúng tôi đều bao gồm bảo hiểm du lịch cơ bản với mức bảo hiểm 100 triệu VNĐ/người, bao gồm: tai nạn, ốm đau, mất hành lý cơ bản. Ngoài ra, bạn có thể mua thêm bảo hiểm cao cấp với mức bảo hiểm lên đến 1 tỷ VNĐ, bao gồm: hủy chuyến, chậm chuyến bay, chi phí y tế cao, thể thao mạo hiểm. Phí bảo hiểm cao cấp từ 200.000-500.000 VNĐ/người tùy thời gian và điểm đến.'
    },
    {
      id: 6,
      question: 'Có tổ chức tour riêng theo yêu cầu không?',
      answer: 'Có, chúng tôi chuyên tổ chức tour riêng (private tour) theo yêu cầu của khách hàng với các ưu điểm: (1) Lịch trình linh hoạt theo sở thích; (2) Hướng dẫn viên riêng chuyên nghiệp; (3) Phương tiện di chuyển riêng tư; (4) Lựa chọn khách sạn và nhà hàng theo budget. Minimum 4 người cho tour trong nước, 6 người cho tour quốc tế. Giá tour riêng cao hơn tour ghép đoàn 20-40% nhưng đảm bảo trải nghiệm cá nhân hóa tối đa.'
    }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Vui lòng nhập chủ đề';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Vui lòng nhập nội dung tin nhắn';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Tin nhắn phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleFAQ = (id: number) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast.error('Vui lòng kiểm tra lại thông tin', 'Có lỗi trong form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit contact form via API
      const contactData: ContactRequest = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        tourInterest: formData.tourInterest || undefined
      };

      const response = await contactService.submitContact(contactData);
      
      showToast.success(
        'Gửi tin nhắn thành công!', 
        `Mã liên hệ: #${response.id}. Chúng tôi sẽ phản hồi trong vòng 24 giờ`
      );
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        tourInterest: ''
      });
      
    } catch (error: any) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau';
      showToast.error('Gửi tin nhắn thất bại', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full translate-x-32 -translate-y-32" style={{ background: '#D4AF37' }}></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full -translate-x-48 translate-y-48" style={{ background: '#D4AF37' }}></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95"></div>
        
      <div className="container mx-auto px-4 max-w-6xl relative">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-normal mb-4 tracking-tight animate-fade-in-up opacity-0">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed animate-fade-in-up opacity-0 delay-200">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn tạo ra những chuyến đi tuyệt vời nhất
          </p>
        </div>
      </div>
    </div>

    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-6 animate-slide-in-left opacity-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Thông Tin Liên Hệ
                </h2>
                <p className="text-gray-600 mb-8">
                  Hãy liên hệ với chúng tôi qua các kênh dưới đây hoặc gửi tin nhắn trực tiếp.
                </p>
              </div>

              {/* Contact Cards */}
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <div key={index} className="bg-white border border-stone-200 rounded-none p-5 hover:border-slate-700 hover:shadow-lg transition-all duration-300 animate-fade-in opacity-0" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                    <div className="flex items-start space-x-4">
                      <div className="text-white p-3 rounded-none flex-shrink-0" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900 mb-2 tracking-tight">
                          {info.title}
                        </h3>
                        {info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600 text-sm font-normal leading-relaxed">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Contact */}
              <div className="bg-stone-100 border border-stone-200 rounded-none p-6">
                <div className="text-center">
                  <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4" style={{ color: '#D4AF37' }} />
                  <h3 className="text-lg font-medium text-slate-900 mb-2 tracking-tight">
                    Cần Hỗ Trợ Ngay?
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 font-normal leading-relaxed">
                    Gọi hotline để được tư vấn trực tiếp
                  </p>
                  <button 
                    className="w-full text-white px-6 py-3 rounded-none transition-all duration-300 hover:opacity-90 text-sm font-medium tracking-wide inline-flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                    onClick={() => window.open('tel:19001234')}
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Gọi Ngay: 1900 1234
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-stone-200 rounded-none p-8 animate-slide-in-right opacity-0" id="contact-form">
              <div className="mb-8">
                <h2 className="text-2xl font-normal text-slate-900 mb-2 tracking-tight">
                  Gửi Tin Nhắn
                </h2>
                <p className="text-gray-600 font-normal leading-relaxed">
                  Điền thông tin dưới đây và chúng tôi sẽ phản hồi sớm nhất có thể.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nhập họ và tên"
                      error={errors.name}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Nhập địa chỉ email"
                      error={errors.email}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Phone and Tour Interest */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Nhập số điện thoại"
                      error={errors.phone}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                      Quan tâm đến tour
                    </label>
                    <select
                      value={formData.tourInterest}
                      onChange={(e) => handleInputChange('tourInterest', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 transition-colors font-normal"
                    >
                      <option value="">Chọn loại tour quan tâm</option>
                      {tourInterests.map((interest) => (
                        <option key={interest} value={interest}>
                          {interest}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chủ đề *
                  </label>
                  <Input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="Nhập chủ đề tin nhắn"
                    error={errors.subject}
                    className="w-full"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                    Nội dung tin nhắn *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-none focus:ring-0 focus:border-slate-700 transition-colors resize-none font-normal ${
                      errors.message ? 'border-red-500' : 'border-stone-300'
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 font-normal">{errors.message}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500 font-normal">
                    Tối thiểu 10 ký tự ({formData.message.length}/10)
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[200px] text-white px-8 py-3 rounded-none transition-all duration-300 hover:opacity-90 text-sm font-medium tracking-wide inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                        Gửi Tin Nhắn
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="bg-white border border-stone-200 rounded-none overflow-hidden">
            <div className="p-6 bg-stone-50 border-b border-stone-200">
              <h2 className="text-2xl font-normal text-slate-900 mb-2 tracking-tight">
                Vị Trí Văn Phòng
              </h2>
              <p className="text-gray-600 font-normal leading-relaxed">
                Ghé thăm văn phòng của chúng tôi để được tư vấn trực tiếp
              </p>
            </div>
            
            {/* Embedded Map */}
            <div className="relative h-96 bg-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326002352983!2d106.69831731533349!3d10.776530992320153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4b3332a4bd%3A0x5a981a5efee9fd7d!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBLaG9hIGjhu41jIFThu7Egbmhpw6puIFRQLkhDTQ!5e0!3m2!1svi!2s!4v1635123456789!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vị trí văn phòng"
              />
              
              {/* Map Overlay Info */}
              <div className="absolute top-4 left-4 bg-white rounded-none shadow-lg p-4 max-w-xs border border-stone-200">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
                  <div>
                    <h3 className="font-medium text-slate-900 text-sm tracking-tight">
                      Văn Phòng Chính
                    </h3>
                    <p className="text-gray-600 text-xs mt-1 font-normal leading-relaxed">
                      123 Đường ABC, Quận 1<br />
                      TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white border border-stone-200 rounded-none p-8">
            <h2 className="text-2xl font-normal text-slate-900 mb-8 text-center tracking-tight">
              Câu Hỏi Thường Gặp
            </h2>
            
            <div className="space-y-3">
              {faqItems.map((item, index) => (
                <div key={item.id} className="border border-stone-200 rounded-none overflow-hidden animate-fade-in opacity-0 hover:border-slate-700 transition-all duration-300" style={{ animationDelay: `${index * 0.1}s` }}>
                  <button
                    onClick={() => toggleFAQ(item.id)}
                    className="w-full px-6 py-4 text-left bg-white hover:bg-stone-50 focus:bg-stone-50 focus:outline-none transition-all duration-200 flex items-center justify-between"
                  >
                    <h3 className="font-medium text-slate-900 pr-4 tracking-tight">
                      {item.question}
                    </h3>
                    <div className="flex-shrink-0">
                      {expandedFAQ === item.id ? (
                        <ChevronUpIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedFAQ === item.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 py-4 bg-stone-50 border-t border-stone-200">
                      <p className="text-gray-700 leading-relaxed font-normal text-sm">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Contact CTA */}
            <div className="mt-8 text-center p-6 bg-stone-100 rounded-none border border-stone-200">
              <h3 className="text-lg font-medium text-slate-900 mb-2 tracking-tight">
                Không tìm thấy câu trả lời?
              </h3>
              <p className="text-gray-600 mb-4 font-normal leading-relaxed">
                Liên hệ trực tiếp với chúng tôi để được hỗ trợ chi tiết hơn
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button 
                  onClick={() => window.open('tel:19001234')}
                  className="inline-flex items-center justify-center text-white px-6 py-2.5 rounded-none transition-all duration-300 hover:opacity-90 text-sm font-medium tracking-wide"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                >
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  Gọi Hotline
                </button>
                <button 
                  onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center bg-white text-slate-900 px-6 py-2.5 rounded-none border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 text-sm font-medium tracking-wide"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                  Gửi Tin Nhắn
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
