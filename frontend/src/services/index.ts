// Export all services
export { default as authService } from './authService';
export { default as tourService } from './tourService';
export { default as countryService } from './countryService';
export { default as bookingService } from './bookingService';
export { default as categoryService } from './categoryService';
export { default as userService } from './userService';
export { default as wishlistService } from './wishlistService';
export { default as loyaltyService } from './loyaltyService';
export { default as notificationService } from './notificationService';
export { default as recommendationService } from './recommendationService';
export { default as cancellationService } from './cancellationService';
export { default as contactService } from './contactService';
export { default as reviewService } from './reviewService';
export { default as partnerService } from './partnerService';
export { default as promotionService } from './promotionService';
export { default as destinationService } from './destinationService';
export { default as bannerService } from './bannerService';
export { apiClient } from './api';

// Export types
export type {
  TourResponse,
  PageResponse,
  TourSearchRequest,
  TourStatistics
} from './tourService';

export type {
  Country,
  Continent
} from './countryService';

export type {
  BookingResponse,
  BookingCreateRequest,
  BookingUpdateRequest,
  BookingStatistics,
  BookingStatus
} from './bookingService';

export type {
  CategoryResponse,
  CategoryCreateRequest,
  CategoryWithTourCount,
  CategoryStatus
} from './categoryService';

export type {
  ContactRequest,
  ContactResponse
} from './contactService';

export type {
  PromotionResponse
} from './promotionService';

export type {
  PopularDestinationResponse
} from './destinationService';

export type {
  Banner,
  BannerFormData
} from './bannerService';
