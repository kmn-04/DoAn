import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import paymentService from '../../services/paymentService';

interface PaymentResponse {
  paymentId: string;
  orderId: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  message: string;
  payUrl?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt?: string;
  errorCode?: string;
  errorMessage?: string;
}

const PaymentReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState<PaymentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        setIsLoading(true);
        
        // Handle payment return from URL parameters
        console.log('🔍 PaymentReturnPage - URL params:', Object.fromEntries(searchParams.entries()));
        const result = paymentService.handlePaymentReturn(searchParams);
        console.log('🔍 PaymentReturnPage - Parsed result:', result);
        setPaymentResult(result);
        
        // TEMPORARY: Skip backend verification to test client-side parsing
        console.log('🔧 TEMPORARY: Skipping backend verification for debugging');
        
        // TODO: Re-enable after backend debugging
        // // If successful, verify with backend
        // if (result.status === 'SUCCESS' && result.orderId) {
        //   try {
        //     const verifiedResult = await paymentService.checkMoMoPaymentStatus(result.orderId);
        //     
        //     // Only use backend result if it's SUCCESS or FAILED (definitive status)
        //     // Keep client result if backend still shows PENDING
        //     if (verifiedResult.status === 'SUCCESS' || verifiedResult.status === 'FAILED') {
        //       setPaymentResult(verifiedResult);
        //     } else {
        //       console.log('Backend status check returned PENDING, keeping client-side result');
        //       // Keep the original successful result from client-side parsing
        //     }
        //   } catch (error) {
        //     console.error('Error verifying payment:', error);
        //     // Keep the original result if verification fails
        //     console.log('Backend verification failed, keeping client-side result');
        //   }
        // }
        
      } catch (error) {
        console.error('Error processing payment return:', error);
        setPaymentResult({
          paymentId: '',
          orderId: '',
          bookingId: '',
          amount: 0,
          paymentMethod: 'MOMO',
          status: 'FAILED',
          message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán',
          createdAt: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    processPaymentReturn();
  }, [searchParams]);

  const handleContinue = () => {
    if (paymentResult?.status === 'SUCCESS') {
      // Set flag to refresh bookings
      localStorage.setItem('refreshBookings', 'true');
      // Redirect to booking page
      navigate('/bookings');
    } else {
      // Redirect back to booking page to retry
      navigate('/tours');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Loading size="lg" />
            <h2 className="text-xl font-semibold mt-4 mb-2">Đang xử lý thanh toán</h2>
            <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!paymentResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Không thể xử lý kết quả thanh toán</h2>
            <p className="text-gray-600 mb-6">Vui lòng liên hệ hỗ trợ nếu bạn đã thực hiện thanh toán.</p>
            <Button onClick={() => navigate('/bookings')}>
              Xem booking của tôi
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isSuccess = paymentResult.status === 'SUCCESS';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Success/Failure Icon */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isSuccess ? (
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h2 className={`text-xl font-semibold mb-2 ${
            isSuccess ? 'text-green-900' : 'text-red-900'
          }`}>
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán không thành công'}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {paymentResult.message}
          </p>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              {paymentResult.orderId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-medium">{paymentResult.orderId}</span>
                </div>
              )}
              {paymentResult.amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-medium">{paymentService.formatAmount(paymentResult.amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium">{paymentResult.paymentMethod}</span>
              </div>
              {paymentResult.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã giao dịch:</span>
                  <span className="font-medium">{paymentResult.transactionId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={handleContinue}
              className="w-full"
              variant={isSuccess ? "primary" : "outline"}
            >
              {isSuccess ? 'Xem booking của tôi' : 'Thử lại'}
            </Button>
            
            {!isSuccess && (
              <Button 
                onClick={() => navigate('/support')}
                variant="ghost"
                className="w-full"
              >
                Liên hệ hỗ trợ
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentReturnPage;
