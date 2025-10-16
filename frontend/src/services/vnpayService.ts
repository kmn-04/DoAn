import api from './api';

export interface VnPayPaymentRequest {
  bookingId: number;
  amount: number;
  orderInfo?: string;
  bankCode?: string;
}

export interface VnPayPaymentResponse {
  paymentUrl: string;
  orderId: string;
  message: string;
  transactionNo?: string;
}

export const vnpayService = {
  /**
   * Tạo URL thanh toán VNPay
   */
  createPayment: async (request: VnPayPaymentRequest): Promise<VnPayPaymentResponse> => {
    try {
      const response = await api.post('/payment/vnpay/create-payment', request);
      return response.data;
    } catch (error: any) {
      console.error('Error creating VNPay payment:', error);
      throw error;
    }
  },

  /**
   * Xử lý kết quả thanh toán từ VNPay
   */
  handlePaymentReturn: async (queryParams: string): Promise<VnPayPaymentResponse> => {
    try {
      console.log('📞 Calling payment return API with params:', queryParams);
      const response = await api.get(`/payment/vnpay/payment-return${queryParams}`);
      console.log('✅ Payment return API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error handling payment return:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  /**
   * Lấy ý nghĩa mã response code
   */
  getResponseCodeMeaning: async (code: string): Promise<{ code: string; message: string }> => {
    try {
      const response = await api.get(`/payment/vnpay/response-code/${code}`);
      return response.data;
    } catch (error: any) {
      console.error('Error getting response code meaning:', error);
      throw error;
    }
  },
};

