import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { 
  TourScheduleSelector, 
  ParticipantForm,
  type TourSchedule,
  type Participant
} from '../components/tours';
import PaymentMethodSelection from '../components/payment/PaymentMethodSelection';
import { bookingService, paymentService, tourService } from '../services';

interface TourInfo {
  id: number;
  name: string;
  slug: string;
  price: number;
  childPrice?: number;
  infantPrice?: number;
  tourType: 'DOMESTIC' | 'INTERNATIONAL';
  mainImage?: string;
}

const BookingCheckoutPageNew: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?returnUrl=/tours');
    }
  }, [isAuthenticated, navigate]);

  // State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [tour, setTour] = useState<TourInfo | null>(null);
  const [schedules, setSchedules] = useState<TourSchedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<TourSchedule | null>(null);
  
  // Participant counts
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [numInfants, setNumInfants] = useState(0);
  
  // Participants info
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  // Customer info (primary contact)
  const [customerInfo, setCustomerInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    specialRequests: ''
  });
  
  // Payment
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load tour data
  useEffect(() => {
    const tourId = searchParams.get('tourId');
    const tourSlug = searchParams.get('tourSlug');
    
    if (!tourId && !tourSlug) {
      navigate('/tours');
      return;
    }

    loadTourData(tourId, tourSlug);
  }, [searchParams]);

  const loadTourData = async (tourId: string | null, tourSlug: string | null) => {
    try {
      let tourData;
      if (tourId) {
        tourData = await tourService.getTourById(parseInt(tourId));
      } else if (tourSlug) {
        tourData = await tourService.getTourBySlug(tourSlug);
      }

      if (tourData) {
        setTour({
          id: tourData.id,
          name: tourData.name,
          slug: tourData.slug,
          price: tourData.price,
          childPrice: tourData.childPrice,
          infantPrice: tourData.infantPrice,
          tourType: tourData.tourType,
          mainImage: tourData.mainImage || tourData.images?.[0]?.imageUrl
        });

        // Load schedules (mock for now - replace with API call)
        // TODO: Replace with actual API: tourService.getTourSchedules(tourData.id)
        setSchedules([]);
      }
    } catch (error) {
      console.error('Error loading tour:', error);
      alert('Không thể tải thông tin tour. Vui lòng thử lại.');
      navigate('/tours');
    }
  };

  // Calculate prices
  const calculatePrices = () => {
    if (!tour || !selectedSchedule) return { subtotal: 0, total: 0, discount: 0 };

    const basePrice = selectedSchedule.basePrice;
    const childPrice = tour.childPrice || basePrice * 0.7;
    const infantPrice = tour.infantPrice || basePrice * 0.3;

    const subtotal = 
      (numAdults * basePrice) + 
      (numChildren * childPrice) + 
      (numInfants * infantPrice);

    // TODO: Apply discounts/promotions
    const discount = 0;
    const total = subtotal - discount;

    return { subtotal, total, discount };
  };

  const { subtotal, total, discount } = calculatePrices();

  // Step validation
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedSchedule) {
      newErrors.schedule = 'Vui lòng chọn lịch khởi hành';
    }
    
    const totalPeople = numAdults + numChildren + numInfants;
    if (totalPeople < 1) {
      newErrors.people = 'Phải có ít nhất 1 người tham gia';
    }
    
    if (numAdults < 1) {
      newErrors.adults = 'Phải có ít nhất 1 người lớn';
    }

    if (selectedSchedule && totalPeople > selectedSchedule.availableSeats) {
      newErrors.people = `Chỉ còn ${selectedSchedule.availableSeats} chỗ trống`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    // Check all participants are filled
    const isInternational = tour?.tourType === 'INTERNATIONAL';
    const allComplete = participants.every(p => {
      const hasBasicInfo = p.fullName && p.dateOfBirth && p.gender;
      if (isInternational) {
        return hasBasicInfo && p.passportNumber && p.nationality;
      }
      return hasBasicInfo;
    });

    if (!allComplete) {
      newErrors.participants = 'Vui lòng điền đầy đủ thông tin hành khách';
    }

    // Check customer info
    if (!customerInfo.fullName) newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!customerInfo.email) newErrors.email = 'Vui lòng nhập email';
    if (!customerInfo.phone) newErrors.phone = 'Vui lòng nhập số điện thoại';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!selectedPaymentMethod) {
      newErrors.payment = 'Vui lòng chọn phương thức thanh toán';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    let isValid = false;
    
    if (currentStep === 1) isValid = validateStep1();
    else if (currentStep === 2) isValid = validateStep2();
    
    if (isValid && currentStep < 3) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit booking
  const handleSubmitBooking = async () => {
    if (!validateStep3() || !tour || !selectedSchedule) return;

    setIsSubmitting(true);
    try {
      // Create booking
      const bookingRequest = {
        tourId: tour.id,
        scheduleId: selectedSchedule.id,
        numAdults,
        numChildren,
        numInfants,
        customerName: customerInfo.fullName,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerAddress: customerInfo.address || undefined,
        specialRequests: customerInfo.specialRequests || undefined,
        participants: participants.map(p => ({
          fullName: p.fullName,
          dateOfBirth: p.dateOfBirth,
          gender: p.gender,
          phone: p.phone,
          email: p.email,
          idNumber: p.idNumber,
          passportNumber: p.passportNumber,
          nationality: p.nationality,
          specialRequests: p.specialRequests,
          type: p.type
        }))
      };

      const booking = await bookingService.createBooking(bookingRequest);

      // Initiate payment
      if (selectedPaymentMethod === 'MOMO') {
        const paymentRequest = {
          bookingId: booking.id.toString(),
          amount: total,
          orderInfo: `Thanh toán tour: ${tour.name}`,
          paymentMethod: 'MOMO' as const,
          userId: user?.id,
          userEmail: customerInfo.email,
          userPhone: customerInfo.phone
        };

        const paymentUrl = await paymentService.initiateMoMoPayment(paymentRequest);
        window.location.href = paymentUrl;
      } else {
        // Other payment methods
        alert('Phương thức thanh toán này đang được phát triển');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin tour...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Quay lại
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Đặt Tour</h1>
          <p className="text-gray-600 mt-2">{tour.name}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'Chọn lịch & Số người' },
              { step: 2, label: 'Thông tin hành khách' },
              { step: 3, label: 'Thanh toán' }
            ].map(({ step, label }, index) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    ${currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {currentStep > step ? <CheckCircleIcon className="h-6 w-6" /> : step}
                  </div>
                  <span className={`ml-3 font-medium ${currentStep >= step ? 'text-gray-900' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-1 mx-4 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Schedule & People */}
            {currentStep === 1 && (
              <>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <TourScheduleSelector
                    schedules={schedules}
                    selectedScheduleId={selectedSchedule?.id}
                    onScheduleSelect={setSelectedSchedule}
                    basePrice={tour.price}
                  />
                  {errors.schedule && (
                    <p className="text-red-500 text-sm mt-2">{errors.schedule}</p>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Số lượng hành khách</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Người lớn (≥ 12 tuổi)
                      </label>
                      <select
                        value={numAdults}
                        onChange={(e) => setNumAdults(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>{num} người</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trẻ em (2-11 tuổi)
                      </label>
                      <select
                        value={numChildren}
                        onChange={(e) => setNumChildren(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {[0, 1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num} trẻ</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Em bé (&lt; 2 tuổi)
                      </label>
                      <select
                        value={numInfants}
                        onChange={(e) => setNumInfants(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {[0, 1, 2].map(num => (
                          <option key={num} value={num}>{num} em</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {errors.people && (
                    <p className="text-red-500 text-sm mt-2">{errors.people}</p>
                  )}
                  {errors.adults && (
                    <p className="text-red-500 text-sm mt-2">{errors.adults}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Participant Info */}
            {currentStep === 2 && (
              <>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <ParticipantForm
                    participants={participants}
                    onParticipantsChange={setParticipants}
                    numAdults={numAdults}
                    numChildren={numChildren}
                    numInfants={numInfants}
                    isInternational={tour.tourType === 'INTERNATIONAL'}
                  />
                  {errors.participants && (
                    <p className="text-red-500 text-sm mt-2">{errors.participants}</p>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin liên hệ</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerInfo.fullName}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, fullName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ
                      </label>
                      <input
                        type="text"
                        value={customerInfo.address}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Phương thức thanh toán</h3>
                
                <PaymentMethodSelection
                  selectedMethod={selectedPaymentMethod}
                  onMethodChange={setSelectedPaymentMethod}
                />
                
                {errors.payment && (
                  <p className="text-red-500 text-sm mt-2">{errors.payment}</p>
                )}

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold">Thanh toán an toàn & bảo mật</p>
                      <p>Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={handleBack}
                disabled={currentStep === 1}
                variant="outline"
                className="px-6 py-3"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Quay lại
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Tiếp tục
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt tour'}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
              
              {/* Tour Image */}
              {tour.mainImage && (
                <img
                  src={tour.mainImage}
                  alt={tour.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
              )}

              {/* Tour Name */}
              <h4 className="font-semibold text-gray-900 mb-4">{tour.name}</h4>

              {/* Schedule */}
              {selectedSchedule && (
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600">Khởi hành</p>
                  <p className="font-medium">{new Date(selectedSchedule.startDate).toLocaleDateString('vi-VN')}</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                {numAdults > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Người lớn ({numAdults})</span>
                    <span>{((selectedSchedule?.basePrice || tour.price) * numAdults).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {numChildren > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Trẻ em ({numChildren})</span>
                    <span>{((tour.childPrice || tour.price * 0.7) * numChildren).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {numInfants > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Em bé ({numInfants})</span>
                    <span>{((tour.infantPrice || tour.price * 0.3) * numInfants).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 mb-2">
                  <span>Giảm giá</span>
                  <span>-{discount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Tổng cộng</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {total.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCheckoutPageNew;
