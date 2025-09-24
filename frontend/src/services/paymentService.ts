import { apiClient } from './api';

export interface PaymentRequest {
  bookingId: string;
  amount: number;
  orderInfo: string;
  paymentMethod: 'MOMO' | 'VNPAY' | 'STRIPE' | 'PAYPAL';
  extraData?: string;
  userId?: number;
  userEmail?: string;
  userPhone?: string;
}

export interface PaymentResponse {
  paymentId: string;
  orderId: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  message: string;
  payUrl?: string; // URL để redirect user đến trang thanh toán
  transactionId?: string;
  createdAt: string;
  updatedAt?: string;
  
  // Error fields
  errorCode?: string;
  errorMessage?: string;
}

export interface PaymentMethod {
  name: string;
  code: string;
  description: string;
  logo: string;
  enabled: boolean;
  testMode: boolean;
}

export interface PaymentMethodsResponse {
  [key: string]: PaymentMethod;
}

const paymentService = {
  // Get available payment methods
  getPaymentMethods: async (): Promise<PaymentMethodsResponse> => {
    const response = await apiClient.get<PaymentMethodsResponse>('/payment/methods');
    return response.data.data!;
  },

  // Create MoMo payment
  createMoMoPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    console.log('🔍 MoMo payment request:', request);
    
    // Ensure all required fields are present and valid
    const validatedRequest = {
      bookingId: request.bookingId || '',
      amount: Number(request.amount) || 0,
      orderInfo: request.orderInfo || 'Payment',
      paymentMethod: request.paymentMethod || 'MOMO',
      extraData: request.extraData || '',
      userId: request.userId || null,
      userEmail: request.userEmail || '',
      userPhone: request.userPhone || ''
    };
    
    console.log('🔍 Validated MoMo request:', validatedRequest);
    
    const response = await apiClient.post<PaymentResponse>('/payment/momo/create', validatedRequest);
    return response.data.data!;
  },

  // Check MoMo payment status
  checkMoMoPaymentStatus: async (orderId: string): Promise<PaymentResponse> => {
    const response = await apiClient.get<PaymentResponse>(`/payment/momo/status/${orderId}`);
    return response.data.data!;
  },

  // Create VNPay payment (placeholder)
  createVNPayPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    throw new Error('VNPay payment not implemented yet');
  },

  // Create Stripe payment (placeholder)
  createStripePayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    throw new Error('Stripe payment not implemented yet');
  },

  // Create PayPal payment (placeholder)
  createPayPalPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    throw new Error('PayPal payment not implemented yet');
  },

  // Generic payment creation
  createPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    switch (request.paymentMethod) {
      case 'MOMO':
        return paymentService.createMoMoPayment(request);
      case 'VNPAY':
        return paymentService.createVNPayPayment(request);
      case 'STRIPE':
        return paymentService.createStripePayment(request);
      case 'PAYPAL':
        return paymentService.createPayPalPayment(request);
      default:
        throw new Error(`Unsupported payment method: ${request.paymentMethod}`);
    }
  },

  // Handle payment redirect return
  handlePaymentReturn: (params: URLSearchParams): PaymentResponse => {
    const resultCode = params.get('resultCode');
    const orderId = params.get('orderId');
    const message = params.get('message');
    
    console.log('🔍 MoMo callback parameters:', {
      resultCode,
      orderId,
      message,
      requestId: params.get('requestId'),
      amount: params.get('amount'),
      transId: params.get('transId'),
      extraData: params.get('extraData'),
      allParams: Object.fromEntries(params.entries())
    });
    
    // MoMo success codes: '0' = success
    const isSuccess = resultCode === '0' || resultCode === 0;
    
    console.log('🔍 Success check:', {
      resultCode,
      resultCodeType: typeof resultCode,
      isSuccess,
      comparison: resultCode === '0',
      comparisonNumber: resultCode === 0
    });
    
    return {
      paymentId: params.get('requestId') || '',
      orderId: orderId || '',
      bookingId: params.get('extraData') || '',
      amount: parseInt(params.get('amount') || '0'),
      paymentMethod: 'MOMO',
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      message: message || (isSuccess ? 'Thanh toán thành công' : 'Thanh toán không thành công'),
      transactionId: params.get('transId') || '',
      createdAt: new Date().toISOString()
    };
  },

  // Format amount for display
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }
};

export default paymentService;
