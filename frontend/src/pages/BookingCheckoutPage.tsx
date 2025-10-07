import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ShieldCheckIcon,
  CheckCircleIcon
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
  originalPrice?: number;
  childPrice?: number;
  tourType: 'DOMESTIC' | 'INTERNATIONAL';
  mainImage?: string;
}

const BookingCheckoutPageNew: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
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
  
  // Participants info
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  // Special requests (separate from participant info)
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Payment
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load tour data and prefilled data from navigation state
  useEffect(() => {
    const tourId = searchParams.get('tourId');
    const tourSlug = searchParams.get('tourSlug');
    
    if (!tourId && !tourSlug) {
      navigate('/tours');
      return;
    }

    loadTourData(tourId, tourSlug);
    
    // Load prefilled data from location state (if coming from tour detail page)
    const locationState = location.state as { prefilledData?: { adults?: number; children?: number; specialRequests?: string; startDate?: string } } | null;
    let prefilledData = locationState?.prefilledData;
    
    // Or from sessionStorage (if user was redirected to login)
    if (!prefilledData) {
      const intendedBooking = sessionStorage.getItem('intendedBooking');
      if (intendedBooking) {
        try {
          prefilledData = JSON.parse(intendedBooking);
          sessionStorage.removeItem('intendedBooking'); // Clean up
        } catch (e) {
          console.error('Error parsing intended booking:', e);
        }
      }
    }
    
    if (prefilledData) {
      if (prefilledData.adults) setNumAdults(prefilledData.adults);
      if (prefilledData.children) setNumChildren(prefilledData.children);
      if (prefilledData.specialRequests) {
        setSpecialRequests(prefilledData.specialRequests || '');
      }
      
      // If there's a start date, we need to find and select matching schedule
      if (prefilledData.startDate) {
        // Will be handled after schedules are loaded
        sessionStorage.setItem('prefilledStartDate', prefilledData.startDate);
      }
    }
  }, [searchParams, location.state]);

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
          price: tourData.salePrice || tourData.price, // Use sale price if available
          originalPrice: (tourData.salePrice && tourData.salePrice < tourData.price) ? tourData.price : undefined,
          childPrice: tourData.childPrice,
          tourType: tourData.tourType,
          mainImage: tourData.mainImage || tourData.images?.[0]?.imageUrl
        });

        // Load schedules from API
        try {
          const schedules = await tourService.getTourSchedules(tourData.id);
          if (schedules && schedules.length > 0) {
            setSchedules(schedules);
            
            // Auto-select schedule if there's a prefilled start date
            const prefilledStartDate = sessionStorage.getItem('prefilledStartDate');
            if (prefilledStartDate) {
              const matchingSchedule = schedules.find(
                s => s.departureDate === prefilledStartDate
              );
              if (matchingSchedule) {
                setSelectedSchedule(matchingSchedule);
              }
              sessionStorage.removeItem('prefilledStartDate');
            }
          } else {
            console.warn('No schedules available for this tour');
          }
        } catch (scheduleError) {
          console.error('Error loading schedules:', scheduleError);
          // Continue even if schedules fail to load
        }
      }
    } catch (error) {
      console.error('Error loading tour:', error);
      alert('Không thể tải thông tin tour. Vui lòng thử lại.');
      navigate('/tours');
    }
  };

  // Calculate prices
  const calculatePrices = () => {
    if (!tour) return { subtotal: 0, total: 0, discount: 0, adultPrice: 0, childPrice: 0 };

    // Use schedule prices if available, otherwise use tour's price (already effective price)
    const adultPrice = selectedSchedule?.adultPrice || tour.price;
    const childPrice = selectedSchedule?.childPrice || tour.childPrice || adultPrice * 0.7;

    const subtotal = 
      (numAdults * adultPrice) + 
      (numChildren * childPrice);

    // TODO: Apply discounts/promotions
    const discount = 0;
    const total = subtotal - discount;

    return { subtotal, total, discount, adultPrice, childPrice };
  };

  const { total, discount, adultPrice, childPrice } = calculatePrices();

  // Step validation
  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    // Only require schedule if schedules are available
    if (schedules.length > 0 && !selectedSchedule) {
      newErrors.schedule = 'Vui lòng chọn lịch khởi hành';
    }
    
    const totalPeople = numAdults + numChildren;
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

    // Validate first participant has contact info (phone & email)
    if (participants.length > 0) {
      const firstParticipant = participants[0];
      
      if (!firstParticipant.email) {
        newErrors.participants = 'Vui lòng nhập email cho Người lớn 1 (để nhận thông tin booking)';
      }
      
      if (!firstParticipant.phone) {
        newErrors.participants = 'Vui lòng nhập số điện thoại cho Người lớn 1 (để liên hệ)';
      } else {
        // Validate phone format (10-11 digits only)
        const cleanPhone = firstParticipant.phone.replace(/[\s\-\(\)]/g, '');
        if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
          newErrors.participants = 'Số điện thoại Người lớn 1 phải có 10-11 chữ số';
        }
      }
    }

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
    } else {
      // If on step 1, go back to tour detail page
      navigate(-1);
    }
  };

  // Submit booking
  const handleSubmitBooking = async () => {
    if (!validateStep3() || !tour) return;
    
    // If schedules exist, require one to be selected
    if (schedules.length > 0 && !selectedSchedule) {
      alert('Vui lòng chọn lịch khởi hành');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use first participant as contact info
      const contactPerson = participants[0];
      if (!contactPerson) {
        alert('❌ Vui lòng quay lại Bước 2 và điền thông tin hành khách');
        setIsSubmitting(false);
        return;
      }
      
      // Validate contact person has required fields
      if (!contactPerson.phone || !contactPerson.email) {
        alert('❌ Người lớn 1 cần có đầy đủ Số điện thoại và Email');
        setIsSubmitting(false);
        setCurrentStep(2); // Go back to step 2
        return;
      }
      
      // Clean phone number (remove spaces, dashes, etc)
      const cleanPhone = (contactPerson.phone || '').replace(/[\s\-\(\)]/g, '');
      
      // Validate phone format
      if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
        alert('❌ Số điện thoại Người lớn 1 phải có 10-11 chữ số');
        setIsSubmitting(false);
        setCurrentStep(2); // Go back to step 2
        return;
      }
      
      // Create booking using the simpler BookingCreateRequest format
      const bookingRequest = {
        tourId: tour.id,
        startDate: selectedSchedule?.departureDate || new Date().toISOString().split('T')[0],
        numAdults: numAdults || 1,
        numChildren: numChildren || 0,
        specialRequests: specialRequests || undefined,
        contactPhone: cleanPhone,
        promotionCode: undefined
      };
      const booking = await bookingService.createBooking(bookingRequest);

      // Initiate payment based on method
      if (selectedPaymentMethod === 'CASH' || selectedPaymentMethod === 'BANK_TRANSFER') {
        // For cash/bank transfer, no payment gateway needed - go directly to confirmation
        navigate(`/booking/confirmation/${booking.bookingCode}`, {
          state: {
            bookingData: booking,
            customerInfo: {
              name: participants[0]?.fullName || '',
              email: booking.customerEmail || '',
              phone: booking.customerPhone || ''
            },
            paymentMethod: selectedPaymentMethod,
            bookingResult: {
              success: true,
              bookingCode: booking.bookingCode,
              bookingId: booking.id,
              message: selectedPaymentMethod === 'CASH' 
                ? 'Vui lòng thanh toán trực tiếp khi nhận tour'
                : 'Vui lòng chuyển khoản theo hướng dẫn'
            }
          }
        });
      } else if (selectedPaymentMethod === 'MOMO') {
        const paymentRequest = {
          bookingId: booking.id.toString(),
          amount: total,
          orderInfo: `Thanh toán tour: ${tour.name}`,
          paymentMethod: 'MOMO' as const
        };

        const paymentResponse = await paymentService.createMoMoPayment(paymentRequest);
        if (paymentResponse.payUrl) {
          window.location.href = paymentResponse.payUrl;
        } else {
          alert('Không thể tạo link thanh toán. Vui lòng thử lại.');
        }
      } else {
        // Other payment methods
        alert('Phương thức thanh toán này đang được phát triển');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      alert(errorMessage);
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
            onClick={handleBack}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            {currentStep > 1 ? 'Quay lại bước trước' : 'Quay lại trang tour'}
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
                        Người lớn (&gt; 12 tuổi)
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
                        Trẻ em (&lt; 12 tuổi)
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
                {/* Thông tin hành khách */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="mb-4 pb-4 border-b">
                    <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                      💡 <strong>Lưu ý:</strong> Thông tin của <strong>Người lớn 1</strong> sẽ được dùng làm thông tin liên hệ (nhận email xác nhận & gọi điện)
                    </p>
                  </div>
                  
                  <ParticipantForm 
                    participants={participants}
                    onParticipantsChange={setParticipants}
                    numAdults={numAdults}
                    numChildren={numChildren}
                    numInfants={0}
                    isInternational={tour.tourType === 'INTERNATIONAL'}
                  />
                  {errors.participants && (
                    <p className="text-red-500 text-sm mt-2">{errors.participants}</p>
                  )}
                </div>

                {/* Yêu cầu đặc biệt */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Yêu cầu đặc biệt</h3>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Ví dụ: Ăn chay, dị ứng hải sản, cần xe lăn, phòng gần thang máy..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Chúng tôi sẽ cố gắng đáp ứng yêu cầu của bạn (không đảm bảo 100%)
                  </p>
                </div>
              </>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Phương thức thanh toán</h3>
                
                <PaymentMethodSelection
                  selectedMethod={selectedPaymentMethod}
                  onMethodSelect={setSelectedPaymentMethod}
                  onPaymentInitiate={handleSubmitBooking}
                  amount={total}
                  disabled={isSubmitting}
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
            {currentStep < 3 && (
              <div className="flex justify-end">
                <Button
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Tiếp tục
                </Button>
              </div>
            )}
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
                  <p className="font-medium">{new Date(selectedSchedule.departureDate).toLocaleDateString('vi-VN')}</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                {numAdults > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Người lớn ({numAdults})</span>
                    <span>{(adultPrice * numAdults).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {numChildren > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Trẻ em ({numChildren})</span>
                    <span>{(childPrice * numChildren).toLocaleString('vi-VN')}đ</span>
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
