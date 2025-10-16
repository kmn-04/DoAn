import React, { useState } from 'react';
import { vnpayService } from '../../services/vnpayService';
import type { VnPayPaymentRequest } from '../../services/vnpayService';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';

interface VnPayPaymentProps {
  bookingId: number;
  amount: number;
  orderInfo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const VnPayPayment: React.FC<VnPayPaymentProps> = ({
  bookingId,
  amount,
  orderInfo,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const handleVnPayPayment = async () => {
    try {
      setLoading(true);
      
      const request: VnPayPaymentRequest = {
        bookingId,
        amount,
        orderInfo: orderInfo || `Thanh toán đơn hàng #${bookingId}`,
      };
      
      console.log('Creating VNPay payment:', request);
      
      const response = await vnpayService.createPayment(request);
      
      console.log('VNPay payment URL created:', response.paymentUrl);
      
      // Redirect to VNPay
      window.location.href = response.paymentUrl;
      
      onSuccess?.();
    } catch (error: any) {
      console.error('VNPay payment error:', error);
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán VNPay';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vnpay-payment">
      <Button
        onClick={handleVnPayPayment}
        disabled={loading}
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loading size="sm" />
            <span>Đang xử lý...</span>
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
            <span>Thanh toán qua VNPay</span>
          </>
        )}
      </Button>
      
      <div className="mt-3 text-sm text-gray-600 text-center">
        <p>Bạn sẽ được chuyển đến trang thanh toán VNPay</p>
      </div>
    </div>
  );
};

