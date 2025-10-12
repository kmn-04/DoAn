import api from './api';

export interface ReviewCreateRequest {
  tourId: number;
  bookingId: number;
  rating: number;
  comment: string;
}

export interface ReviewUpdateRequest {
  rating: number;
  comment: string;
}

export interface UserSummary {
  id: number;
  name: string;
  avatarUrl?: string;
}

export interface TourSummary {
  id: number;
  name: string;
  slug: string;
  mainImage?: string;
}

export interface ReviewResponse {
  id: number;
  rating: number;
  comment?: string;
  status: string;
  helpfulCount: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: number;
  user: UserSummary;
  tour: TourSummary;
  bookingId: number;
}

export interface RatingDistribution {
  [key: number]: number;
}

export interface TourRatingStats {
  averageRating: number;
  ratingDistribution: RatingDistribution;
}

const reviewService = {
  /**
   * Create a new review
   */
  createReview: async (data: ReviewCreateRequest): Promise<ReviewResponse> => {
    const response = await api.post('/reviews', data);
    return response.data.data;
  },

  /**
   * Update own review
   */
  updateReview: async (reviewId: number, data: ReviewUpdateRequest): Promise<ReviewResponse> => {
    const response = await api.put(`/api/reviews/${reviewId}`, data);
    return response.data.data;
  },

  /**
   * Delete own review
   */
  deleteReview: async (reviewId: number): Promise<void> => {
    await api.delete(`/api/reviews/${reviewId}`);
  },

  /**
   * Get review by ID
   */
  getReviewById: async (reviewId: number): Promise<ReviewResponse> => {
    const response = await api.get(`/api/reviews/${reviewId}`);
    return response.data.data;
  },

  /**
   * Get reviews by tour ID
   */
  getReviewsByTourId: async (tourId: number): Promise<ReviewResponse[]> => {
    const response = await api.get(`/api/reviews/tour/${tourId}`);
    return response.data.data;
  },

  /**
   * Get reviews by tour ID with pagination
   */
  getReviewsByTourIdPaginated: async (
    tourId: number,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDirection: string = 'desc'
  ): Promise<{
    content: ReviewResponse[];
    totalElements: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    first: boolean;
    last: boolean;
    empty: boolean;
  }> => {
    const response = await api.get(`/api/reviews/tour/${tourId}/paginated`, {
      params: { page, size, sortBy, sortDirection }
    });
    return response.data.data;
  },

  /**
   * Get current user's reviews
   */
  getMyReviews: async (): Promise<ReviewResponse[]> => {
    const response = await api.get('/reviews/my-reviews');
    return response.data.data;
  },

  /**
   * Get reviews by user ID
   */
  getReviewsByUserId: async (userId: number): Promise<ReviewResponse[]> => {
    const response = await api.get(`/api/reviews/user/${userId}`);
    return response.data.data;
  },

  /**
   * Vote a review as helpful
   */
  voteHelpful: async (reviewId: number): Promise<ReviewResponse> => {
    const response = await api.post(`/api/reviews/${reviewId}/helpful`);
    return response.data.data;
  },

  /**
   * Check if user can review a tour
   */
  canReviewTour: async (tourId: number, bookingId: number): Promise<boolean> => {
    const response = await api.get('/reviews/can-review', {
      params: { tourId, bookingId }
    });
    return response.data.data.canReview;
  },

  /**
   * Get review by booking ID
   */
  getReviewByBookingId: async (bookingId: number): Promise<ReviewResponse | null> => {
    const response = await api.get(`/api/reviews/booking/${bookingId}`);
    return response.data.data;
  },

  /**
   * Get tour rating statistics
   */
  getTourRatingStats: async (tourId: number): Promise<TourRatingStats> => {
    const response = await api.get(`/api/reviews/tour/${tourId}/stats`);
    return response.data.data;
  },
};

export default reviewService;

