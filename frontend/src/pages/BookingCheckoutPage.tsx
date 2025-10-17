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
import { bookingService, tourService } from '../services';

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
  const { isAuthenticated, user } = useAuth();
  
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'VNPAY' | 'LATER' | null>(null);
  
  // Promotion code
  const [promotionCode, setPromotionCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState<{code: string; discount: number} | null>(null);
  const [isValidatingPromotion, setIsValidatingPromotion] = useState(false);
  const [promotionError, setPromotionError] = useState('');

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

    // Apply promotion discount if exists
    const discount = appliedPromotion?.discount || 0;
    const total = subtotal - discount;

    return { subtotal, total, discount, adultPrice, childPrice };
  };
  
  // Apply promotion code
  const handleApplyPromotion = async () => {
    if (!promotionCode.trim()) {
      setPromotionError('Vui lòng nhập mã giảm giá');
      return;
    }
    
    if (!tour) return;
    
    setIsValidatingPromotion(true);
    setPromotionError('');
    
    try {
      // Call API to calculate price with promotion
      const priceResult = await bookingService.calculatePrice({
        tourId: tour.id,
        adults: numAdults,
        children: numChildren,
        promotionCode: promotionCode.toUpperCase()
      });
      
      // Backend returns discount amount directly
      const discountAmount = priceResult.discount;
      
      if (discountAmount > 0) {
        // Promotion is valid and gives discount
        setAppliedPromotion({
          code: promotionCode.toUpperCase(),
          discount: discountAmount
        });
        setPromotionError('');
      } else {
        setPromotionError('Mã giảm giá không hợp lệ hoặc không áp dụng được');
        setAppliedPromotion(null);
      }
    } catch (error: any) {
      console.error('Error validating promotion:', error);
      // Backend returns error message in 'error' field, not 'message'
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Mã giảm giá không hợp lệ';
      setPromotionError(errorMessage);
      setAppliedPromotion(null);
    } finally {
      setIsValidatingPromotion(false);
    }
  };
  
  // Remove applied promotion
  const handleRemovePromotion = () => {
    setAppliedPromotion(null);
    setPromotionCode('');
    setPromotionError('');
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
      
      // Validate selected date is not in the past
      const selectedDate = selectedSchedule?.departureDate;
      if (selectedDate) {
        const startDate = new Date(selectedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
        
        if (startDate < today) {
          alert('Ngày khởi hành đã chọn đã qua. Vui lòng chọn ngày khác.');
          return;
        }
      }

      // Create booking using the simpler BookingCreateRequest format
      const bookingRequest = {
        tourId: tour.id,
        startDate: selectedDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now if no schedule selected
        numAdults: numAdults || 1,
        numChildren: numChildren || 0,
        specialRequests: specialRequests || undefined,
        contactPhone: cleanPhone,
        promotionCode: appliedPromotion?.code || undefined
      };
      
      console.log('🔄 Creating booking with request:', bookingRequest);
      const booking = await bookingService.createBooking(bookingRequest);
      console.log('✅ Booking created successfully:', booking);
      
      if (!booking || !booking.id) {
        throw new Error('Booking creation failed - no booking ID returned');
      }

      // Handle payment based on selected method
      if (selectedPaymentMethod === 'VNPAY') {
        // Create VNPay payment and redirect
        const vnpayRequest = {
          bookingId: booking.id,
          amount: booking.finalAmount || total,
          orderInfo: `Thanh toan tour ${tour?.name || ''} - ${booking.bookingCode}`
        };
        
        const { vnpayService } = await import('../services/vnpayService');
        const paymentResponse = await vnpayService.createPayment(vnpayRequest);
        
        // Redirect to VNPay
        window.location.href = paymentResponse.paymentUrl;
      } else {
        // Payment later - redirect to confirmation
        navigate(`/booking/confirmation/${booking.bookingCode}`, {
          state: {
            bookingData: booking,
            customerInfo: {
              name: participants[0]?.fullName || '',
              email: booking.customerEmail || '',
              phone: booking.customerPhone || ''
            },
            paymentMethod: 'PENDING',
            bookingResult: {
              success: true,
              bookingCode: booking.bookingCode,
              bookingId: booking.id,
              message: 'Đặt tour thành công! Vui lòng hoàn tất thanh toán.'
            }
          }
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      alert(errorMessage);
      
      // Don't redirect to success page on error
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tour) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-none h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: '#D4AF37' }}></div>
          <p className="text-gray-600 font-normal">Đang tải thông tin tour...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <button
            onClick={handleBack}
            className="flex items-center text-slate-700 hover:text-slate-900 font-medium mb-6 transition-colors duration-300 group"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
            {currentStep > 1 ? 'Quay lại bước trước' : 'Quay lại trang tour'}
          </button>
          
          <h1 className="text-4xl font-normal text-slate-900 mb-3 tracking-tight">Đặt Tour</h1>
          <p className="text-base text-gray-600 font-normal">{tour.name}</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 bg-white border border-stone-200 rounded-none p-8 animate-fade-in-up opacity-0 delay-100">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'Chọn lịch & Số người' },
              { step: 2, label: 'Thông tin hành khách' },
              { step: 3, label: 'Thanh toán' }
            ].map(({ step, label }, index) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div 
                    className={`
                      w-12 h-12 rounded-none flex items-center justify-center font-medium tracking-wide transition-all duration-300
                      ${currentStep >= step 
                        ? 'text-white shadow-lg' 
                        : 'bg-stone-100 text-gray-500'
                      }
                    `}
                    style={currentStep >= step ? { background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' } : {}}
                  >
                    {currentStep > step ? <CheckCircleIcon className="h-6 w-6" /> : step}
                  </div>
                  <span className={`ml-4 font-normal text-sm md:text-base ${currentStep >= step ? 'text-slate-900' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
                {index < 2 && (
                  <div 
                    className="flex-1 h-0.5 mx-6 transition-all duration-300" 
                    style={currentStep > step ? { background: 'linear-gradient(90deg, #D4AF37 0%, #C5A028 100%)' } : { backgroundColor: '#e7e5e4' }}
                  />
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
                    onScheduleSelect={(schedule: TourSchedule) => {
                      // Validate that the selected schedule is not in the past
                      const startDate = new Date(schedule.departureDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      if (startDate < today) {
                        alert('Ngày khởi hành này đã qua. Vui lòng chọn ngày khác.');
                        return;
                      }
                      
                      setSelectedSchedule(schedule);
                    }}
                    basePrice={tour.price}
                  />
                  {errors.schedule && (
                    <p className="text-red-500 text-sm mt-2">{errors.schedule}</p>
                  )}
                </div>

                <div className="bg-white border border-stone-200 rounded-none p-6">
                  <h3 className="text-xl font-normal text-slate-900 mb-6 tracking-tight">Số lượng hành khách</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                        Người lớn (&gt; 12 tuổi)
                      </label>
                      <select
                        value={numAdults}
                        onChange={(e) => setNumAdults(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>{num} người</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2 tracking-tight">
                        Trẻ em (&lt; 12 tuổi)
                      </label>
                      <select
                        value={numChildren}
                        onChange={(e) => setNumChildren(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal"
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
                <div className="bg-white border border-stone-200 rounded-none p-6">
                  <div className="mb-6 pb-4 border-b border-stone-200">
                    <p className="text-sm text-slate-900 bg-amber-50 border border-amber-200 p-4 rounded-none font-normal">
                      💡 <strong className="font-medium">Lưu ý:</strong> Thông tin của <strong className="font-medium">Người lớn 1</strong> sẽ được dùng làm thông tin liên hệ (nhận email xác nhận & gọi điện)
                    </p>
                  </div>
                  
                  <ParticipantForm 
                    participants={participants}
                    onParticipantsChange={setParticipants}
                    numAdults={numAdults}
                    numChildren={numChildren}
                    numInfants={0}
                    isInternational={tour.tourType === 'INTERNATIONAL'}
                    currentUser={user ? {
                      name: user.name,
                      email: user.email,
                      phone: user.phone,
                      dateOfBirth: user.dateOfBirth,
                      gender: user.gender
                    } : undefined}
                  />
                  {errors.participants && (
                    <p className="text-red-500 text-sm mt-2">{errors.participants}</p>
                  )}
                </div>

                {/* Yêu cầu đặc biệt */}
                <div className="bg-white border border-stone-200 rounded-none p-6">
                  <h3 className="text-lg font-normal text-slate-900 mb-4 tracking-tight">Yêu cầu đặc biệt</h3>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-none focus:ring-0 focus:border-slate-700 font-normal"
                    rows={4}
                    placeholder="Ví dụ: Ăn chay, dị ứng hải sản, cần xe lăn, phòng gần thang máy..."
                  />
                  <p className="text-xs text-gray-500 mt-2 font-normal">
                    Chúng tôi sẽ cố gắng đáp ứng yêu cầu của bạn (không đảm bảo 100%)
                  </p>
                </div>
              </>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div className="bg-white border border-stone-200 rounded-none p-6">
                <h3 className="text-xl font-normal text-slate-900 mb-6 tracking-tight">Phương thức thanh toán</h3>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">Tổng thanh toán</h4>
                    <p className="text-3xl font-bold text-blue-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(total)}
                    </p>
                  </div>
                  
                  {/* Payment Method Selection */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Chọn phương thức thanh toán:</h4>
                    
                    <div className="space-y-3">
                      {/* VNPay Option */}
                      <button
                        onClick={() => setSelectedPaymentMethod('VNPAY')}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                          selectedPaymentMethod === 'VNPAY'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedPaymentMethod === 'VNPAY' ? 'border-blue-500' : 'border-gray-300'
                            }`}>
                              {selectedPaymentMethod === 'VNPAY' && (
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Thanh toán qua VNPay</p>
                              <p className="text-sm text-gray-500">Thanh toán ngay bằng thẻ ATM/Visa/MasterCard</p>
                            </div>
                          </div>
                          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                          </svg>
                        </div>
                      </button>
                      
                      {/* Pay Later Option */}
                      <button
                        onClick={() => setSelectedPaymentMethod('LATER')}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                          selectedPaymentMethod === 'LATER'
                            ? 'border-gray-500 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedPaymentMethod === 'LATER' ? 'border-gray-500' : 'border-gray-300'
                            }`}>
                              {selectedPaymentMethod === 'LATER' && (
                                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Thanh toán sau</p>
                              <p className="text-sm text-gray-500">Hoàn tất thanh toán trong vòng 24h</p>
                            </div>
                          </div>
                          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </button>
                    </div>
                    
                    {errors.payment && (
                      <p className="text-red-500 text-sm mt-2">{errors.payment}</p>
                    )}
                  </div>
                  
                  {/* Submit Button */}
                  <div className="text-center">
                    <button
                      onClick={handleSubmitBooking}
                      disabled={isSubmitting || !selectedPaymentMethod}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt tour'}
                    </button>
                    {selectedPaymentMethod === 'VNPAY' && (
                      <p className="text-sm text-gray-500 mt-2">
                        Bạn sẽ được chuyển đến trang thanh toán VNPay
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 bg-stone-50 border border-stone-200 rounded-none p-5">
                  <div className="flex items-start">
                    <ShieldCheckIcon className="h-5 w-5 mr-3 mt-0.5" style={{ color: '#D4AF37' }} />
                    <div className="text-sm text-slate-900">
                      <p className="font-medium tracking-tight">Thanh toán an toàn & bảo mật</p>
                      <p className="font-normal mt-1">Thông tin thanh toán của bạn được mã hóa và bảo mật tuyệt đối.</p>
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
                  className="px-8 py-3 text-white rounded-none hover:opacity-90 transition-all duration-300 font-medium tracking-wide"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                >
                  Tiếp tục
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-stone-200 rounded-none p-6 sticky top-4 animate-fade-in-up opacity-0 delay-200">
              <h3 className="text-lg font-medium text-slate-900 mb-6 tracking-tight">Tóm tắt đơn hàng</h3>
              
              {/* Tour Image */}
              {tour.mainImage && (
                <img
                  src={tour.mainImage}
                  alt={tour.name}
                  className="w-full h-48 object-cover rounded-none mb-6 border border-stone-200"
                />
              )}

              {/* Tour Name */}
              <h4 className="font-medium text-slate-900 mb-6 text-base tracking-tight">{tour.name}</h4>

              {/* Schedule */}
              {selectedSchedule && (
                <div className="mb-6 pb-4 border-b border-stone-200">
                  <p className="text-sm text-gray-600 font-normal">Khởi hành</p>
                  <p className="font-medium text-slate-900 mt-1">{new Date(selectedSchedule.departureDate).toLocaleDateString('vi-VN')}</p>
                </div>
              )}

              {/* Promotion Code Section */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎁 Mã giảm giá
                </label>
                {!appliedPromotion ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promotionCode}
                      onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm uppercase"
                      disabled={isValidatingPromotion}
                    />
                    <button
                      onClick={handleApplyPromotion}
                      disabled={isValidatingPromotion || !promotionCode.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
                    >
                      {isValidatingPromotion ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-sm font-medium text-green-700">
                        Mã "{appliedPromotion.code}" đã được áp dụng
                      </span>
                    </div>
                    <button
                      onClick={handleRemovePromotion}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                )}
                {promotionError && (
                  <p className="mt-2 text-sm text-red-600">{promotionError}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                {numAdults > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-normal">Người lớn ({numAdults})</span>
                    <span className="font-medium text-slate-900">{(adultPrice * numAdults).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
                {numChildren > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-normal">Trẻ em ({numChildren})</span>
                    <span className="font-medium text-slate-900">{(childPrice * numChildren).toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <span className="font-medium text-yellow-800">💰 Giảm giá ({appliedPromotion?.code})</span>
                  <span className="font-bold text-yellow-600">-{discount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="border-t border-stone-200 pt-5">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-slate-900 tracking-tight">Tổng cộng</span>
                  <span className="text-2xl font-normal tracking-tight" style={{ color: '#D4AF37' }}>
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
