import { apiClient } from './api';
import type { Partner, PartnerFilters } from '../types/partner';

export interface PartnerResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  type: 'Hotel' | 'Restaurant';
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  establishedYear?: number;
  avatarUrl?: string;
  rating: number;
  totalReviews: number;
  specialties: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PartnerPageResponse {
  content: PartnerResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

const partnerService = {
  // Get all partners with pagination
  getAllPartners: async (params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  } = {}): Promise<PartnerPageResponse> => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: PartnerPageResponse;
    }>('/partners', {
      params: {
        page: params.page || 0,
        size: params.size || 20,
        sortBy: params.sortBy || 'name',
        sortDirection: params.sortDirection || 'asc'
      }
    });
    return response.data.data;
  },

  // Get partner by ID
  getPartnerById: async (id: number): Promise<PartnerResponse> => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: PartnerResponse;
    }>(`/partners/${id}`);
    return response.data.data;
  },

  // Search partners with filters
  searchPartners: async (params: {
    keyword?: string;
    type?: string;
    location?: string;
    minRating?: number;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: string;
  } = {}): Promise<PartnerPageResponse> => {
    const response = await apiClient.get<{
      success: boolean;
      message: string;
      data: PartnerPageResponse;
    }>('/partners/search', {
      params: {
        keyword: params.keyword,
        type: params.type,
        location: params.location,
        minRating: params.minRating,
        page: params.page || 0,
        size: params.size || 12,
        sortBy: params.sortBy || 'name',
        sortDirection: params.sortDirection || 'asc'
      }
    });
    return response.data.data;
  },

  // Convert API response to frontend Partner type
  mapToPartner: (partnerResponse: PartnerResponse): Partner => ({
    id: partnerResponse.id,
    name: partnerResponse.name,
    slug: partnerResponse.slug,
    description: partnerResponse.description,
    type: partnerResponse.type,
    address: partnerResponse.address,
    phone: partnerResponse.phone,
    email: partnerResponse.email,
    website: partnerResponse.website,
    establishedYear: partnerResponse.establishedYear,
    avatarUrl: partnerResponse.avatarUrl,
    rating: partnerResponse.rating,
    totalReviews: partnerResponse.totalReviews,
    totalTours: 0, // Backend doesn't provide this yet
    totalBookings: 0, // Backend doesn't provide this yet
    specialties: Array.isArray(partnerResponse.specialties) 
      ? partnerResponse.specialties 
      : (typeof partnerResponse.specialties === 'string' 
          ? JSON.parse(partnerResponse.specialties) 
          : []),
    images: [], // Backend doesn't provide this yet
    tours: [], // Backend doesn't provide this yet
    createdAt: partnerResponse.createdAt,
    updatedAt: partnerResponse.updatedAt
  })
};

export default partnerService;
