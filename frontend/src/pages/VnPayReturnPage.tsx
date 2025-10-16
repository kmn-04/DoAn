import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { vnpayService } from '../services/vnpayService';
import { Loading } from '../components/ui/Loading';

const VnPayReturnPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    orderId?: string;
    transactionNo?: string;
  } | null>(null);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        const queryParams = location.search;
        
        if (!queryParams) {
          setResult({
            success: false,
            message: 'Không tìm thấy thông tin thanh toán',
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
            message: response?.message || 'Thanh toán thành công',
            orderId: response?.orderId || '',
            transactionNo: response?.transactionNo || '',
          });
          
          // Redirect to bookings page after 3 seconds
          setTimeout(() => {
            navigate('/bookings');
          }, 3000);
        } else {
          // Get error message from response code
          let errorMessage = response?.message || 'Thanh toán thất bại';
          
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
        const errorMsg = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi xử lý kết quả thanh toán';
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

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {result?.success ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-6">{result.message}</p>
            
            {result.orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                <p className="text-lg font-semibold text-gray-900">{result.orderId}</p>
              </div>
            )}
            
            {result.transactionNo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Mã giao dịch VNPay</p>
                <p className="text-lg font-semibold text-gray-900">{result.transactionNo}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/bookings')}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Xem lịch sử đặt tour
              </button>
              <button
                onClick={() => navigate('/tours')}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Đặt tour khác
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-10 w-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-6">{result?.message}</p>
            
            {result?.orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Mã đơn hàng</p>
                <p className="text-lg font-semibold text-gray-900">{result.orderId}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/bookings')}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VnPayReturnPage;

