import { apiClient } from './api';
import type { TourResponse } from './tourService';

// Types
export interface WishlistItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  location: string;
  rating: number;
  reviewCount: number;
  maxPeople: number;
  image: string;
  category: string;
  addedDate: string;
  tourType?: 'domestic' | 'international';
  country?: {
    name: string;
    code: string;
    flagUrl: string;
    visaRequired: boolean;
  };
  flightIncluded?: boolean;
  visaInfo?: string;
}

export interface WishlistStatistics {
  totalWishlists: number;
  uniqueUsers: number;
  uniqueTours: number;
  averageWishlistSize: number;
}

const wishlistService = {
  // Get user's wishlist
  getUserWishlist: async (userId: number): Promise<WishlistItem[]> => {
    try {
      const response = await apiClient.get<TourResponse[]>(`/wishlists`);
      
      // Convert TourResponse to WishlistItem
      return response.data.data!.map(tour => ({
        id: tour.id,
        name: tour.name,
        slug: tour.slug,
        description: tour.description,
        price: tour.price,
        originalPrice: tour.discountPrice,
        duration: `${tour.duration} ngày`,
        location: tour.location || tour.categoryName || 'Unknown',
        rating: tour.averageRating || 4.5,
        reviewCount: tour.totalReviews || 0,
        maxPeople: tour.maxParticipants,
        image: tour.images?.[0]?.imageUrl || tour.mainImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        category: tour.category.slug,
        addedDate: tour.createdAt || new Date().toISOString(),
        tourType: tour.tourType === 'DOMESTIC' ? 'domestic' : 'international',
        country: tour.country ? {
          name: tour.country.name,
          code: tour.country.code,
          flagUrl: tour.country.flagUrl,
          visaRequired: tour.country.visaRequired
        } : undefined,
        flightIncluded: tour.flightIncluded,
        visaInfo: tour.visaInfo
      }));
      
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      
      // Return empty array on error
      return [];
    }
  },

  // Add tour to wishlist
  addToWishlist: async (userId: number, tourId: number): Promise<void> => {
    await apiClient.post(`/wishlists/tour/${tourId}`);
  },

  // Remove tour from wishlist
  removeFromWishlist: async (userId: number, tourId: number): Promise<void> => {
    await apiClient.delete(`/wishlists/tour/${tourId}`);
  },

  // Check if tour is in wishlist
  isInWishlist: async (userId: number, tourId: number): Promise<boolean> => {
    try {
      const response = await apiClient.get<boolean>(`/wishlists/check/${tourId}`);
      return response.data.data!.inWishlist || false;
    } catch (error) {
      return false;
    }
  },

  // Get wishlist count
  getWishlistCount: async (userId: number): Promise<number> => {
    try {
      const response = await apiClient.get<number>(`/wishlists/count`);
      return response.data.data!.count || 0;
    } catch (error) {
      return 0;
    }
  },

  // Clear entire wishlist
  clearWishlist: async (userId: number): Promise<void> => {
    await apiClient.delete(`/wishlists/clear`);
  },

  // Get most wishlisted tours
  getMostWishlistedTours: async (limit: number = 10): Promise<WishlistItem[]> => {
    try {
      const response = await apiClient.get<TourResponse[]>(`/wishlists/popular?limit=${limit}`);
      
      return response.data.data!.map(tour => ({
        id: tour.id,
        name: tour.name,
        slug: tour.slug,
        description: tour.description,
        price: tour.price,
        originalPrice: tour.discountPrice,
        duration: `${tour.duration} ngày`,
        location: tour.location || tour.categoryName || 'Unknown',
        rating: tour.averageRating || 4.5,
        reviewCount: tour.totalReviews || 0,
        maxPeople: tour.maxParticipants,
        image: tour.images?.[0]?.imageUrl || tour.mainImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        category: tour.category.slug,
        addedDate: tour.createdAt || new Date().toISOString(),
        tourType: tour.tourType === 'DOMESTIC' ? 'domestic' : 'international',
        country: tour.country ? {
          name: tour.country.name,
          code: tour.country.code,
          flagUrl: tour.country.flagUrl,
          visaRequired: tour.country.visaRequired
        } : undefined,
        flightIncluded: tour.flightIncluded,
        visaInfo: tour.visaInfo
      }));
      
    } catch (error) {
      console.error('Error fetching popular wishlist tours:', error);
      return [];
    }
  },

  // Get wishlist statistics
  getWishlistStatistics: async (): Promise<WishlistStatistics> => {
    try {
      const response = await apiClient.get<WishlistStatistics>('/wishlists/statistics');
      return response.data.data!;
    } catch (error) {
      return {
        totalWishlists: 0,
        uniqueUsers: 0,
        uniqueTours: 0,
        averageWishlistSize: 0
      };
    }
  }
};

export default wishlistService;
