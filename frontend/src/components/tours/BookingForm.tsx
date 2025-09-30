import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CalendarDaysIcon,
  UsersIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';

interface BookingFormProps {
  tour: {
    id: number;
    slug: string;
    name: string;
    price: number;
    originalPrice?: number;
    maxPeople: number;
    availableDates: string[];
  };
  onBooking: (bookingData: BookingData) => void;
}

interface BookingData {
  tourId: number;
  startDate: string;
  adults: number;
  children: number;
  totalPrice: number;
  specialRequests?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ tour, onBooking }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    startDate: '',
    adults: 1,
    children: 0,
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const childPrice = tour.price * 0.7; // 70% of adult price
  const totalPeople = formData.adults + formData.children;
  const totalPrice = (formData.adults * tour.price) + (formData.children * childPrice);
  
  const discountPercentage = tour.originalPrice 
    ? Math.round(((tour.originalPrice - tour.price) / tour.originalPrice) * 100)
    : 0;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Vui lòng chọn ngày khởi hành';
    }

    if (formData.adults < 1) {
      newErrors.adults = 'Phải có ít nhất 1 người lớn';
    }

    if (totalPeople > tour.maxPeople) {
      newErrors.totalPeople = `Tối đa ${tour.maxPeople} người cho tour này`;
    }

    if (totalPeople < 1) {
      newErrors.totalPeople = 'Phải có ít nhất 1 người tham gia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Check if user is logged in
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Redirect to checkout page with booking data
    const params = new URLSearchParams({
      tourId: tour.id.toString(),
      tourSlug: tour.slug,
      tourName: tour.name,
      startDate: formData.startDate,
      adults: formData.adults.toString(),
      children: formData.children.toString(),
      totalPrice: totalPrice.toString(),
      ...(formData.specialRequests && { specialRequests: formData.specialRequests })
    });

    navigate(`/booking/checkout?${params.toString()}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Generate available dates (next 3 months, weekends only for demo)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Only weekends for demo
      if (date.getDay() === 0 || date.getDay() === 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return dates.slice(0, 20); // Limit to 20 dates
  };

  const availableDates = generateAvailableDates();

  return (
    <div className="bg-white rounded-lg shadow-lg border p-6 sticky top-4">
      <div className="mb-6">
        {/* Price Display */}
        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-3xl font-bold text-blue-600">
            {formatPrice(tour.price)}
          </span>
          {tour.originalPrice && (
            <>
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(tour.originalPrice)}
              </span>
              <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                Tiết kiệm {discountPercentage}%
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-600">/ người lớn</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
            Ngày khởi hành
          </label>
          <select
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.startDate ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Chọn ngày khởi hành</option>
            {availableDates.map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </option>
            ))}
          </select>
          {errors.startDate && (
            <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
          )}
        </div>

        {/* People Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <UsersIcon className="h-4 w-4 inline mr-1" />
              Người lớn
            </label>
            <select
              value={formData.adults}
              onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
              className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.adults ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num} người</option>
              ))}
            </select>
            {errors.adults && (
              <p className="text-red-500 text-xs mt-1">{errors.adults}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trẻ em (2-12 tuổi)
            </label>
            <select
              value={formData.children}
              onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[0, 1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num} trẻ</option>
              ))}
            </select>
          </div>
        </div>

        {errors.totalPeople && (
          <div className="flex items-center space-x-2 text-red-500 text-sm">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>{errors.totalPeople}</span>
          </div>
        )}

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Yêu cầu đặc biệt (tùy chọn)
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            placeholder="Ví dụ: Ăn chay, khuyết tật, dị ứng thực phẩm..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Price Breakdown */}
        {totalPeople > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900">Chi tiết giá</h4>
            
            <div className="flex justify-between text-sm">
              <span>Người lớn ({formData.adults})</span>
              <span>{formatPrice(formData.adults * tour.price)}</span>
            </div>
            
            {formData.children > 0 && (
              <div className="flex justify-between text-sm">
                <span>Trẻ em ({formData.children})</span>
                <span>{formatPrice(formData.children * childPrice)}</span>
              </div>
            )}
            
            <hr className="border-gray-300" />
            
            <div className="flex justify-between font-semibold text-lg">
              <span>Tổng cộng</span>
              <span className="text-blue-600">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <ShieldCheckIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900">Đặt tour an toàn</p>
            <p>Thông tin của bạn được bảo mật và có thể hủy miễn phí trong 24h</p>
          </div>
        </div>

        {/* Book Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
        >
          <CreditCardIcon className="h-5 w-5" />
          <span>Đặt Tour Ngay</span>
        </Button>

        {/* Contact Info */}
        <div className="text-center text-sm text-gray-600">
          <p>Cần hỗ trợ? Gọi <span className="font-semibold text-blue-600">1900 1234</span></p>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
