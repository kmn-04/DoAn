import { apiClient } from './api';

// Tour specific types - UPDATED to match new backend schema
export interface TourResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;  // Renamed from discountPrice
  childPrice?: number;  // NEW
  infantPrice?: number;  // NEW
  duration: number;
  maxPeople: number;  // Renamed from maxParticipants
  minPeople?: number;  // NEW
  
  // Location fields (UPDATED)
  departureLocation?: string;  // NEW: Nơi khởi hành
  destination?: string;  // NEW: Điểm đến chính
  destinations?: string;  // NEW: JSON array of destinations
  region?: string;  // NEW: Vùng miền
  countryCode?: string;  // NEW
  
  // Transportation & Accommodation (NEW)
  transportation?: string;
  accommodation?: string;
  mealsIncluded?: string;
  
  // Services (NEW)
  includedServices?: string;
  excludedServices?: string;
  highlights?: string;  // JSON array
  
  // Tour info
  tourType: 'DOMESTIC' | 'INTERNATIONAL';
  country?: {
    id: number;
    name: string;
    code: string;
    continent: string;
    currency?: string;
    visaRequired: boolean;
    flagUrl?: string;
  };
  visaRequired?: boolean;  // NEW: Direct field
  visaInfo?: string;
  flightIncluded?: boolean;
  
  // Additional info (UPDATED)
  note?: string;  // Renamed from notes
  cancellationPolicy?: string;  // NEW
  suitableFor?: string;  // NEW
  viewCount?: number;  // NEW
  
  isFeatured: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  
  // Main image
  mainImage?: string;  // NEW: Direct field
  
  category?: {  // Make optional to handle null
    id: number;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
  };
  
  targetAudiences?: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
  
  images?: Array<{
    id: number;
    imageUrl: string;
    altText?: string;
    isPrimary: boolean;
  }>;
  
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

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

export interface TourSearchRequest {
  keyword?: string;
  categoryId?: number;
  tourType?: 'DOMESTIC' | 'INTERNATIONAL';
  continent?: string;
  countryId?: number;
  location?: string;  // NEW: For filtering by destination/location
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;  // NEW: For duration range
  maxDuration?: number;  // NEW: For duration range
  duration?: number;  // DEPRECATED: Use minDuration/maxDuration instead
  minRating?: number;
  visaRequired?: boolean;
  flightIncluded?: boolean;
  isFeatured?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface TourStatistics {
  totalTours: number;
  activeTours: number;
  featuredTours: number;
  domesticTours: number;
  internationalTours: number;
  averagePrice: number;
  averageRating: number;
  totalBookings: number;
}

const tourService = {
  // Get all tours with pagination
  getAllTours: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<PageResponse<TourResponse>> => {
    const response = await apiClient.get<PageResponse<TourResponse>>('/tours', {
      params
    });
    return response.data.data!;
  },

  // Get active tours
  getActiveTours: async (): Promise<TourResponse[]> => {
    const response = await apiClient.get<TourResponse[]>('/tours/active');
    return response.data.data!;
  },

  // Get featured tours
  getFeaturedTours: async (): Promise<TourResponse[]> => {
    const response = await apiClient.get<TourResponse[]>('/tours/featured');
    return response.data.data!;
  },

  // Get tour by ID
  getTourById: async (id: number): Promise<TourResponse> => {
    const response = await apiClient.get<TourResponse>(`/tours/${id}`);
    return response.data.data!;
  },

  // Get tour by slug
  getTourBySlug: async (slug: string): Promise<TourResponse> => {
    const response = await apiClient.get<TourResponse>(`/tours/slug/${slug}`);
    return response.data.data!;
  },

  // Search tours with filters
  searchTours: async (searchRequest: TourSearchRequest): Promise<PageResponse<TourResponse>> => {
    const response = await apiClient.post<PageResponse<TourResponse>>('/tours/search', searchRequest);
    return response.data.data!;
  },

  // Get tours by category
  getToursByCategory: async (categoryId: number, params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<PageResponse<TourResponse>> => {
    const response = await apiClient.get<PageResponse<TourResponse>>(`/tours/category/${categoryId}`, {
      params
    });
    return response.data.data!;
  },

  // Get tours by type (domestic/international)
  getToursByType: async (tourType: 'DOMESTIC' | 'INTERNATIONAL', params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<PageResponse<TourResponse>> => {
    const response = await apiClient.get<PageResponse<TourResponse>>(`/tours/type/${tourType}`, {
      params
    });
    return response.data.data!;
  },

  // Get tours by country
  getToursByCountry: async (countryId: number, params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<PageResponse<TourResponse>> => {
    const response = await apiClient.get<PageResponse<TourResponse>>(`/tours/country/${countryId}`, {
      params
    });
    return response.data.data!;
  },

  // Get international tours by continent
  getInternationalToursByContinent: async (continent: string, params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<PageResponse<TourResponse>> => {
    const response = await apiClient.get<PageResponse<TourResponse>>(`/tours/international/continent/${continent}`, {
      params
    });
    return response.data.data!;
  },

  // Get tour statistics
  getTourStatistics: async (): Promise<TourStatistics> => {
    const response = await apiClient.get<TourStatistics>('/tours/statistics');
    return response.data.data!;
  },

  // Check if slug exists
  checkSlugExists: async (slug: string): Promise<boolean> => {
    const response = await apiClient.get<boolean>(`/tours/check-slug/${slug}`);
    return response.data.data!;
  },

  // Create tour (admin only)
  createTour: async (tourData: any): Promise<TourResponse> => {
    const response = await apiClient.post<TourResponse>('/tours', tourData);
    return response.data.data!;
  },

  // Update tour (admin only)
  updateTour: async (id: number, tourData: any): Promise<TourResponse> => {
    const response = await apiClient.put<TourResponse>(`/tours/${id}`, tourData);
    return response.data.data!;
  },

  // Change tour status (admin only)
  changeTourStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE' | 'DRAFT'): Promise<TourResponse> => {
    const response = await apiClient.put<TourResponse>(`/tours/${id}/status`, null, {
      params: { status }
    });
    return response.data.data!;
  },

  // Delete tour (admin only)
  deleteTour: async (id: number): Promise<void> => {
    await apiClient.delete(`/tours/${id}`);
  },

  // Get unique locations from tours
  getUniqueLocations: async (): Promise<string[]> => {
    try {
      const response = await apiClient.get<string[]>('/tours/locations');
      return response.data.data!;
    } catch (error) {
      console.error('Error fetching locations:', error);
      // Fallback to hardcoded locations if API endpoint not available
      return ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Quảng Ninh', 'Lào Cai', 'Kiên Giang', 'Quảng Nam', 'Lâm Đồng'];
    }
  },

  // Get tour schedules
  getTourSchedules: async (tourId: number): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/tour-schedules/tour/${tourId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching tour schedules:', error);
      return [];
    }
  },

  // Get available schedules for tour
  getAvailableSchedules: async (tourId: number, fromDate?: string): Promise<any[]> => {
    try {
      const params = fromDate ? { fromDate } : {};
      const response = await apiClient.get(`/tour-schedules/tour/${tourId}/available`, { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching available schedules:', error);
      return [];
    }
  },
};

export default tourService;
