import { apiClient } from './api';

// Common types
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Booking types
export interface BookingResponse {
  id: number;
  bookingCode: string;
  tour: {
    id: number;
    name: string;
    slug: string;
    price: number;
    location: string;
    tourType: 'DOMESTIC' | 'INTERNATIONAL';
    country?: {
      name: string;
      code: string;
    };
    images: Array<{
      imageUrl: string;
      isPrimary: boolean;
    }>;
  };
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  startDate: string;
  numAdults: number;
  numChildren: number;
  totalPeople: number;
  totalPrice: number;
  finalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  specialRequests?: string;
  contactPhone?: string;
  cancellationReason?: string;
  promotion?: {
    id: number;
    code: string;
    name: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingCreateRequest {
  tourId: number;
  startDate: string; // YYYY-MM-DD format
  numAdults: number;
  numChildren: number;
  specialRequests?: string;
  contactPhone?: string;
  promotionCode?: string;
}

export interface BookingUpdateRequest {
  specialRequests?: string;
  contactPhone?: string;
}

export interface BookingStatistics {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  currentMonthBookings: number;
  currentMonthRevenue: number;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';

const bookingService = {
  // Get all bookings with pagination
  getAllBookings: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<PageResponse<BookingResponse>> => {
    const response = await apiClient.get<PageResponse<BookingResponse>>('/bookings', {
      params
    });
    return response.data.data!;
  },

  // Search bookings
  searchBookings: async (keyword: string, params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<BookingResponse>> => {
    const response = await apiClient.get<PageResponse<BookingResponse>>('/bookings/search', {
      params: { keyword, ...params }
    });
    return response.data.data!;
  },

  // Get booking by ID
  getBookingById: async (id: number): Promise<BookingResponse> => {
    const response = await apiClient.get<BookingResponse>(`/bookings/${id}`);
    return response.data.data!;
  },

  // Get booking by code
  getBookingByCode: async (bookingCode: string): Promise<BookingResponse> => {
    const response = await apiClient.get<BookingResponse>(`/bookings/code/${bookingCode}`);
    return response.data.data!;
  },

  // Get bookings by user
  getBookingsByUser: async (userId: number): Promise<BookingResponse[]> => {
    const response = await apiClient.get<BookingResponse[]>(`/bookings/user/${userId}`);
    return response.data.data!;
  },

  // Get current user's bookings
  getCurrentUserBookings: async (): Promise<BookingResponse[]> => {
    const response = await apiClient.get<BookingResponse[]>('/bookings/my-bookings');
    return response.data.data!;
  },

  // Get bookings by tour
  getBookingsByTour: async (tourId: number): Promise<BookingResponse[]> => {
    const response = await apiClient.get<BookingResponse[]>(`/bookings/tour/${tourId}`);
    return response.data.data!;
  },

  // Get bookings by status
  getBookingsByStatus: async (status: BookingStatus): Promise<BookingResponse[]> => {
    const response = await apiClient.get<BookingResponse[]>(`/bookings/status/${status}`);
    return response.data.data!;
  },

  // Get upcoming bookings
  getUpcomingBookings: async (): Promise<BookingResponse[]> => {
    const response = await apiClient.get<BookingResponse[]>('/bookings/upcoming');
    return response.data.data!;
  },

  // Create booking
  createBooking: async (bookingData: BookingCreateRequest, userId: number): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>('/bookings', bookingData, {
      params: { userId }
    });
    return response.data.data!;
  },

  // Update booking
  updateBooking: async (id: number, bookingData: BookingUpdateRequest): Promise<BookingResponse> => {
    const response = await apiClient.put<BookingResponse>(`/bookings/${id}`, bookingData);
    return response.data.data!;
  },

  // Confirm booking
  confirmBooking: async (id: number): Promise<BookingResponse> => {
    const response = await apiClient.put<BookingResponse>(`/bookings/${id}/confirm`);
    return response.data.data!;
  },

  // Cancel booking
  cancelBooking: async (id: number, reason?: string): Promise<BookingResponse> => {
    const response = await apiClient.put<BookingResponse>(`/bookings/${id}/cancel`, null, {
      params: { reason }
    });
    return response.data.data!;
  },

  // Mark booking as paid
  markAsPaid: async (id: number): Promise<BookingResponse> => {
    const response = await apiClient.put<BookingResponse>(`/bookings/${id}/paid`);
    return response.data.data!;
  },

  // Complete booking
  completeBooking: async (id: number): Promise<BookingResponse> => {
    const response = await apiClient.put<BookingResponse>(`/bookings/${id}/complete`);
    return response.data.data!;
  },

  // Calculate total price
  calculatePrice: async (params: {
    tourId: number;
    adults: number;
    children?: number;
    promotionCode?: string;
  }): Promise<number> => {
    const response = await apiClient.get<number>('/bookings/calculate-price', {
      params
    });
    return response.data.data!;
  },

  // Check availability
  checkAvailability: async (params: {
    tourId: number;
    startDate: string;
    totalPeople: number;
  }): Promise<boolean> => {
    const response = await apiClient.get<boolean>('/bookings/check-availability', {
      params
    });
    return response.data.data!;
  },

  // Get booking statistics
  getBookingStatistics: async (): Promise<BookingStatistics> => {
    const response = await apiClient.get<BookingStatistics>('/bookings/statistics');
    return response.data.data!;
  },

  // Create new booking
  createBooking: async (data: {
    tourId: number;
    startDate: string;
    numAdults: number;
    numChildren?: number;
    specialRequests?: string;
    contactPhone?: string;
    promotionCode?: string;
  }): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>('/bookings', data);
    return response.data.data!;
  },
};

export default bookingService;
