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
    // Return hardcoded payment methods including Cash on Arrival
    return {
      CASH: {
        name: 'Thanh toán khi nhận tour',
        code: 'CASH',
        description: 'Thanh toán trực tiếp cho hướng dẫn viên khi bắt đầu tour',
        logo: '',
        enabled: true,
        testMode: false
      },
      BANK_TRANSFER: {
        name: 'Chuyển khoản ngân hàng',
        code: 'BANK_TRANSFER',
        description: 'Chuyển khoản qua ngân hàng (sẽ có hướng dẫn sau khi đặt)',
        logo: '',
        enabled: true,
        testMode: false
      }
      // MoMo, VNPay, etc. disabled for now
    };
  },

  // MoMo payment - Removed (to be re-implemented)
  createMoMoPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    throw new Error('MoMo payment temporarily disabled - under re-implementation');
  },

  checkMoMoPaymentStatus: async (orderId: string): Promise<PaymentResponse> => {
    throw new Error('MoMo payment temporarily disabled - under re-implementation');
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
      case 'CASH':
      case 'BANK_TRANSFER':
        // For cash/bank transfer, no payment gateway needed
        // Just return success response
        return {
          success: true,
          orderId: `ORD-${Date.now()}`,
          amount: request.amount,
          paymentMethod: request.paymentMethod,
          paymentUrl: '', // No redirect needed
          message: request.paymentMethod === 'CASH' 
            ? 'Đặt tour thành công! Vui lòng thanh toán khi nhận tour.'
            : 'Đặt tour thành công! Vui lòng chuyển khoản theo hướng dẫn.'
        };
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

  // Handle payment redirect return - Removed
  handlePaymentReturn: (params: URLSearchParams): PaymentResponse => {
    throw new Error('Payment return handling temporarily disabled');
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
