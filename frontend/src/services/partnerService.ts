import apiClient from './api';
import type { ApiResponse } from '../types';

export interface PartnerImage {
  id: number;
  imageUrl: string;
  imageType: 'cover' | 'logo' | 'gallery';
  displayOrder: number;
  altText?: string;
}

export interface PartnerTour {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  location: string;
  images: string[];
  rating: number;
  totalReviews: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  category: {
    id: number;
    name: string;
    slug: string;
  };
  highlights: string[];
  includes: string[];
  excludes: string[];
  itinerary: any[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: 'Hotel' | 'Restaurant' | 'Transportation' | 'Guide' | 'Other';
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  establishedYear?: number;
  rating: number;
  totalReviews: number;
  totalTours: number;
  totalBookings: number;
  specialties: string[];
  images: PartnerImage[];
  tours: PartnerTour[];
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface PartnerSearchRequest {
  keyword?: string;
  type?: string;
  location?: string;
  minRating?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const partnerService = {
  getAllPartners: async (): Promise<PartnerResponse[]> => {
    try {
      const response = await apiClient.get<ApiResponse<PartnerResponse[]>>('/partners');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching partners:', error);
      return [];
    }
  },

  getPartnerBySlug: async (slug: string): Promise<PartnerResponse | null> => {
    try {
      const response = await apiClient.get<ApiResponse<PartnerResponse>>(`/partners/${slug}`);
      return response.data.data || null;
    } catch (error) {
      console.error(`Error fetching partner ${slug}:`, error);
      return null;
    }
  },

  searchPartners: async (params: PartnerSearchRequest): Promise<PageResponse<PartnerResponse>> => {
    try {
      // For now, use getAllPartners and do client-side filtering
      const allPartners = await partnerService.getAllPartners();
      
      let filtered = [...allPartners];
      
      // Apply filters
      if (params.keyword) {
        const keyword = params.keyword.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(keyword) ||
          p.description?.toLowerCase().includes(keyword)
        );
      }
      
      if (params.type && params.type !== 'all') {
        filtered = filtered.filter(p => p.type === params.type);
      }
      
      if (params.location) {
        const location = params.location.toLowerCase();
        filtered = filtered.filter(p => 
          p.address?.toLowerCase().includes(location)
        );
      }
      
      if (params.minRating) {
        filtered = filtered.filter(p => p.rating >= params.minRating!);
      }
      
      // Apply sorting
      const sortBy = params.sortBy || 'name';
      const sortDirection = params.sortDirection || 'asc';
      
      filtered.sort((a, b) => {
        let aVal: any = a[sortBy as keyof PartnerResponse];
        let bVal: any = b[sortBy as keyof PartnerResponse];
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
      
      // Apply pagination
      const page = params.page || 0;
      const size = params.size || 12;
      const start = page * size;
      const end = start + size;
      const content = filtered.slice(start, end);
      
      return {
        content,
        totalPages: Math.ceil(filtered.length / size),
        totalElements: filtered.length,
        size,
        number: page
      };
    } catch (error) {
      console.error('Error searching partners:', error);
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        size: params.size || 12,
        number: params.page || 0
      };
    }
  },

  mapToPartner: (response: PartnerResponse): any => {
    return {
      id: response.id,
      name: response.name,
      slug: response.slug,
      description: response.description,
      type: response.type,
      address: response.address,
      phone: response.phone,
      email: response.email,
      website: response.website,
      avatarUrl: response.avatarUrl, // ensure legacy single logo is passed through
      rating: response.rating,
      totalReviews: response.totalReviews,
      totalTours: response.totalTours,
      totalBookings: response.totalBookings,
      establishedYear: response.establishedYear,
      specialties: response.specialties,
      images: response.images,
      status: response.status,
      logo: response.images?.find(img => img.imageType === 'logo')?.imageUrl,
      coverImage: response.images?.find(img => img.imageType === 'cover')?.imageUrl || response.images?.[0]?.imageUrl
    };
  },

  // Partner Favorites
  addToFavorites: async (partnerId: number): Promise<void> => {
    await apiClient.post(`/partners/${partnerId}/favorite`);
  },

  removeFromFavorites: async (partnerId: number): Promise<void> => {
    await apiClient.delete(`/partners/${partnerId}/favorite`);
  },

  isFavorited: async (partnerId: number): Promise<boolean> => {
    try {
      const response = await apiClient.get<ApiResponse<{ isFavorited: boolean }>>(`/partners/${partnerId}/favorite`);
      return response.data.data?.isFavorited || false;
    } catch (error) {
      return false;
    }
  },

  getUserFavorites: async (): Promise<number[]> => {
    try {
      const response = await apiClient.get<ApiResponse<number[]>>('/partners/favorites');
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  }
};

export default partnerService;
