import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button, Input } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { bookingService } from '../services';

interface BookingData {
  tourId: number;
  tourName: string;
  tourImage: string;
  startDate: string;
  adults: number;
  children: number;
  totalPrice: number;
  specialRequests?: string;
}

interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  specialRequirements: string;
}

interface PaymentMethod {
  type: 'credit_card' | 'bank_transfer' | 'momo' | 'zalopay';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    type: 'credit_card',
    label: 'Thẻ tín dụng/Ghi nợ',
    icon: CreditCardIcon,
    description: 'Visa, Mastercard, JCB'
  },
  {
    type: 'bank_transfer',
    label: 'Chuyển khoản ngân hàng',
    icon: BanknotesIcon,
    description: 'Chuyển khoản trực tiếp'
  },
  {
    type: 'momo',
    label: 'Ví MoMo',
    icon: DevicePhoneMobileIcon,
    description: 'Thanh toán qua ví MoMo'
  },
  {
    type: 'zalopay',
    label: 'ZaloPay',
    icon: DevicePhoneMobileIcon,
    description: 'Thanh toán qua ZaloPay'
  }
];

const BookingCheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    specialRequirements: ''
  });
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod['type']>('credit_card');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Get booking data from URL params or localStorage
    const mockBookingData: BookingData = {
      tourId: 1,
      tourName: "Hạ Long Bay - Kỳ Quan Thế Giới",
      tourImage: "https://images.unsplash.com/photo-1528127269322-539801943592?w=400",
      startDate: searchParams.get('startDate') || '2024-02-15',
      adults: parseInt(searchParams.get('adults') || '2'),
      children: parseInt(searchParams.get('children') || '1'),
      totalPrice: parseInt(searchParams.get('totalPrice') || '6200000'),
      specialRequests: searchParams.get('specialRequests') || undefined
    };
    
    setBookingData(mockBookingData);
  }, [searchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!customerInfo.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên';
    }

    if (!customerInfo.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!customerInfo.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(customerInfo.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!customerInfo.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }

    if (!customerInfo.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Vui lòng nhập người liên hệ khẩn cấp';
    }

    if (!customerInfo.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'Vui lòng nhập SĐT người liên hệ khẩn cấp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBooking = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    setIsProcessing(true);

    try {
      // Create booking via API
      const bookingRequest = {
        tourId: bookingData.tourId,
        startDate: bookingData.startDate,
        numAdults: bookingData.adults,
        numChildren: bookingData.children,
        specialRequests: bookingData.specialRequests,
        contactPhone: customerInfo.phone,
      };

      const bookingResult = await bookingService.createBooking(bookingRequest);

      // Show success notification
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'success',
          title: 'Đặt tour thành công!',
          message: `Booking ${bookingResult.bookingCode} đã được tạo thành công`,
          duration: 5000
        }
      });
      window.dispatchEvent(event);

      // Redirect to confirmation page
      navigate(`/booking/confirmation/${bookingResult.bookingCode}`, {
        state: { 
          bookingData, 
          customerInfo, 
          paymentMethod: selectedPayment,
          bookingResult 
        }
      });

    } catch (error: any) {
      console.error('Booking creation failed:', error);
      
      // Show error notification
      const event = new CustomEvent('show-toast', {
        detail: {
          type: 'error',
          title: 'Đặt tour thất bại!',
          message: error?.response?.data?.message || 'Có lỗi xảy ra khi đặt tour. Vui lòng thử lại!',
          duration: 5000
        }
      });
      window.dispatchEvent(event);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                to={`/tours/${bookingData.tourId}`}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Đặt Tour</h1>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Thông tin</span>
              </div>
              
              <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Thanh toán</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin khách hàng</h2>
                
                <div className="space-y-6">
                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Họ và tên *"
                      value={customerInfo.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      error={errors.fullName}
                      placeholder="Nhập họ và tên đầy đủ"
                    />
                    
                    <Input
                      label="Email *"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      error={errors.email}
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Số điện thoại *"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      error={errors.phone}
                      placeholder="0123456789"
                    />
                    
                    <Input
                      label="Địa chỉ *"
                      value={customerInfo.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      error={errors.address}
                      placeholder="Địa chỉ liên hệ"
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ khẩn cấp</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Tên người liên hệ *"
                        value={customerInfo.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        error={errors.emergencyContact}
                        placeholder="Họ tên người thân"
                      />
                      
                      <Input
                        label="Số điện thoại *"
                        value={customerInfo.emergencyPhone}
                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                        error={errors.emergencyPhone}
                        placeholder="0123456789"
                      />
                    </div>
                  </div>

                  {/* Special Requirements */}
                  <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yêu cầu đặc biệt
                    </label>
                    <textarea
                      value={customerInfo.specialRequirements}
                      onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                      placeholder="Ăn chay, khuyết tật, dị ứng thực phẩm, yêu cầu phòng..."
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-end mt-8">
                  <Button
                    onClick={handleNextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    Tiếp tục
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Phương thức thanh toán</h2>
                
                <div className="space-y-4 mb-8">
                  {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <label
                        key={method.type}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedPayment === method.type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.type}
                          checked={selectedPayment === method.type}
                          onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod['type'])}
                          className="sr-only"
                        />
                        
                        <IconComponent className="h-6 w-6 text-gray-600 mr-4" />
                        
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{method.label}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </div>
                        
                        {selectedPayment === method.type && (
                          <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                        )}
                      </label>
                    );
                  })}
                </div>

                {/* Security Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-green-900">Thanh toán an toàn</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Thông tin thanh toán được mã hóa SSL 256-bit. Chúng tôi không lưu trữ thông tin thẻ của bạn.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    className="px-6 py-3"
                  >
                    Quay lại
                  </Button>
                  
                  <Button
                    onClick={handleBooking}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      'Xác nhận đặt tour'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin đặt tour</h3>
              
              {/* Tour Info */}
              <div className="flex space-x-4 mb-6">
                <img
                  src={bookingData.tourImage}
                  alt={bookingData.tourName}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{bookingData.tourName}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(bookingData.startDate)}
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Người lớn</span>
                  <span className="font-semibold">{bookingData.adults} người</span>
                </div>
                
                {bookingData.children > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trẻ em</span>
                    <span className="font-semibold">{bookingData.children} trẻ</span>
                  </div>
                )}

                {bookingData.specialRequests && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 text-xs">Yêu cầu đặc biệt:</span>
                    <p className="text-gray-900 text-xs mt-1">{bookingData.specialRequests}</p>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(bookingData.totalPrice)}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600">
                  Đã bao gồm thuế và phí dịch vụ
                </p>
              </div>

              {/* Cancellation Policy */}
              <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-semibold">Chính sách hủy tour</p>
                    <p className="mt-1">Miễn phí hủy trong 24h. Hủy trước 7 ngày không tính phí.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckoutPage;
