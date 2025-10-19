import { apiClient } from './api';

export interface NewsletterRequest {
  email: string;
}

export interface NewsletterResponse {
  id: number;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

/**
 * Subscribe to newsletter
 */
export const subscribe = async (email: string): Promise<NewsletterResponse> => {
  try {
    const response = await apiClient.post<{ data: NewsletterResponse }>('/newsletter/subscribe', {
      email
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Đăng ký không thành công');
  }
};

/**
 * Unsubscribe from newsletter
 */
export const unsubscribe = async (email: string): Promise<void> => {
  try {
    await apiClient.delete('/newsletter/unsubscribe', {
      params: { email }
    });
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Hủy đăng ký không thành công');
  }
};

/**
 * Get total subscribers (admin only)
 */
export const getTotalSubscribers = async (): Promise<number> => {
  try {
    const response = await apiClient.get<{ data: number }>('/newsletter/total-subscribers');
    return response.data.data;
  } catch (error: any) {
    throw new Error('Không thể lấy số lượng subscribers');
  }
};

export default {
  subscribe,
  unsubscribe,
  getTotalSubscribers
};

