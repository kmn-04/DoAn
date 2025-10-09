import React, { useState } from 'react';
import { 
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';

interface PartnerContactFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  businessType: string;
  location: string;
  website: string;
  message: string;
}

const partnerTypes = [
  { value: '', label: 'Chọn lĩnh vực kinh doanh' },
  { value: 'Hotel', label: 'Khách sạn & Resort' },
  { value: 'Restaurant', label: 'Nhà hàng & F&B' },
  { value: 'Transport', label: 'Vận chuyển' },
  { value: 'TourOperator', label: 'Tour Operator' },
  { value: 'Service', label: 'Dịch vụ khác' }
];

const PartnerContactForm: React.FC = () => {
  const [formData, setFormData] = useState<PartnerContactFormData>({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: '',
    location: '',
    website: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Reset form
      setFormData({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        businessType: '',
        location: '',
        website: '',
        message: ''
      });
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-none border border-stone-200 shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-none flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">
          Cảm ơn bạn đã quan tâm!
        </h3>
        <p className="text-gray-600 mb-6 font-normal leading-relaxed">
          Chúng tôi đã nhận được thông tin của bạn và sẽ liên hệ trong vòng 24 giờ.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="inline-flex items-center bg-white text-slate-900 px-6 py-3 rounded-none border-2 border-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 text-sm font-medium tracking-wide"
        >
          Gửi thêm thông tin khác
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-none border border-stone-200 shadow-lg p-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-normal text-slate-900 mb-3 tracking-tight">
          Đăng ký Hợp tác
        </h3>
        <p className="text-gray-600 font-normal leading-relaxed">
          Điền thông tin để chúng tôi liên hệ và tư vấn chi tiết
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
              Tên công ty/doanh nghiệp *
            </label>
            <div className="relative">
              <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#D4AF37' }} />
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 transition-colors font-normal"
                placeholder="VD: ABC Travel Company"
              />
            </div>
          </div>

          {/* Contact Person */}
          <div>
            <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
              Người liên hệ *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#D4AF37' }} />
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 transition-colors font-normal"
                placeholder="Họ và tên"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
              Email *
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#D4AF37' }} />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 transition-colors font-normal"
                placeholder="contact@company.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
              Số điện thoại *
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#D4AF37' }} />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 transition-colors font-normal"
                placeholder="0123 456 789"
              />
            </div>
          </div>

          {/* Business Type */}
          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
              Lĩnh vực hoạt động *
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 transition-colors font-normal"
            >
              {partnerTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
              Địa điểm hoạt động *
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#D4AF37' }} />
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 transition-colors font-normal"
                placeholder="VD: Hà Nội, TP.HCM, Đà Nẵng"
              />
            </div>
          </div>
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
            Website (tùy chọn)
          </label>
          <div className="relative">
            <GlobeAltIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#D4AF37' }} />
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 transition-colors font-normal"
              placeholder="https://www.company.com"
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
            Lời nhắn
          </label>
          <div className="relative">
            <ChatBubbleLeftRightIcon className="absolute left-3 top-3 h-5 w-5" style={{ color: '#D4AF37' }} />
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={4}
              className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 transition-colors resize-none font-normal"
              placeholder="Chia sẻ thêm về doanh nghiệp của bạn và mong muốn hợp tác..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto min-w-[200px] text-white px-8 py-3 rounded-none hover:opacity-90 transition-all duration-300 text-sm font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang gửi...
              </div>
            ) : (
              'Gửi thông tin hợp tác'
            )}
          </button>
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 text-center font-normal">
          Thông tin của bạn sẽ được bảo mật và chỉ sử dụng để liên hệ hợp tác.
        </p>
      </form>
    </div>
  );
};

export default PartnerContactForm;
