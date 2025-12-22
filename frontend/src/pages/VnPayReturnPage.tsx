import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { vnpayService } from '../services/vnpayService';
import { Loading } from '../components/ui/Loading';
import { 
  CheckCircleIcon,
  CalendarDaysIcon,
  UsersIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '../components/ui';
import axios from 'axios';

interface BookingDetails {
  id: number;
  bookingCode: string;
  status: string;
  totalPrice: number;
  finalAmount: number;
  startDate: string;
  numAdults: number;
  numChildren: number;
  tour: {
    name: string;
    location: string;
  };
  user: {
    name: string;
    email: string;
    phoneNumber: string;
  };
}

const VnPayReturnPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    orderId?: string;
    transactionNo?: string;
  } | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        const queryParams = location.search;
        
        if (!queryParams) {
          setResult({
            success: false,
            message: t('vnpay.error.noPaymentInfo'),
          });
          setProcessing(false);
          return;
        }

        console.log('Processing VNPay return with params:', queryParams);
        
        const urlParams = new URLSearchParams(queryParams);
        const responseCode = urlParams.get('vnp_ResponseCode');
        
        // Call API to handle payment return
        const response = await vnpayService.handlePaymentReturn(queryParams);
        
        console.log('Payment return response:', response);
        
        if (responseCode === '00') {
          setResult({
            success: true,
            message: response?.message || t('vnpay.error.paymentSuccess'),
            orderId: response?.orderId || '',
            transactionNo: response?.transactionNo || '',
          });
          
          // Fetch booking details using payment orderId
          if (response?.orderId) {
            try {
              console.log('🔍 Fetching booking details for payment ID:', response.orderId);
              const token = localStorage.getItem('token');
              const bookingResponse = await axios.get(
                `http://localhost:8080/api/bookings/payment/${response.orderId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              console.log('📦 Booking response:', bookingResponse.data);
              if (bookingResponse.data?.data) {
                console.log('✅ Setting booking details:', bookingResponse.data.data);
                setBookingDetails(bookingResponse.data.data);
              } else {
                console.warn('⚠️ No booking data in response');
              }
            } catch (error: any) {
              console.error('❌ Error fetching booking details:', error);
              console.error('Error details:', error.response?.data);
            }
          } else {
            console.warn('⚠️ No orderId in payment response');
          }
        } else {
          // Get error message from response code
          let errorMessage = response?.message || t('vnpay.error.paymentFailed');
          
          if (responseCode) {
            try {
              const codeInfo = await vnpayService.getResponseCodeMeaning(responseCode);
              errorMessage = codeInfo?.message || errorMessage;
            } catch (error) {
              console.error('Error getting response code meaning:', error);
            }
          }
          
          setResult({
            success: false,
            message: errorMessage,
            orderId: response?.orderId || '',
          });
        }
      } catch (error: any) {
        console.error('Error processing payment return:', error);
        const errorMsg = error?.response?.data?.message || error?.message || t('vnpay.error.processingError');
        setResult({
          success: false,
          message: String(errorMsg),
        });
      } finally {
        setProcessing(false);
      }
    };

    processPaymentReturn();
  }, [location.search, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600 font-normal">{t('vnpay.processing')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {result?.success ? (
          <>
            {/* Success Header */}
            <div className="text-center mb-10 animate-fade-in">
              <div 
                className="mx-auto flex items-center justify-center h-20 w-20 rounded-none mb-6 animate-fade-in-scale"
                style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
              >
                <CheckCircleIcon className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-normal text-slate-900 mb-4 tracking-tight">
                {t('vnpay.success.title')}
              </h1>
              <p className="text-lg text-gray-600 font-normal">
                {t('vnpay.success.subtitle')}
              </p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-white border border-stone-200 rounded-none p-8 mb-6">
              <div className="border-b border-stone-200 pb-6 mb-8">
                <h2 className="text-2xl font-normal text-slate-900 mb-4 tracking-tight">
                  {t('vnpay.success.bookingDetails')}
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm text-gray-600 font-normal">{t('vnpay.success.bookingCode')}</span>
                  <span className="font-mono font-medium text-lg tracking-wider" style={{ color: '#D4AF37' }}>
                    {bookingDetails?.bookingCode || result.orderId}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-medium bg-amber-100 border border-amber-300 text-amber-800">
                    {t('vnpay.success.confirmed')}
                  </span>
                </div>
              </div>

              {bookingDetails ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Tour Info */}
                    <div>
                      <h3 className="font-medium text-slate-900 mb-4 tracking-tight">{t('vnpay.success.tourInfo')}</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <MapPinIcon className="h-5 w-5 mt-1" style={{ color: '#D4AF37' }} />
                          <div>
                            <p className="font-medium text-slate-900">
                              {bookingDetails.tour.name}
                            </p>
                            <p className="text-sm text-gray-600 font-normal mt-1">
                              {bookingDetails.tour.location}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <CalendarDaysIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                          <div>
                            <p className="font-medium text-slate-900">{t('vnpay.success.departureDate')}</p>
                            <p className="text-sm text-gray-600 font-normal mt-1">
                              {formatDate(bookingDetails.startDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <UsersIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                          <div>
                            <p className="font-medium text-slate-900">{t('vnpay.success.participants')}</p>
                            <p className="text-sm text-gray-600 font-normal mt-1">
                              {t('vnpay.success.adults', { count: bookingDetails.numAdults })}
                              {bookingDetails.numChildren > 0 && 
                                `, ${t('vnpay.success.children', { count: bookingDetails.numChildren })}`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h3 className="font-medium text-slate-900 mb-4 tracking-tight">{t('vnpay.success.contactInfo')}</h3>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="h-10 w-10 rounded-none flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                          >
                            <span className="text-sm text-white font-medium">
                              {bookingDetails.user.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{bookingDetails.user.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                          <p className="text-sm text-gray-600 font-normal">{bookingDetails.user.email}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5" style={{ color: '#D4AF37' }} />
                          <p className="text-sm text-gray-600 font-normal">{bookingDetails.user.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="border-t border-stone-200 pt-6 mt-8">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-slate-900 tracking-tight">{t('vnpay.success.totalPayment')}</span>
                      <span className="text-3xl font-normal tracking-tight" style={{ color: '#D4AF37' }}>
                        {formatPrice(bookingDetails.finalAmount || bookingDetails.totalPrice)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* Fallback for when booking details not available */
                <div className="space-y-4">
                  {result.transactionNo && (
                    <div className="bg-stone-50 rounded-none p-4">
                      <p className="text-sm text-gray-600 font-normal">{t('vnpay.success.transactionCode')}</p>
                      <p className="text-lg font-semibold text-slate-900">{result.transactionNo}</p>
                    </div>
                  )}
              </div>
            )}
            </div>

            {/* Next Steps */}
            <div className="bg-amber-50 border border-amber-200 rounded-none p-6 mb-8">
              <h3 className="font-medium text-slate-900 mb-4 tracking-tight">{t('vnpay.success.nextSteps.title')}</h3>
              <div className="space-y-3 text-sm text-slate-900 font-normal">
                <p>• {t('vnpay.success.nextSteps.email')}</p>
                <p>• {t('vnpay.success.nextSteps.contact')}</p>
                <p>• {t('vnpay.success.nextSteps.documents')}</p>
                <p dangerouslySetInnerHTML={{ __html: `• ${t('vnpay.success.nextSteps.hotline', { hotline: '1900 1234' })}` }} />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/bookings${bookingDetails?.id ? `?highlight=${bookingDetails.id}` : ''}`}>
                <Button 
                  className="w-full sm:w-auto text-white px-8 py-3 rounded-none hover:opacity-90 transition-all duration-300 font-medium tracking-wide"
                  style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
                >
                  {t('vnpay.success.viewBookings')}
                </Button>
              </Link>
              <Link to="/tours">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto px-8 py-3 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-none transition-all duration-300 font-medium tracking-wide"
                >
                  {t('vnpay.success.exploreTours')}
                </Button>
              </Link>
            </div>
          </>
        ) : (
          /* Payment Failed State */
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-stone-200 rounded-none p-8">
          <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-none bg-red-100 mb-4">
                  <XCircleIcon className="h-10 w-10 text-red-600" />
            </div>
                <h2 className="text-2xl font-normal text-slate-900 mb-2 tracking-tight">{t('vnpay.error.paymentFailed')}</h2>
                <p className="text-gray-600 font-normal mb-6">{result?.message}</p>
            
            {result?.orderId && (
                  <div className="bg-stone-50 rounded-none p-4 mb-6">
                    <p className="text-sm text-gray-600 font-normal">{t('vnpay.error.orderId')}</p>
                    <p className="text-lg font-semibold text-slate-900">{result.orderId}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/bookings')}
                    className="flex-1 bg-stone-200 text-slate-900 px-6 py-3 rounded-none hover:bg-stone-300 transition-colors font-medium"
              >
                {t('vnpay.error.goBack')}
              </button>
              <button
                onClick={() => window.location.reload()}
                    className="flex-1 text-white px-6 py-3 rounded-none hover:opacity-90 transition-colors font-medium"
                    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #C5A028 100%)' }}
              >
                {t('vnpay.error.retry')}
              </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VnPayReturnPage;

