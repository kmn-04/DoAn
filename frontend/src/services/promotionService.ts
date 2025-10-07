import apiClient from './api';

export interface PromotionResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  maxUses?: number;
  usedCount?: number;
  remainingUses?: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive' | 'Expired';
  isValid?: boolean;
  isExpired?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const promotionService = {
  // Get all active/valid promotions
  getValidPromotions: async (): Promise<PromotionResponse[]> => {
    const response = await apiClient.get<PromotionResponse[]>('/promotions/active');
    return response.data.data!;
  },

  // Get promotion by code
  getPromotionByCode: async (code: string): Promise<PromotionResponse> => {
    const response = await apiClient.get<PromotionResponse>(`/promotions/code/${code}`);
    return response.data.data!;
  },

  // Validate promotion code
  validatePromotion: async (code: string, orderAmount: number): Promise<{
    valid: boolean;
    discountAmount: number;
    message: string;
  }> => {
    const response = await apiClient.post(`/promotions/validate`, {
      code,
      orderAmount
    });
    return response.data.data!;
  }
};

export default promotionService;
