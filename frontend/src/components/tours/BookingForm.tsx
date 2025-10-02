import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UsersIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { tourService } from '../../services';
import TourScheduleSelector from './TourScheduleSelector';
import { type TourSchedule } from '../tours';

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
    adults: 1,
    children: 0,
    specialRequests: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSchedules, setAvailableSchedules] = useState<TourSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<TourSchedule | null>(null);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [showAllSchedules, setShowAllSchedules] = useState(false);
  
  // Load real schedules from API
  useEffect(() => {
    const loadSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const schedules = await tourService.getTourSchedules(tour.id);
        
        if (schedules && schedules.length > 0) {
          // Store full schedule objects
          setAvailableSchedules(schedules);
        } else {
          console.warn('No schedules found for tour', tour.id);
          setAvailableSchedules([]);
        }
      } catch (error) {
        console.error('Error loading schedules:', error);
        setAvailableSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };
    
    loadSchedules();
  }, [tour.id]);

  // Calculate prices based on selected schedule or tour default
  const adultPrice = selectedSchedule?.adultPrice || tour.price;
  const childPrice = selectedSchedule?.childPrice || (tour.price * 0.7);
  const totalPeople = formData.adults + formData.children;
  const totalPrice = (formData.adults * adultPrice) + (formData.children * childPrice);
  
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

    if (!selectedSchedule) {
      newErrors.schedule = 'Vui lòng chọn lịch khởi hành';
    }

    if (formData.adults < 1) {
      newErrors.adults = 'Phải có ít nhất 1 người lớn';
    }

    if (totalPeople > tour.maxPeople) {
      newErrors.totalPeople = `Tối đa ${tour.maxPeople} người cho tour này`;
    }

    if (selectedSchedule && totalPeople > selectedSchedule.availableSeats) {
      newErrors.totalPeople = `Lịch này chỉ còn ${selectedSchedule.availableSeats} chỗ trống`;
    }

    if (totalPeople < 1) {
      newErrors.totalPeople = 'Phải có ít nhất 1 người tham gia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedSchedule) {
      return;
    }

    // Check if user is logged in
    if (!isAuthenticated) {
      // Save booking intent to sessionStorage
      sessionStorage.setItem('intendedBooking', JSON.stringify({
        tourId: tour.id,
        tourSlug: tour.slug,
        startDate: selectedSchedule.departureDate,
        adults: formData.adults,
        children: formData.children,
        specialRequests: formData.specialRequests
      }));
      
      // Redirect to login with return URL
      navigate(`/login?returnUrl=/booking/checkout?tourId=${tour.id}&tourSlug=${tour.slug}`);
      return;
    }

    // Navigate to checkout with pre-filled data via state
    navigate(`/booking/checkout?tourId=${tour.id}&tourSlug=${tour.slug}`, {
      state: {
        prefilledData: {
          startDate: selectedSchedule.departureDate,
          adults: formData.adults,
          children: formData.children,
          specialRequests: formData.specialRequests
        }
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };


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
        {/* Schedule Selection - Responsive */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📅 Chọn lịch khởi hành
          </label>
          
          {loadingSchedules ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Đang tải lịch trình...</p>
            </div>
          ) : availableSchedules.length === 0 ? (
            <div className="text-center py-6 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-600">Hiện chưa có lịch khởi hành.</p>
            </div>
          ) : (
            <>
              {/* Desktop: Cards View (hidden on mobile) */}
              <div className="hidden md:block">
                <div className="grid grid-cols-1 gap-3">
                  {(showAllSchedules ? availableSchedules : availableSchedules.slice(0, 2)).map((schedule) => {
                    const isSelected = schedule.id === selectedSchedule?.id;
                    const maxSeats = schedule.availableSeats + schedule.bookedSeats;
                    const ratio = schedule.availableSeats / maxSeats;
                    
                    return (
                      <button
                        key={schedule.id}
                        type="button"
                        onClick={() => setSelectedSchedule(schedule)}
                        className={`text-left p-3 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900">
                            {new Date(schedule.departureDate).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit'
                            })} - {new Date(schedule.returnDate).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                          {isSelected && (
                            <span className="text-blue-600 text-xs">✓ Đã chọn</span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className={`font-medium ${
                            ratio > 0.5 ? 'text-green-600' : ratio > 0.2 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {ratio > 0.5 
                              ? `✓ Còn ${schedule.availableSeats} chỗ` 
                              : ratio > 0.2 
                                ? `⚠ Còn ${schedule.availableSeats} chỗ`
                                : `🔥 Chỉ còn ${schedule.availableSeats} chỗ`
                            }
                          </span>
                          <span className="font-bold text-blue-600">
                            {schedule.adultPrice.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        
                        {schedule.note && (
                          <div className="mt-1 text-xs text-gray-500">
                            💡 {schedule.note}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Show More Button */}
                {availableSchedules.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setShowAllSchedules(!showAllSchedules)}
                    className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {showAllSchedules 
                      ? `↑ Thu gọn` 
                      : `↓ Xem thêm ${availableSchedules.length - 2} lịch khác`
                    }
                  </button>
                )}
              </div>

              {/* Mobile: Dropdown (shown only on mobile) */}
              <select
                className="md:hidden w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedSchedule?.id || ''}
                onChange={(e) => {
                  const schedule = availableSchedules.find(s => s.id === parseInt(e.target.value));
                  if (schedule) setSelectedSchedule(schedule);
                }}
              >
                <option value="">Chọn ngày khởi hành</option>
                {availableSchedules.map((schedule) => {
                  const maxSeats = schedule.availableSeats + schedule.bookedSeats;
                  const ratio = schedule.availableSeats / maxSeats;
                  const statusText = ratio > 0.5 
                    ? `Còn ${schedule.availableSeats} chỗ` 
                    : ratio > 0.2 
                      ? `Còn ${schedule.availableSeats} chỗ`
                      : `Chỉ còn ${schedule.availableSeats} chỗ`;
                  
                  return (
                    <option key={schedule.id} value={schedule.id}>
                      {new Date(schedule.departureDate).toLocaleDateString('vi-VN')} | {statusText} | {schedule.adultPrice.toLocaleString('vi-VN')}đ
                    </option>
                  );
                })}
              </select>
              
              {errors.schedule && (
                <p className="text-red-500 text-sm mt-2">{errors.schedule}</p>
              )}
            </>
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
              Trẻ em (&lt; 12 tuổi)
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
        {totalPeople > 0 && selectedSchedule && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900">Chi tiết giá</h4>
            
            <div className="flex justify-between text-sm">
              <span>Người lớn ({formData.adults})</span>
              <span>{formatPrice(formData.adults * adultPrice)}</span>
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
