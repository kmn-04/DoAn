import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircleIcon,
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui';

interface BookingResult {
  id: number;
  bookingCode: string;
  status: string;
  totalPrice: number;
  startDate: string;
  numAdults: number;
  numChildren: number;
  tour: {
    name: string;
    location: string;
  };
}

const BookingConfirmationPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { bookingCode } = useParams<{ bookingCode: string }>();
  const location = useLocation();
  const { bookingData, customerInfo, paymentMethod, bookingResult } = location.state || {};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'vi' ? 'vi-VN' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div 
            className="mx-auto flex items-center justify-center h-20 w-20 rounded-none mb-6 animate-fade-in-scale opacity-0 delay-100"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
          >
            <CheckCircleIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-normal text-slate-900 mb-4 tracking-tight animate-fade-in-up opacity-0 delay-200">
            {t('booking.confirmation.title')}
          </h1>
          <p className="text-lg text-gray-600 font-normal animate-fade-in-up opacity-0 delay-300">
            {t('booking.confirmation.subtitle')}
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white border border-stone-200 rounded-none p-8 mb-6 animate-fade-in-up opacity-0 delay-400">
          <div className="border-b border-stone-200 pb-6 mb-8">
            <h2 className="text-2xl font-normal text-slate-900 mb-4 tracking-tight">
              {t('booking.confirmation.details')}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-600 font-normal">{t('booking.confirmation.bookingCode')}</span>
              <span className="font-mono font-medium text-lg tracking-wider" style={{ color: '#D4AF37' }}>
                {bookingCode || bookingResult?.bookingCode}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-medium bg-amber-100 border border-amber-300 text-amber-800">
                {t('booking.confirmation.confirmed')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tour Info */}
            <div>
              <h3 className="font-medium text-slate-900 mb-4 tracking-tight">{t('booking.confirmation.tourInfo')}</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPinIcon className="h-5 w-5 mt-1" style={{ color: '#D4AF37' }} />
                  <div>
                    <p className="font-medium text-slate-900">
                      {bookingData?.tourName || bookingResult?.tour?.name}
                    </p>
                    <p className="text-sm text-gray-600 font-normal mt-1">
                      {bookingData?.tourLocation || bookingResult?.tour?.location}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CalendarDaysIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                  <div>
                    <p className="font-medium text-slate-900">{t('booking.confirmation.departureDate')}</p>
                    <p className="text-sm text-gray-600 font-normal mt-1">
                      {formatDate(bookingData?.startDate || bookingResult?.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <UsersIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                  <div>
                    <p className="font-medium text-slate-900">{t('booking.confirmation.participants')}</p>
                    <p className="text-sm text-gray-600 font-normal mt-1">
                      {t('booking.confirmation.adults', { count: bookingData?.adults || bookingResult?.numAdults || 0 })}
                      {(bookingData?.children || bookingResult?.numChildren) > 0 && 
                        `, ${t('booking.confirmation.children', { count: bookingData?.children || bookingResult?.numChildren })}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-medium text-slate-900 mb-4 tracking-tight">{t('booking.confirmation.contactInfo')}</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="h-10 w-10 rounded-none flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                  >
                    <span className="text-sm text-white font-medium">
                      {customerInfo?.fullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{customerInfo?.fullName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                  <p className="text-sm text-gray-600 font-normal">{customerInfo?.email}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                  <p className="text-sm text-gray-600 font-normal">{customerInfo?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="border-t border-stone-200 pt-6 mt-8">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-slate-900 tracking-tight">
                {t('booking.confirmation.totalPayment')}
              </span>
              <span className="text-3xl font-normal tracking-tight" style={{ color: '#D4AF37' }}>
                {formatPrice(
                  // Ưu tiên số tiền đã trừ voucher (finalAmount), fallback về totalPrice
                  (bookingData?.finalAmount as number | undefined) ??
                  bookingData?.totalPrice ??
                  bookingResult?.totalPrice ??
                  0
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-amber-50 border border-amber-200 rounded-none p-6 mb-8 animate-fade-in-up opacity-0 delay-500">
          <h3 className="font-medium text-slate-900 mb-4 tracking-tight">{t('booking.confirmation.nextSteps')}</h3>
          <div className="space-y-3 text-sm text-slate-900 font-normal">
            <p>• {t('booking.confirmation.emailConfirmation')}</p>
            <p>• {t('booking.confirmation.staffContact')}</p>
            <p>• {t('booking.confirmation.prepareDocuments')}</p>
            <p>• {t('booking.confirmation.hotline')} <span className="font-medium" style={{ color: '#D4AF37' }}>1900 1234</span></p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up opacity-0 delay-600">
          <Link to={`/bookings${bookingResult?.id ? `?highlight=${bookingResult.id}` : ''}`}>
            <Button 
              className="w-full sm:w-auto text-white px-8 py-3 rounded-none hover:opacity-90 transition-all duration-300 font-medium tracking-wide"
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
            >
              {t('booking.confirmation.viewMyBooking')}
            </Button>
          </Link>
          <Link to="/tours">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto px-8 py-3 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none transition-all duration-300 font-medium tracking-wide"
            >
              {t('booking.confirmation.exploreMore')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;