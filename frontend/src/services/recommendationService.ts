import { apiClient } from './api';
import type { TourResponse } from './tourService';

// Types
export interface UserPreference {
  userId: number;
  categories: string[];
  destinations: string[];
  priceRange: {
    min: number;
    max: number;
  };
  duration: string[];
  travelStyle: 'luxury' | 'comfort' | 'budget' | 'backpacker';
  interests: string[];
  seasonality: string[];
  groupSize: 'solo' | 'couple' | 'family' | 'group';
  accessibility: boolean;
  lastUpdated: string;
}

export interface RecommendationRequest {
  userId: number;
  limit?: number;
  excludeVisited?: boolean;
  includeSimilar?: boolean;
  context?: 'homepage' | 'wishlist' | 'booking' | 'search';
}

export interface RecommendationResponse {
  recommendations: TourRecommendation[];
  reason: string;
  confidence: number;
  algorithm: 'collaborative' | 'content-based' | 'hybrid' | 'trending';
}

export interface TourRecommendation {
  tour: TourResponse;
  score: number;
  reasons: string[];
  tags: string[];
  personalizedPrice?: number;
  urgency?: {
    type: 'limited_time' | 'low_availability' | 'price_drop' | 'seasonal';
    message: string;
    deadline?: string;
  };
}

export interface UserBehavior {
  userId: number;
  searchHistory: SearchBehavior[];
  viewHistory: ViewBehavior[];
  bookingHistory: BookingBehavior[];
  wishlistHistory: WishlistBehavior[];
  interactionScore: number;
  lastActive: string;
}

export interface SearchBehavior {
  query: string;
  filters: any;
  timestamp: string;
  resultsClicked: number[];
}

export interface ViewBehavior {
  tourId: number;
  duration: number; // seconds
  timestamp: string;
  source: string;
}

export interface BookingBehavior {
  tourId: number;
  bookingDate: string;
  completedDate?: string;
  rating?: number;
  review?: string;
  repeatBooking: boolean;
}

export interface WishlistBehavior {
  tourId: number;
  addedDate: string;
  removedDate?: string;
  convertedToBooking: boolean;
}

class RecommendationService {
  // Get personalized recommendations
  async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    try {
      const response = await apiClient.post<RecommendationResponse>('/recommendations/personalized', request);
      
      // Safe access to response data
      const data = response.data?.data || response.data;
      
      if (data && Array.isArray(data)) {
        // Backend returns array directly, convert to RecommendationResponse format
        return {
          recommendations: data.map((item: any) => ({
            tour: {
              id: item.id || 0,
              name: item.name || 'Unknown Tour',
              slug: item.slug || `tour-${item.id}`,
              price: item.price || 0,
              salePrice: item.salePrice || item.discountPrice,
              discountPrice: item.discountPrice || item.salePrice || item.price || 0,
              mainImage: item.mainImage || item.image || '/default-tour.jpg',
              images: item.images || [{ imageUrl: item.mainImage || item.image || '/default-tour.jpg' }],
              location: item.location || 'Vietnam',
              destination: item.destination,
              region: item.region,
              departureLocation: item.departureLocation,
              duration: item.duration || 1,
              maxPeople: item.maxPeople || 20,
              tourType: item.tourType || 'DOMESTIC',
              country: item.country,
              averageRating: item.averageRating || 4.5,
              totalReviews: item.totalReviews || 0,
              isFeatured: item.isFeatured || false,
              status: item.status || 'Active',
              category: item.category ? { 
                id: item.category.id,
                name: item.category.name,
                slug: item.category.slug 
              } : undefined
            },
            score: item.score || (item.averageRating ? item.averageRating / 5 : 0.8),
            reasons: item.reasons || [item.reason || 'Recommended for you'],
            tags: item.tags || [],
            personalizedPrice: item.personalizedPrice || item.price || 0
          })),
          totalCount: data.length,
          hasMore: false
        };
      }
      
      return data || this.getMockRecommendations(request);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      
      // Fallback to mock recommendations
      return this.getMockRecommendations(request);
    }
  }

  // Get trending tours
  async getTrendingTours(limit: number = 10): Promise<TourRecommendation[]> {
    try {
      const response = await apiClient.get<TourRecommendation[]>(`/recommendations/trending?limit=${limit}`);
      
      // Safe access to response data
      const data = response.data?.data || response.data;
      
      if (data && Array.isArray(data)) {
        // Backend returns array directly, convert to TourRecommendation format
        return data.map((item: any) => ({
          tour: {
            id: item.id || 0,
            name: item.name || 'Unknown Tour',
            slug: item.slug || `tour-${item.id}`,
            price: item.price || 0,
            salePrice: item.salePrice || item.discountPrice,
            discountPrice: item.discountPrice || item.salePrice || item.price || 0,
            mainImage: item.mainImage || item.image || '/default-tour.jpg',
            images: item.images || [{ imageUrl: item.mainImage || item.image || '/default-tour.jpg' }],
            location: item.location || 'Vietnam',
            destination: item.destination,
            region: item.region,
            departureLocation: item.departureLocation,
            duration: item.duration || 1,
            maxPeople: item.maxPeople || 20,
            tourType: item.tourType || 'DOMESTIC',
            country: item.country,
            averageRating: item.averageRating || 4.5,
            totalReviews: item.totalReviews || 0,
            isFeatured: item.isFeatured || false,
            status: item.status || 'Active',
            category: item.category ? { 
              id: item.category.id,
              name: item.category.name,
              slug: item.category.slug 
            } : undefined
          },
          score: item.score || item.rating || (item.averageRating ? item.averageRating / 5 : 0.85),
          reasons: ['Đang được quan tâm nhiều'],
          tags: ['trending'],
          personalizedPrice: item.price || 0
        }));
      }
      
      return data || this.getMockTrendingTours(limit);
    } catch (error) {
      console.error('Error getting trending tours:', error);
      return this.getMockTrendingTours(limit);
    }
  }

  // Get similar tours
  async getSimilarTours(tourId: number, limit: number = 5): Promise<TourRecommendation[]> {
    try {
      const response = await apiClient.get<TourRecommendation[]>(`/recommendations/similar/${tourId}?limit=${limit}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error getting similar tours:', error);
      return this.getMockSimilarTours(tourId, limit);
    }
  }

  // Update user preferences
  async updateUserPreferences(preferences: Partial<UserPreference>): Promise<UserPreference> {
    try {
      const response = await apiClient.put<UserPreference>(`/recommendations/preferences/${preferences.userId}`, preferences);
      return response.data.data!;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Get user preferences
  async getUserPreferences(userId: number): Promise<UserPreference | null> {
    try {
      const response = await apiClient.get<UserPreference>(`/recommendations/preferences/${userId}`);
      return response.data.data!;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  // Track user behavior
  async trackBehavior(behavior: Partial<UserBehavior>): Promise<void> {
    try {
      await apiClient.post('/recommendations/track', behavior);
    } catch (error) {
      console.error('Error tracking behavior:', error);
      // Don't throw - tracking should be non-blocking
    }
  }

  // Track tour view
  async trackTourView(userId: number, tourId: number, duration: number, source: string = 'unknown'): Promise<void> {
    const behavior: ViewBehavior = {
      tourId,
      duration,
      timestamp: new Date().toISOString(),
      source
    };

    await this.trackBehavior({
      userId,
      viewHistory: [behavior]
    });
  }

  // Track search
  async trackSearch(userId: number, query: string, filters: any, clickedResults: number[] = []): Promise<void> {
    const behavior: SearchBehavior = {
      query,
      filters,
      timestamp: new Date().toISOString(),
      resultsClicked: clickedResults
    };

    await this.trackBehavior({
      userId,
      searchHistory: [behavior]
    });
  }

  // Get recommendations for homepage
  async getHomepageRecommendations(userId: number): Promise<{
    forYou: TourRecommendation[];
    trending: TourRecommendation[];
    similar: TourRecommendation[];
    lastMinute: TourRecommendation[];
  }> {
    try {
      const [forYou, trending, similar, lastMinute] = await Promise.all([
        this.getRecommendations({ userId, limit: 8, context: 'homepage' }),
        this.getTrendingTours(6),
        this.getRecommendations({ userId, limit: 6, includeSimilar: true }),
        this.getLastMinuteDeals(6)
      ]);

      return {
        forYou: forYou?.recommendations || [],
        trending: trending || [],
        similar: similar?.recommendations || [],
        lastMinute: lastMinute || []
      };
    } catch (error) {
      console.error('Error getting homepage recommendations:', error);
      
      // Return mock data
      return {
        forYou: this.getMockRecommendations({ userId, limit: 8 }).recommendations,
        trending: this.getMockTrendingTours(6),
        similar: this.getMockSimilarTours(1, 6),
        lastMinute: this.getMockLastMinuteDeals(6)
      };
    }
  }

  // Get last minute deals
  async getLastMinuteDeals(limit: number = 6): Promise<TourRecommendation[]> {
    try {
      const response = await apiClient.get<TourRecommendation[]>(`/recommendations/last-minute?limit=${limit}`);
      
      // Safe access to response data
      const data = response.data?.data || response.data;
      
      if (data && Array.isArray(data)) {
        // Backend returns array directly, convert to TourRecommendation format
        return data.map((item: any) => ({
          tour: {
            id: item.id || 0,
            name: item.name || 'Unknown Tour',
            slug: item.slug || `tour-${item.id}`,
            price: item.price || 0,
            discountPrice: item.discountPrice || item.price || 0,
            mainImage: item.image || item.mainImage || '/default-tour.jpg',
            images: [{ imageUrl: item.image || item.mainImage || '/default-tour.jpg' }],
            location: item.location || 'Vietnam',
            duration: item.duration || 1,
            averageRating: item.averageRating || 4.5,
            totalReviews: item.totalReviews || 0,
            category: { name: item.category || 'Tour' }
          },
          score: item.discount || 0,
          reason: `Giảm ${item.discount || 20}%`,
          personalizedPrice: item.price || 0,
          originalPrice: item.originalPrice || item.price
        }));
      }
      
      return data || this.getMockLastMinuteDeals(limit);
    } catch (error) {
      return this.getMockLastMinuteDeals(limit);
    }
  }

  // Smart recommendations based on current context
  async getSmartRecommendations(userId: number, context: {
    currentTour?: number;
    searchQuery?: string;
    filters?: any;
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    weather?: string;
    location?: string;
  }): Promise<TourRecommendation[]> {
    try {
      const response = await apiClient.post<TourRecommendation[]>('/recommendations/smart', {
        userId,
        ...context
      });
      return response.data.data!;
    } catch (error) {
      return this.getMockSmartRecommendations(userId, context);
    }
  }

  // Mock data methods
  private getMockRecommendations(request: RecommendationRequest): RecommendationResponse {
    const mockTours = this.generateMockTours(request.limit || 10);
    
    return {
      recommendations: mockTours.map(tour => ({
        tour,
        score: Math.random() * 0.3 + 0.7, // 0.7-1.0
        reasons: this.generateReasons(tour),
        tags: this.generateTags(tour),
        personalizedPrice: tour.price * (0.9 + Math.random() * 0.2), // ±10%
        urgency: Math.random() > 0.7 ? {
          type: ['limited_time', 'low_availability', 'price_drop', 'seasonal'][Math.floor(Math.random() * 4)] as any,
          message: 'Chỉ còn 3 chỗ trống!',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        } : undefined
      })),
      reason: 'Dựa trên lịch sử tìm kiếm và sở thích của bạn',
      confidence: 0.85,
      algorithm: 'hybrid'
    };
  }

  private getMockTrendingTours(limit: number): TourRecommendation[] {
    const mockTours = this.generateMockTours(limit);
    
    return mockTours.map(tour => ({
      tour,
      score: Math.random() * 0.2 + 0.8, // 0.8-1.0
      reasons: ['Đang được quan tâm nhiều', 'Đánh giá cao từ khách hàng'],
      tags: ['trending', 'hot', 'popular'],
      urgency: {
        type: 'limited_time',
        message: 'Ưu đãi đặc biệt kết thúc trong 2 ngày!',
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    }));
  }

  private getMockSimilarTours(tourId: number, limit: number): TourRecommendation[] {
    const mockTours = this.generateMockTours(limit);
    
    return mockTours.map(tour => ({
      tour,
      score: Math.random() * 0.3 + 0.6, // 0.6-0.9
      reasons: ['Cùng khu vực', 'Thời gian tương tự', 'Hoạt động giống nhau'],
      tags: ['similar', 'recommended']
    }));
  }

  private getMockLastMinuteDeals(limit: number): TourRecommendation[] {
    const mockTours = this.generateMockTours(limit);
    
    return mockTours.map(tour => ({
      tour: {
        ...tour,
        discountPrice: tour.price * 0.7 // 30% off
      },
      score: Math.random() * 0.4 + 0.6,
      reasons: ['Giảm giá last minute', 'Khởi hành sớm'],
      tags: ['last-minute', 'discount', 'urgent'],
      urgency: {
        type: 'price_drop',
        message: 'Giảm 30% - Khởi hành tuần này!',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    }));
  }

  private getMockSmartRecommendations(userId: number, context: any): TourRecommendation[] {
    return this.getMockRecommendations({ userId, limit: 5 }).recommendations;
  }

  private generateMockTours(count: number): TourResponse[] {
    const mockTours: TourResponse[] = [];
    const destinations = ['Hạ Long Bay', 'Sapa', 'Hội An', 'Phú Quốc', 'Đà Nẵng', 'Tokyo', 'Seoul', 'Bangkok'];
    const categories = ['beach', 'mountain', 'city', 'culture', 'adventure', 'food'];
    
    for (let i = 0; i < count; i++) {
      const destination = destinations[Math.floor(Math.random() * destinations.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      mockTours.push({
        id: Date.now() + i,
        name: `Tour ${destination} ${Math.floor(Math.random() * 9) + 1} ngày`,
        slug: `tour-${destination.toLowerCase().replace(/\s+/g, '-')}-${i}`,
        description: `Khám phá vẻ đẹp tuyệt vời của ${destination} với những trải nghiệm độc đáo`,
        price: Math.floor(Math.random() * 5000000) + 1000000,
        discountPrice: Math.floor(Math.random() * 1000000) + 500000,
        duration: Math.floor(Math.random() * 7) + 1,
        location: destination,
        tourType: Math.random() > 0.7 ? 'INTERNATIONAL' : 'DOMESTIC',
        averageRating: Math.random() * 1 + 4, // 4.0-5.0
        totalReviews: Math.floor(Math.random() * 500) + 10,
        maxParticipants: Math.floor(Math.random() * 20) + 5,
        mainImage: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=800`,
        isFeatured: Math.random() > 0.8,
        category: {
          id: i,
          name: category,
          slug: category,
          description: `${category} tours`
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as TourResponse);
    }
    
    return mockTours;
  }

  private generateReasons(tour: TourResponse): string[] {
    const reasons = [
      'Dựa trên lịch sử tìm kiếm của bạn',
      'Phù hợp với sở thích đã chọn',
      'Đánh giá cao từ khách hàng',
      'Trong khoảng giá bạn quan tâm',
      'Thời gian phù hợp',
      'Điểm đến được yêu thích'
    ];
    
    return reasons.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  private generateTags(tour: TourResponse): string[] {
    const tags = ['recommended', 'popular', 'best-value', 'trending', 'family-friendly', 'adventure'];
    return tags.slice(0, Math.floor(Math.random() * 3) + 1);
  }
}

export default new RecommendationService();
