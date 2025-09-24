import { apiClient } from './api';

// Cancellation Request Types
export interface CancellationRequest {
  bookingId: number;
  reason: string;
  reasonCategory: string;
  additionalNotes?: string;
  isMedicalEmergency?: boolean;
  isWeatherRelated?: boolean;
  isForceMajeure?: boolean;
  supportingDocuments?: string[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  preferredRefundMethod?: string;
  customerNotes?: string;
  acknowledgesCancellationPolicy?: boolean;
  acknowledgesRefundTerms?: boolean;
  requestsExpediteProcessing?: boolean;
}

// Cancellation Response Types
export interface CancellationResponse {
  id: number;
  bookingId: number;
  bookingCode: string;
  reason: string;
  reasonCategory: string;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  refundStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  originalAmount: number;
  finalRefundAmount: number;
  cancellationFee: number;
  processingFee: number;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  adminNotes?: string;
  customerNotes?: string;
  isEmergencyCase: boolean;
  tourName?: string;
  tourStartDate?: string;
  hoursBeforeDeparture?: number;
  policyName?: string;
}

// Cancellation Evaluation
export interface CancellationEvaluation {
  isEligible: boolean;
  reason: string;
  estimatedRefund: number;
  cancellationFee: number;
  processingFee: number;
  finalRefundAmount: number;
  hoursBeforeDeparture: number;
  policyName: string;
  warnings: string[];
  requirements: string[];
}

// Page Response for cancellations
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

const cancellationService = {
  // Submit cancellation request
  submitCancellationRequest: async (request: CancellationRequest): Promise<CancellationResponse> => {
    console.log('📤 Submitting cancellation request:', request);
    try {
      const response = await apiClient.post<CancellationResponse>('/cancellations/request', request);
      console.log('✅ Cancellation request submitted:', response.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('❌ Error submitting cancellation request:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Request data was:', request);
      throw error;
    }
  },

  // Get user's cancellation history
  getUserCancellations: async (userId: number, page: number = 0, size: number = 20): Promise<PageResponse<CancellationResponse>> => {
    console.log('🔍 Fetching user cancellations:', { userId, page, size });
    try {
      const response = await apiClient.get<PageResponse<CancellationResponse>>('/cancellations/my-cancellations', {
        params: { page, size }
      });
      console.log('✅ User cancellations retrieved:', response.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('❌ Error fetching user cancellations:', error);
      // Return empty page for now
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size,
        number: page,
        first: true,
        last: true
      };
    }
  },

  // Get cancellation by booking ID
  getCancellationByBookingId: async (bookingId: number): Promise<CancellationResponse | null> => {
    console.log('🔍 Fetching cancellation by booking ID:', bookingId);
    try {
      const response = await apiClient.get<CancellationResponse>(`/cancellations/booking/${bookingId}`);
      console.log('✅ Cancellation by booking ID retrieved:', response.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('❌ Error fetching cancellation by booking ID:', error);
      return null;
    }
  },

  // Check if booking can be cancelled
  canCancelBooking: async (bookingId: number): Promise<boolean> => {
    console.log('🔍 Checking if booking can be cancelled:', bookingId);
    try {
      const response = await apiClient.get<boolean>(`/cancellations/booking/${bookingId}/can-cancel`);
      console.log('✅ Cancellation eligibility checked:', response.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('❌ Error checking cancellation eligibility:', error);
      return true; // Default to allowing cancellation for testing
    }
  },

  // Evaluate cancellation (get refund calculation)
  evaluateCancellation: async (bookingId: number, request: CancellationRequest): Promise<CancellationEvaluation> => {
    console.log('🔍 Evaluating cancellation:', { bookingId, request });

    try {
      const response = await apiClient.post<CancellationEvaluation>(`/cancellations/booking/${bookingId}/evaluate`, request);
      console.log('✅ Cancellation evaluated:', response.data);
      return response.data.data!;
    } catch (error: any) {
      console.error('❌ Error evaluating cancellation:', error);
      throw error;
    }
  },

  // Test endpoint (no auth required)
  testConnection: async (): Promise<string> => {
    try {
      const response = await apiClient.get<string>('/cancellations/test');
      return response.data.data!;
    } catch (error: any) {
      console.error('❌ Error testing cancellation connection:', error);
      throw error;
    }
  }
};

export default cancellationService;
