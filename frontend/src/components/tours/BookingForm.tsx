import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  UsersIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useAuth } from '../../hooks/useAuth';
import { tourService } from '../../services';
import { type TourSchedule } from '../tours';
import { BookingFormSkeleton } from '../ui/Skeleton';

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
  isLoading?: boolean;
}

interface BookingData {
  tourId: number;
  startDate: string;
  adults: number;
  children: number;
  totalPrice: number;
  specialRequests?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ tour, onBooking, isLoading = false }) => {
  // onBooking prop is kept for API compatibility but not used in this component
  void onBooking;
  
  const { t, i18n } = useTranslation();
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
    if (isLoading) return; // Don't load if component is in loading state
    
    const loadSchedules = async () => {
      setLoadingSchedules(true);
      try {
        const schedules = await tourService.getTourSchedules(tour.id);
        
        if (schedules && schedules.length > 0) {
          // Filter out past schedules - only show schedules from today onwards
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison
          
          const upcomingSchedules = schedules.filter(schedule => {
            const departureDate = new Date(schedule.departureDate);
            return departureDate >= today;
          });
          
          setAvailableSchedules(upcomingSchedules);
          
          if (upcomingSchedules.length === 0) {
            console.warn('No upcoming schedules found for tour', tour.id);
          }
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
  }, [tour.id, isLoading]);

  // Show skeleton if loading
  if (isLoading) {
    return <BookingFormSkeleton />;
  }

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
      newErrors.schedule = t('booking.form.errors.selectSchedule');
    }

    if (formData.adults < 1) {
      newErrors.adults = t('booking.form.errors.atLeastOneAdult');
    }

    if (totalPeople > tour.maxPeople) {
      newErrors.totalPeople = t('booking.form.errors.maxPeople', { count: tour.maxPeople });
    }

    if (selectedSchedule && totalPeople > selectedSchedule.availableSeats) {
      newErrors.totalPeople = t('booking.form.errors.availableSeats', { count: selectedSchedule.availableSeats });
    }

    if (totalPeople < 1) {
      newErrors.totalPeople = t('booking.form.errors.atLeastOnePerson');
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
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };


  return (
    <div className="bg-white rounded-none shadow-xl border border-stone-200 p-8 sticky top-4">
      <div className="mb-8 pb-6 border-b border-stone-200">
        {/* Price Display */}
        <div className="flex items-baseline space-x-3 mb-3">
          <span className="text-5xl font-normal tracking-tight" style={{ color: '#D4AF37' }}>
            {formatPrice(tour.price)}
          </span>
          {tour.originalPrice && (
            <>
              <span className="text-lg text-gray-400 line-through font-normal">
                {formatPrice(tour.originalPrice)}
              </span>
              <span className="text-white text-xs font-medium px-3 py-1.5 rounded-none tracking-wider uppercase shadow-md" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}>
                -{discountPercentage}%
              </span>
            </>
          )}
        </div>
        <p className="text-base text-gray-700">{t('booking.form.perAdult')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Schedule Selection - Responsive */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-3 tracking-wide">
            {t('booking.form.schedule.title')}
          </label>
          
          {loadingSchedules ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#D4AF37' }}></div>
              <p className="text-sm text-gray-500 mt-2 font-normal">{t('booking.form.schedule.loading')}</p>
            </div>
          ) : availableSchedules.length === 0 ? (
            <div className="text-center py-6 bg-amber-50 border-l-4 rounded-none" style={{ borderLeftColor: '#D4AF37' }}>
              <p className="text-sm text-gray-600 font-normal">{t('booking.form.schedule.noSchedules')}</p>
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
                        className={`text-left p-4 rounded-none border-2 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                          isSelected 
                            ? 'bg-amber-50 shadow-md scale-[1.02]' 
                            : 'border-stone-200 hover:border-slate-700 bg-white'
                        }`}
                        style={isSelected ? { borderColor: '#D4AF37' } : {}}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900">
                            {new Date(schedule.departureDate).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                              day: '2-digit',
                              month: '2-digit'
                            })} - {new Date(schedule.returnDate).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                          {isSelected && (
                            <span className="text-blue-600 text-xs">{t('booking.form.schedule.selected')}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className={`font-medium ${
                            ratio > 0.5 ? 'text-green-600' : ratio > 0.2 ? 'text-orange-600' : 'text-red-600'
                          }`}>
                            {ratio > 0.5 
                              ? t('booking.form.schedule.available', { count: schedule.availableSeats })
                              : ratio > 0.2 
                                ? t('booking.form.schedule.lowAvailability', { count: schedule.availableSeats })
                                : t('booking.form.schedule.veryLowAvailability', { count: schedule.availableSeats })
                            }
                          </span>
                          <span className="font-bold text-blue-600">
                            {schedule.adultPrice.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}đ
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
                      ? t('booking.form.schedule.collapse')
                      : t('booking.form.schedule.viewMore', { count: availableSchedules.length - 2 })
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
                <option value="">{t('booking.form.schedule.selectPlaceholder')}</option>
                {availableSchedules.map((schedule) => {
                  const maxSeats = schedule.availableSeats + schedule.bookedSeats;
                  const ratio = schedule.availableSeats / maxSeats;
                  const statusText = ratio > 0.5 
                    ? t('booking.form.schedule.available', { count: schedule.availableSeats })
                    : ratio > 0.2 
                      ? t('booking.form.schedule.lowAvailability', { count: schedule.availableSeats })
                      : t('booking.form.schedule.veryLowAvailability', { count: schedule.availableSeats });
                  
                  return (
                    <option key={schedule.id} value={schedule.id}>
                      {new Date(schedule.departureDate).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')} | {statusText} | {schedule.adultPrice.toLocaleString(i18n.language === 'vi' ? 'vi-VN' : 'en-US')}đ
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
            <label className="block text-sm font-medium text-slate-900 mb-3 tracking-wide">
              <UsersIcon className="h-4 w-4 inline mr-1" style={{ color: '#D4AF37' }} />
              {t('booking.form.participants.adults')}
            </label>
            <select
              value={formData.adults}
              onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
              className={`w-full border rounded-none px-4 py-3 focus:ring-1 focus:border-slate-700 font-normal transition-all ${
                errors.adults ? 'border-red-500' : 'border-stone-300'
              }`}
              style={{ accentColor: '#D4AF37' }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{t('booking.form.participants.adultsCount', { count: num })}</option>
              ))}
            </select>
            {errors.adults && (
              <p className="text-red-500 text-xs mt-1 font-normal">{errors.adults}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3 tracking-wide">
              {t('booking.form.participants.children')}
            </label>
            <select
              value={formData.children}
              onChange={(e) => handleInputChange('children', parseInt(e.target.value))}
              className="w-full border border-stone-300 rounded-none px-4 py-3 focus:ring-1 focus:border-slate-700 font-normal transition-all"
              style={{ accentColor: '#D4AF37' }}
            >
              {[0, 1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{t('booking.form.participants.childrenCount', { count: num })}</option>
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
          <label className="block text-sm font-medium text-slate-900 mb-3 tracking-wide">
            {t('booking.form.specialRequests.title')}
          </label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            placeholder={t('booking.form.specialRequests.placeholder')}
            rows={3}
            className="w-full border border-stone-300 rounded-none px-4 py-3 focus:ring-1 focus:border-slate-700 resize-none font-normal transition-all"
          />
        </div>

        {/* Price Breakdown */}
        {totalPeople > 0 && selectedSchedule && (
          <div className="bg-stone-50 rounded-none p-6 space-y-3 border border-stone-200">
            <h4 className="font-medium text-slate-900 tracking-tight">{t('booking.form.priceBreakdown.title')}</h4>
            
            <div className="flex justify-between text-sm font-normal">
              <span className="text-gray-700">{t('booking.form.priceBreakdown.adults', { count: formData.adults })}</span>
              <span className="text-slate-900">{formatPrice(formData.adults * adultPrice)}</span>
            </div>
            
            {formData.children > 0 && (
              <div className="flex justify-between text-sm font-normal">
                <span className="text-gray-700">{t('booking.form.priceBreakdown.children', { count: formData.children })}</span>
                <span className="text-slate-900">{formatPrice(formData.children * childPrice)}</span>
              </div>
            )}
            
            <hr className="border-stone-300" />
            
            <div className="flex justify-between font-medium text-xl tracking-tight">
              <span className="text-slate-900">{t('booking.form.priceBreakdown.total')}</span>
              <span style={{ color: '#D4AF37' }}>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-start space-x-3 text-sm text-gray-700 bg-stone-50 p-4 rounded-none border-l-2" style={{ borderLeftColor: '#D4AF37' }}>
          <ShieldCheckIcon className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
          <div>
            <p className="font-medium text-slate-900 mb-1">{t('booking.form.security.title')}</p>
            <p className="font-normal">{t('booking.form.security.note')}</p>
          </div>
        </div>

        {/* Book Button */}
        <Button
          type="submit"
          className="w-full text-white py-4 rounded-none font-medium text-sm tracking-[0.2em] uppercase transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl border border-slate-900 hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#C5A028';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#1e293b';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <CreditCardIcon className="h-5 w-5" />
          <span>{t('booking.form.bookNow')}</span>
        </Button>

        {/* Contact Info */}
        <div className="text-center text-sm text-gray-600 font-normal">
          <p>{t('booking.form.contactSupport', { phone: '1900 1234' })}</p>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
